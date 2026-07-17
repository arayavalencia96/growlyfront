import type { IApiResponse } from "@/common/interfaces/api.interface";
import type { GoalCurrency } from "@/modules/goals/interfaces/goals.interface";

export const INVESTMENT_OPERATION_TYPES = ["buy", "sell"] as const;
export type InvestmentOperationType =
  (typeof INVESTMENT_OPERATION_TYPES)[number];

export interface IInvestmentOperation {
  id: string;
  goalId: string;
  userId: string;
  platform: string;
  ticker: string;
  type: InvestmentOperationType;
  operationDate: string;
  quantity: number;
  unitPrice: number;
  fees: number;
  grossAmount: number;
  netAmount: number;
  currency: GoalCurrency;
  exchangeRateArsPerUsd: number | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface IInvestmentOperationPayload {
  goalId: string;
  platform: string;
  ticker: string;
  type: InvestmentOperationType;
  operationDate: string;
  quantity: number;
  unitPrice: number;
  fees: number;
  currency: GoalCurrency;
  exchangeRateArsPerUsd?: number | null;
  notes?: string | null;
}

export type InvestmentOperationUpdatePayload = Omit<
  IInvestmentOperationPayload,
  "goalId"
>;

export interface IInvestmentOperationFormValues {
  platform: string;
  ticker: string;
  type: InvestmentOperationType;
  operationDate: string;
  quantity: number;
  unitPrice: number;
  fees: number;
  currency: GoalCurrency;
  exchangeRateArsPerUsd: number;
  notes: string;
}

export interface IInvestmentOperationsService {
  getByGoal(goalId: string): Promise<IApiResponse<IInvestmentOperation[]>>;
  create(
    payload: IInvestmentOperationPayload,
  ): Promise<IApiResponse<IInvestmentOperation>>;
  update(
    id: string,
    payload: InvestmentOperationUpdatePayload,
  ): Promise<IApiResponse<IInvestmentOperation>>;
  remove(id: string): Promise<IApiResponse<IInvestmentOperation>>;
}

export interface IInvestmentOperationFormProps {
  goalId: string;
  defaultCurrency: GoalCurrency;
  operation?: IInvestmentOperation;
  isSubmitting: boolean;
  onSubmit(payload: IInvestmentOperationPayload): Promise<void>;
  onCancel(): void;
}

export interface IInvestmentOperationsListProps {
  operations: IInvestmentOperation[];
  onEdit(operation: IInvestmentOperation): void;
  onDelete(operation: IInvestmentOperation): void;
}
