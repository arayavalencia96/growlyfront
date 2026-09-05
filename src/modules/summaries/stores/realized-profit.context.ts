import { createContext, useContext } from "react";
import type { IRealizedProfitDetail } from "@/modules/summaries/interfaces/summaries.interface";

export interface IRealizedProfitStore {
  detailsByGoalId: Readonly<Record<string, IRealizedProfitDetail[]>>;
  setDetails(goalId: string, details: IRealizedProfitDetail[]): void;
}

export const RealizedProfitStoreContext =
  createContext<IRealizedProfitStore | null>(null);

export function useRealizedProfitStore(): IRealizedProfitStore {
  const store = useContext(RealizedProfitStoreContext);
  if (!store)
    throw new Error(
      "useRealizedProfitStore must be used within RealizedProfitStoreProvider",
    );
  return store;
}
