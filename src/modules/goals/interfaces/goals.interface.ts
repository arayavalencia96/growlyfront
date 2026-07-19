import type { IApiResponse } from "@/common/interfaces/api.interface";

export const GOAL_TYPES = ["long_term", "short_term", "medium_term"] as const;
export const GOAL_STATUSES = ["active", "paused", "completed"] as const;
export const GOAL_CURRENCIES = ["ARS", "USD"] as const;
export const GOAL_TRACKING_MODES = [
  "from_scratch",
  "existing_portfolio",
] as const;

export type GoalType = (typeof GOAL_TYPES)[number];
export type GoalStatus = (typeof GOAL_STATUSES)[number];
export type GoalCurrency = (typeof GOAL_CURRENCIES)[number];
export type GoalTrackingMode = (typeof GOAL_TRACKING_MODES)[number];

export interface IOpeningCashBalance {
  platform: string;
  currency: GoalCurrency;
  amount: number;
  exchangeRateArsPerUsd?: number | null;
}

export interface IOpeningPosition {
  platform: string;
  ticker: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  currency: GoalCurrency;
  exchangeRateArsPerUsd?: number | null;
}

export interface IGoal {
  id: string;
  userId: string;
  name: string;
  type: GoalType;
  targetAmount: number;
  currency: GoalCurrency;
  startDate: string;
  endDate: string | null;
  status: GoalStatus;
  trackingMode: GoalTrackingMode | "legacy";
  openingCashBalances: IOpeningCashBalance[];
  openingPositions: IOpeningPosition[];
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface IGoalPayload {
  name: string;
  type: GoalType;
  targetAmount: number;
  currency: GoalCurrency;
  startDate?: string;
  endDate?: string | null;
  status: GoalStatus;
  trackingMode?: GoalTrackingMode;
  openingCashBalances?: IOpeningCashBalance[];
  openingPositions?: IOpeningPosition[];
  notes?: string | null;
}

export interface IGoalFormValues {
  name: string;
  type: GoalType;
  targetAmount: number;
  currency: GoalCurrency;
  startDate: string;
  endDate: string;
  status: GoalStatus;
  trackingMode: GoalTrackingMode;
  openingCashBalances: Array<
    Omit<IOpeningCashBalance, "exchangeRateArsPerUsd"> & {
      exchangeRateArsPerUsd: number;
    }
  >;
  openingPositions: Array<
    Omit<IOpeningPosition, "exchangeRateArsPerUsd"> & {
      exchangeRateArsPerUsd: number;
    }
  >;
  notes: string;
}

export interface IGoalFilters {
  search?: string;
  type?: GoalType;
  status?: GoalStatus;
  currency?: GoalCurrency;
}

export interface IGoalsService {
  getAll(filters?: IGoalFilters): Promise<IApiResponse<IGoal[]>>;
  getById(id: string): Promise<IApiResponse<IGoal>>;
  create(payload: IGoalPayload): Promise<IApiResponse<IGoal>>;
  update(
    id: string,
    payload: Partial<IGoalPayload>,
  ): Promise<IApiResponse<IGoal>>;
  remove(id: string): Promise<IApiResponse<IGoal>>;
}

export interface IGoalFormProps {
  goal?: IGoal;
  isSubmitting: boolean;
  onSubmit(payload: IGoalPayload): Promise<void>;
  onCancel(): void;
}

export interface IGoalCardProps {
  goal: IGoal;
  onEdit(goal: IGoal): void;
  onDelete(goal: IGoal): void;
}
