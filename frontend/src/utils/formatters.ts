export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const calculatePercentage = (current: number, target: number): number => {
  if (!target || target === 0) return 0;
  return (current / target) * 100;
};

export interface CategorizedExpenseItem {
  category: string;
  amount: number;
  [key: string]: any;
}

export const sumByCategory = (expenses: CategorizedExpenseItem[]): Record<string, number> => {
  return expenses.reduce<Record<string, number>>((acc, expense) => {
    const { category, amount } = expense;
    acc[category] = (acc[category] || 0) + (Number(amount) || 0);
    return acc;
  }, {});
};

export const formatDate = (date: string | number | Date): string => {
  const d = new Date(date);
  if (isNaN(d.getTime())) return String(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export const groupByCategory = <T extends { category: string }>(expenses: T[]): Record<string, T[]> => {
  return expenses.reduce<Record<string, T[]>>((acc, expense) => {
    const { category } = expense;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(expense);
    return acc;
  }, {});
};
