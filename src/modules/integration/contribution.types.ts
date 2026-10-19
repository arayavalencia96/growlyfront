import type { GoalCurrency } from "@/modules/goals/interfaces/goals.interface";
import type { GoalReference } from "@/common/interfaces/goal-reference.interface";

export interface CashyContributionPreview {
  id: string;
  status: "prepared";
  source: "cashy";
  goalId: string;
  linkId: string;
  allocationId: string;
  allocationVersion: number;
  period: string;
  platform: string;
  movementDate: string;
  currency: GoalCurrency;
  amountMinor: number;
  allocationAmountMinor: number;
  exchangeRateArsPerUsd: number;
  availableMinor: number;
  expiresAt: string;
}

export interface CashyContributionPreviewPayload {
  goalId: string;
  amount: number;
  currency: GoalCurrency;
  movementDate: string;
  platform: string;
  exchangeRateArsPerUsd?: number;
}

export interface ContributionConfirmPayload {
  previewId: string;
  notes?: string;
  valuationExchangeRateArsPerUsd?: number;
}
export interface ContributionJobView {
  goal?: GoalReference;
  platform: string;
  movementDate: string;
  notes: string;
  originalAmountMinor: number;
  originalAllocationAmountMinor: number;
  revision: number;
  exchangeRateArsPerUsd: number;
  id: string;
  status:
    | "pending"
    | "confirmed"
    | "cancelled"
    | "reconciliation-required"
    | "voided";
  goalId: string;
  movementId: string;
  amountMinor: number;
  currency: "ARS" | "USD";
  allocationAmountMinor: number;
  period: string;
  message: string;
}
export interface ContributionAdjustmentPayload {
  id: string;
  expectedRevision: number;
  kind: "edit" | "void";
  amount?: number;
  exchangeRateArsPerUsd?: number;
  reason: string;
}
export interface ContributionAdjustmentView {
  beforeAmountMinor: number;
  beforeAllocationAmountMinor: number;
  id: string;
  contributionId: string;
  kind: "edit" | "void";
  status: "pending" | "applied" | "rejected";
  amountMinor: number;
  allocationAmountMinor: number;
  reason: string;
  message: string;
  createdAt: string;
}
