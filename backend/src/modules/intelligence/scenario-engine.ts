/**
 * FinTrack Scenario Simulation Engine
 * Deterministically simulates "What If" financial decisions with zero latency.
 */

export interface SimulationParams {
  baselineMonthlyIncome: number;
  baselineMonthlyExpenses: number;
  baselineLiquidCash: number;
  additionalMonthlySavings?: number;
  expenseReductionPercent?: number; // e.g. 10 for 10% cut
  incomeChangePercent?: number;      // e.g. -10 for 10% drop, +15 for 15% raise
  targetGoal?: {
    id: string;
    title: string;
    remainingAmount: number;
    currentMonthlyContribution: number;
    currentMonthsToTarget: number;
  };
}

export interface SimulationResult {
  newMonthlyIncome: number;
  newMonthlyExpenses: number;
  newMonthlySurplus: number;
  baselineSurplus: number;
  surplusDelta: number;
  baselineRunwayMonths: number;
  newRunwayMonths: number;
  runwayDeltaMonths: number;
  projectedOneYearNetWorthDelta: number;
  projectedThreeYearNetWorthDelta: number;
  goalSimulation?: {
    goalTitle: string;
    oldMonthsRemaining: number;
    newMonthsRemaining: number;
    monthsSaved: number;
    projectedDateIso: string;
  };
}

/**
 * Executes deterministic scenario simulation.
 */
export function simulateFinancialScenario(params: SimulationParams): SimulationResult {
  const {
    baselineMonthlyIncome,
    baselineMonthlyExpenses,
    baselineLiquidCash,
    additionalMonthlySavings = 0,
    expenseReductionPercent = 0,
    incomeChangePercent = 0,
    targetGoal
  } = params;

  // 1. Calculate simulated income & expenses
  const incomeMultiplier = 1 + (incomeChangePercent / 100);
  const expenseMultiplier = 1 - (expenseReductionPercent / 100);

  const newMonthlyIncome = Math.round(baselineMonthlyIncome * incomeMultiplier);
  const newMonthlyExpenses = Math.round(baselineMonthlyExpenses * expenseMultiplier);

  // 2. Net surplus calculations
  const baselineSurplus = baselineMonthlyIncome - baselineMonthlyExpenses;
  const newMonthlySurplus = newMonthlyIncome - newMonthlyExpenses - additionalMonthlySavings;
  const surplusDelta = newMonthlySurplus - baselineSurplus;

  // 3. Cash Runway calculations
  const baselineRunwayMonths = baselineMonthlyExpenses > 0
    ? Number((baselineLiquidCash / baselineMonthlyExpenses).toFixed(1))
    : 24;

  const effectiveExpenses = Math.max(1, newMonthlyExpenses);
  const newRunwayMonths = Number((baselineLiquidCash / effectiveExpenses).toFixed(1));
  const runwayDeltaMonths = Number((newRunwayMonths - baselineRunwayMonths).toFixed(1));

  // 4. Multi-year Net Worth Deltas
  const projectedOneYearNetWorthDelta = (surplusDelta + additionalMonthlySavings) * 12;
  const projectedThreeYearNetWorthDelta = (surplusDelta + additionalMonthlySavings) * 36;

  // 5. Goal Simulation if target goal is present
  let goalSimulation: SimulationResult['goalSimulation'] | undefined;
  if (targetGoal && targetGoal.remainingAmount > 0) {
    const oldContrib = Math.max(1, targetGoal.currentMonthlyContribution || 5000);
    const newContrib = oldContrib + additionalMonthlySavings + Math.max(0, surplusDelta);

    const oldMonths = targetGoal.currentMonthsToTarget || Math.ceil(targetGoal.remainingAmount / oldContrib);
    const newMonths = Math.max(1, Math.ceil(targetGoal.remainingAmount / Math.max(1, newContrib)));
    const monthsSaved = Math.max(0, oldMonths - newMonths);

    const targetDate = new Date();
    targetDate.setMonth(targetDate.getMonth() + newMonths);

    goalSimulation = {
      goalTitle: targetGoal.title,
      oldMonthsRemaining: oldMonths,
      newMonthsRemaining: newMonths,
      monthsSaved,
      projectedDateIso: targetDate.toISOString()
    };
  }

  return {
    newMonthlyIncome,
    newMonthlyExpenses,
    newMonthlySurplus,
    baselineSurplus,
    surplusDelta,
    baselineRunwayMonths,
    newRunwayMonths,
    runwayDeltaMonths,
    projectedOneYearNetWorthDelta,
    projectedThreeYearNetWorthDelta,
    goalSimulation
  };
}
