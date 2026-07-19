import type { IApiResponse } from "@/common/interfaces/api.interface";
import type { GoalCurrency } from "@/modules/goals/interfaces/goals.interface";

export const INVESTMENT_OPERATION_TYPES = ["buy", "sell"] as const;
export type InvestmentOperationType =
  (typeof INVESTMENT_OPERATION_TYPES)[number];

export const INVESTMENT_PLATFORMS = [
  "IOL",
  "BULL MARKET",
  "NEXO",
  "BINGX",
  "COCOS",
  "BALANZ",
  "BINANCE",
  "ETORO",
  "FIWIND",
] as const;
export type InvestmentPlatform = (typeof INVESTMENT_PLATFORMS)[number];
export const CUSTOM_INVESTMENT_PLATFORM = "OTHER" as const;
export const INVESTMENT_PLATFORM_SELECTIONS = [
  ...INVESTMENT_PLATFORMS,
  CUSTOM_INVESTMENT_PLATFORM,
] as const;
export type InvestmentPlatformSelection =
  (typeof INVESTMENT_PLATFORM_SELECTIONS)[number];

export const INVESTMENT_PLATFORM_LABELS: Readonly<
  Record<InvestmentPlatformSelection, string>
> = {
  IOL: "IOL",
  "BULL MARKET": "Bull Market",
  NEXO: "NEXO",
  BINGX: "BingX",
  COCOS: "Cocos",
  BALANZ: "Balanz",
  BINANCE: "Binance",
  ETORO: "eToro",
  FIWIND: "Fiwind",
  OTHER: "Otro",
};

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
  totalAmount: number;
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
  totalAmount: number;
  currency: GoalCurrency;
  exchangeRateArsPerUsd?: number | null;
  notes?: string | null;
}

export type InvestmentOperationUpdatePayload = Omit<
  IInvestmentOperationPayload,
  "goalId"
>;

export interface IInvestmentOperationFormValues {
  platformOption: InvestmentPlatformSelection;
  customPlatform: string;
  ticker: string;
  type: InvestmentOperationType;
  operationDate: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
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
