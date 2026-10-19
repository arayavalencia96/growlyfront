import type { GoalReference } from "@/common/interfaces/goal-reference.interface";

export interface TransferEndpoint {
  goalId: string;
  platform: string;
}
interface TransferBase {
  idempotencyKey: string;
  source: TransferEndpoint;
  destination: TransferEndpoint;
  fee: string;
  notes: string;
}
export type TransferInput = TransferBase &
  (
    | { kind: "cash"; currency: "ARS" | "USD"; amount: string }
    | { kind: "crypto"; assetId: string; quantity: string }
  );
export interface TransferSource {
  key: string;
  kind: "cash" | "crypto";
  platform: string;
  unit: string;
  label: string;
  scale: number;
  availableUnits: string;
}
export interface TransferContext {
  enabled: boolean;
  goals: { id: string; name: string }[];
  sources: TransferSource[];
  platforms: string[];
  warnings: string[];
  consultedAt: string;
}
export interface TransferSetup {
  stage: number;
  enabled: boolean;
}
export interface TransferPreview {
  availableUnits: string;
  debitUnits: string;
  remainingUnits: string;
  unitScale: number;
  consultedAt: string;
  registered: false;
}
export interface TransferRecord {
  processing?: boolean;
  goals?: { source: GoalReference; destination: GoalReference };
  id: string;
  userId: string;
  status: "pending" | "completed" | "rejected";
  rejectionCode?: string;
  acceptedAt: string;
  effectiveAt: string;
  completedAt?: string;
  bookValue?: {
    delivered: TransferBookValue;
    commission: TransferBookValue;
  };
  intent: {
    idempotencyKey: string;
    kind: "cash" | "crypto";
    source: TransferEndpoint;
    destination: TransferEndpoint;
    unit: string;
    unitScale: number;
    quantityUnits: string;
    feeUnits: string;
    notes: string;
  };
}
export interface TransferBookValue {
  ars: string;
  usd: string;
  hasUnconvertedAmounts: boolean;
}
export interface PendingTransfer {
  key: string;
  goalId: string;
  recordId?: string;
}
