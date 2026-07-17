import type { IApiResponse } from "@/common/interfaces/api.interface";
import type { GoalCurrency } from "@/modules/goals/interfaces/goals.interface";

export interface IMoneyTotals {
  ars: number;
  usd: number;
}

export interface IOpenPositionSummary {
  platform: string;
  ticker: string;
  quantity: number;
  averageCost: IMoneyTotals;
  invested: IMoneyTotals;
}

export interface IGoalSummary {
  goalId: string;
  userId: string;
  goalName: string;
  goalCurrency: GoalCurrency;
  targetAmount: number;
  contributions: IMoneyTotals;
  withdrawals: IMoneyTotals;
  netContributions: IMoneyTotals;
  totalBuyCost: IMoneyTotals;
  totalSellProceeds: IMoneyTotals;
  realizedProfit: IMoneyTotals;
  cashBalance: IMoneyTotals;
  openPositionValueAtCost: IMoneyTotals;
  portfolioBookValue: IMoneyTotals;
  progressPercentage: number;
  openPositionsCount: number;
  operationsCount: number;
  hasUnconvertedAmounts: boolean;
  openPositions: IOpenPositionSummary[];
}

export interface ISummariesService {
  getByGoal(goalId: string): Promise<IApiResponse<IGoalSummary>>;
}

export interface IGoalSummaryPanelProps {
  summary: IGoalSummary;
}
