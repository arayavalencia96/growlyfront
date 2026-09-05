import { type ReactNode, useCallback, useMemo, useState } from "react";
import type { IRealizedProfitDetail } from "@/modules/summaries/interfaces/summaries.interface";
import { RealizedProfitStoreContext } from "@/modules/summaries/stores/realized-profit.context";

export function RealizedProfitStoreProvider({
  children,
}: Readonly<{ children: ReactNode }>) {
  const [detailsByGoalId, setDetailsByGoalId] = useState<
    Record<string, IRealizedProfitDetail[]>
  >({});
  const setDetails = useCallback(
    (goalId: string, details: IRealizedProfitDetail[]) => {
      setDetailsByGoalId((current) => ({ ...current, [goalId]: details }));
    },
    [],
  );
  const value = useMemo(
    () => ({ detailsByGoalId, setDetails }),
    [detailsByGoalId, setDetails],
  );

  return (
    <RealizedProfitStoreContext.Provider value={value}>
      {children}
    </RealizedProfitStoreContext.Provider>
  );
}
