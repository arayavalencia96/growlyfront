import { type ReactNode, useEffect, useMemo, useState } from "react";

import { formatMoney } from "@/utils/format.utils";

import {
  BalancePrivacyContext,
  useBalancePrivacy,
} from "@/common/components/balance-privacy.context";

import { BALANCE_VISIBILITY_KEY } from "@/common/services/session.service";

import type { GoalCurrency } from "@/modules/goals/interfaces/goals.interface";

function readVisibility(): boolean {
  return localStorage.getItem(BALANCE_VISIBILITY_KEY) !== "hidden";
}

export function BalancePrivacyProvider({ children }: { readonly children: ReactNode }) {
  const [areBalancesVisible, setAreBalancesVisible] = useState(readVisibility);

  useEffect(() => {
    const synchronizeVisibility = (event: StorageEvent) => {
      if (event.key === BALANCE_VISIBILITY_KEY) {
        setAreBalancesVisible(event.newValue !== "hidden");
      }
    };
    window.addEventListener("storage", synchronizeVisibility);
    return () => window.removeEventListener("storage", synchronizeVisibility);
  }, []);

  const contextValue = useMemo(
    () => ({
      areBalancesVisible,
      toggleBalancesVisibility: () => {
        setAreBalancesVisible((current) => {
          const next = !current;
          localStorage.setItem(
            BALANCE_VISIBILITY_KEY,
            next ? "visible" : "hidden",
          );
          return next;
        });
      },
    }),
    [areBalancesVisible],
  );

  return (
    <BalancePrivacyContext.Provider value={contextValue}>
      {children}
    </BalancePrivacyContext.Provider>
  );
}

export function SensitiveMoney({
  amount,
  currency,
  prefix = "",
}: {
  readonly amount: number;
  readonly currency: GoalCurrency;
  readonly prefix?: string;
}) {
  const { areBalancesVisible } = useBalancePrivacy();
  return (
    <>{areBalancesVisible ? prefix + formatMoney(amount, currency) : "****"}</>
  );
}
