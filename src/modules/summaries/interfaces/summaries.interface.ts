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

export interface ICashBalanceSummary {
  platform: string;
  currency: GoalCurrency;
  amount: number;
}

export interface IPlatformBookValue {
  platform: string;
  value: IMoneyTotals;
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
  cashBalances: ICashBalanceSummary[];
  platformBookValues: IPlatformBookValue[];
  openPositionValueAtCost: IMoneyTotals;
  portfolioBookValue: IMoneyTotals;
  progressPercentage: number;
  openPositionsCount: number;
  operationsCount: number;
  hasUnconvertedAmounts: boolean;
  openPositions: IOpenPositionSummary[];
}

export interface IPortfolioSummary {
  totalBookValue: IMoneyTotals;
  platformBookValues: IPlatformBookValue[];
  goalsCount: number;
  hasUnconvertedAmounts: boolean;
}

export interface ISummariesService {
  getByGoal(goalId: string): Promise<IApiResponse<IGoalSummary>>;
  getPortfolio(): Promise<IApiResponse<IPortfolioSummary>>;
}

export interface IGoalSummaryPanelProps {
  summary: IGoalSummary;
  onCashBalanceClick(): void;
}
