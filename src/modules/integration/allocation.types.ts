export interface MonthlyAllocation {
  legacyCommittedMinor?: number;
  legacyReviewRequired?: boolean;
  id: string;
  period: string;
  currency: "ARS";
  assignedMinor: number;
  contributedMinor: number;
  reservedMinor: number;
  availableMinor: number;
  excessMinor: number;
  version: number;
}

export type AllocationState =
  | { status: "not-configured"; period: string }
  | {
      status: "available";
      allocation: MonthlyAllocation;
      budgetDefined: boolean;
    };

export type LinkedAllocationState =
  | AllocationState
  | {
      status: "not-linked" | "access-paused" | "disabled";
    };
