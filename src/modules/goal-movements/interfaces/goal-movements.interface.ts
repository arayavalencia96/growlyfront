import type { IApiResponse } from "@/common/interfaces/api.interface";
import type { GoalCurrency } from "@/modules/goals/interfaces/goals.interface";
import type { InvestmentPlatformSelection } from "@/modules/investment-operations/interfaces/investment-operations.interface";

export const GOAL_MOVEMENT_TYPES = ["contribution", "withdrawal"] as const;
export type GoalMovementType = (typeof GOAL_MOVEMENT_TYPES)[number];

export interface IGoalMovement {
  id: string;
  goalId: string;
  userId: string;
  type: GoalMovementType;
  amount: number;
  currency: GoalCurrency;
  movementDate: string;
  exchangeRateArsPerUsd: number | null;
  platform: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface IGoalMovementPayload {
  goalId: string;
  type: GoalMovementType;
  amount: number;
  currency: GoalCurrency;
  movementDate: string;
  exchangeRateArsPerUsd?: number | null;
  platform: string;
  notes?: string | null;
}

export interface IGoalMovementFormValues {
  type: GoalMovementType;
  amount: number;
  currency: GoalCurrency;
  movementDate: string;
  exchangeRateArsPerUsd: number;
  platformOption: InvestmentPlatformSelection;
  customPlatform: string;
  notes: string;
}

export interface IGoalMovementsService {
  getByGoal(goalId: string): Promise<IApiResponse<IGoalMovement[]>>;
  create(payload: IGoalMovementPayload): Promise<IApiResponse<IGoalMovement>>;
  update(
    id: string,
    payload: Omit<IGoalMovementPayload, "goalId">,
  ): Promise<IApiResponse<IGoalMovement>>;
  remove(id: string): Promise<IApiResponse<IGoalMovement>>;
}

export interface IGoalMovementFormProps {
  goalId: string;
  defaultCurrency: GoalCurrency;
  movement?: IGoalMovement;
  isSubmitting: boolean;
  onSubmit(payload: IGoalMovementPayload): Promise<void>;
  onCancel(): void;
}
