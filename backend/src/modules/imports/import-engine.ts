import crypto from 'crypto';
import { toMinorUnits } from '../../utils/money.js';

export interface RawImportRow {
  [key: string]: string | number;
}

export interface ColumnMapping {
  dateField: string;
  descriptionField: string;
  amountField?: string;
  inflowField?: string;
  outflowField?: string;
  categoryField?: string;
}

export interface NormalizedImportTransaction {
  id: string;
  date: string;
  description: string;
  amountMinor: number;
  type: 'expense' | 'income';
  category?: string;
  fingerprint: string;
  isDuplicate: boolean;
  duplicateConfidence?: number;
  isValid: boolean;
  validationError?: string;
}

export interface ImportPreviewReport {
  totalRows: number;
  validRows: number;
  duplicateRows: number;
  invalidRows: number;
  transactions: NormalizedImportTransaction[];
}

/**
 * Computes an immutable cryptographic fingerprint for duplicate detection.
 */
export function generateTransactionFingerprint(
  accountId: string,
  dateIso: string,
  amountMinor: number,
  description: string
): string {
  // Normalize date to YYYY-MM-DD
  const dateKey = dateIso.substring(0, 10);
  const descKey = description.toLowerCase().trim().replace(/[^a-z0-9]/g, '');
  const data = `${accountId}|${dateKey}|${amountMinor}|${descKey}`;
  return crypto.createHash('sha256').update(data).digest('hex');
}

/**
 * Parses CSV raw string into records.
 */
export function parseCsvString(csvContent: string): RawImportRow[] {
  const lines = csvContent.trim().split(/\r?\n/);
  if (lines.length < 2) return [];

  // Parse header
  const headers = lines[0].split(',').map(h => h.trim().replace(/^["']|["']$/g, ''));
  const rows: RawImportRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Simple CSV parser supporting quotes
    const values: string[] = [];
    let inQuotes = false;
    let currentVal = '';

    for (let charIndex = 0; charIndex < line.length; charIndex++) {
      const char = line[charIndex];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(currentVal.trim().replace(/^["']|["']$/g, ''));
        currentVal = '';
      } else {
        currentVal += char;
      }
    }
    values.push(currentVal.trim().replace(/^["']|["']$/g, ''));

    const rowObj: RawImportRow = {};
    headers.forEach((header, index) => {
      rowObj[header] = values[index] !== undefined ? values[index] : '';
    });
    rows.push(rowObj);
  }

  return rows;
}

/**
 * Automatically infers column mappings from headers.
 */
export function autoDetectColumnMapping(headers: string[]): ColumnMapping {
  const lower = headers.map(h => h.toLowerCase());

  const dateIdx = lower.findIndex(h => h.includes('date') || h.includes('time'));
  const descIdx = lower.findIndex(h => h.includes('desc') || h.includes('narration') || h.includes('particular') || h.includes('memo') || h.includes('merchant'));
  const amtIdx = lower.findIndex(h => h === 'amount' || h.includes('amount') || h.includes('transaction amount'));
  const inflowIdx = lower.findIndex(h => h.includes('credit') || h.includes('deposit') || h.includes('inflow'));
  const outflowIdx = lower.findIndex(h => h.includes('debit') || h.includes('withdrawal') || h.includes('outflow'));
  const catIdx = lower.findIndex(h => h.includes('category') || h.includes('tag'));

  return {
    dateField: headers[dateIdx] || headers[0] || 'Date',
    descriptionField: headers[descIdx] || headers[1] || 'Description',
    amountField: amtIdx !== -1 ? headers[amtIdx] : undefined,
    inflowField: inflowIdx !== -1 ? headers[inflowIdx] : undefined,
    outflowField: outflowIdx !== -1 ? headers[outflowIdx] : undefined,
    categoryField: catIdx !== -1 ? headers[catIdx] : undefined,
  };
}

/**
 * Normalizes rows, checks against existing fingerprints, and creates an audit preview.
 */
export function generateImportPreview(
  rows: RawImportRow[],
  mapping: ColumnMapping,
  accountId: string,
  existingFingerprints: Set<string>
): ImportPreviewReport {
  const transactions: NormalizedImportTransaction[] = [];
  let validRows = 0;
  let duplicateRows = 0;
  let invalidRows = 0;

  for (let index = 0; index < rows.length; index++) {
    const row = rows[index];
    const rawDate = String(row[mapping.dateField] || '').trim();
    const rawDesc = String(row[mapping.descriptionField] || '').trim();

    // Parse date
    let dateIso = '';
    const parsedDate = new Date(rawDate);
    if (!isNaN(parsedDate.getTime())) {
      dateIso = parsedDate.toISOString();
    } else {
      // Try DD/MM/YYYY
      const parts = rawDate.split(/[-/.]/);
      if (parts.length === 3) {
        const d = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
        if (!isNaN(d.getTime())) dateIso = d.toISOString();
      }
    }

    // Determine amount and flow type
    let amountMinor = 0;
    let type: 'expense' | 'income' = 'expense';

    if (mapping.amountField && row[mapping.amountField] !== undefined) {
      const amtStr = String(row[mapping.amountField]).replace(/,/g, '');
      const rawNum = parseFloat(amtStr);
      if (!isNaN(rawNum)) {
        if (rawNum < 0) {
          type = 'expense';
          amountMinor = toMinorUnits(Math.abs(rawNum));
        } else {
          type = 'income';
          amountMinor = toMinorUnits(rawNum);
        }
      }
    } else if (mapping.outflowField && row[mapping.outflowField]) {
      const val = parseFloat(String(row[mapping.outflowField]).replace(/,/g, ''));
      if (!isNaN(val) && val > 0) {
        type = 'expense';
        amountMinor = toMinorUnits(val);
      }
    } else if (mapping.inflowField && row[mapping.inflowField]) {
      const val = parseFloat(String(row[mapping.inflowField]).replace(/,/g, ''));
      if (!isNaN(val) && val > 0) {
        type = 'income';
        amountMinor = toMinorUnits(val);
      }
    }

    const isValid = !!dateIso && !!rawDesc && amountMinor > 0;
    let validationError: string | undefined;
    if (!dateIso) validationError = 'Invalid or unparseable date format';
    else if (!rawDesc) validationError = 'Missing transaction description';
    else if (amountMinor <= 0) validationError = 'Zero or invalid transaction amount';

    const fingerprint = isValid ? generateTransactionFingerprint(accountId, dateIso, amountMinor, rawDesc) : '';
    const isDuplicate = existingFingerprints.has(fingerprint);

    if (!isValid) invalidRows++;
    else if (isDuplicate) duplicateRows++;
    else validRows++;

    transactions.push({
      id: `import_${index + 1}`,
      date: dateIso || new Date().toISOString(),
      description: rawDesc || 'Unknown Transaction',
      amountMinor,
      type,
      category: mapping.categoryField ? String(row[mapping.categoryField] || '') : undefined,
      fingerprint,
      isDuplicate,
      duplicateConfidence: isDuplicate ? 98 : undefined,
      isValid,
      validationError
    });
  }

  return {
    totalRows: rows.length,
    validRows,
    duplicateRows,
    invalidRows,
    transactions
  };
}
