import { type ReactNode, useEffect, useState } from "react";
import {
  BalancePrivacyContext,
  useBalancePrivacy,
} from "@/common/components/balance-privacy.context";
import { BALANCE_VISIBILITY_KEY } from "@/common/services/session.service";
import type { GoalCurrency } from "@/modules/goals/interfaces/goals.interface";
import { formatMoney } from "@/utils/format.utils";

function readVisibility(): boolean {
  return localStorage.getItem(BALANCE_VISIBILITY_KEY) !== "hidden";
}

export function BalancePrivacyProvider({ children }: { children: ReactNode }) {
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

  const toggleBalancesVisibility = () => {
    setAreBalancesVisible((current) => {
      const next = !current;
      localStorage.setItem(BALANCE_VISIBILITY_KEY, next ? "visible" : "hidden");
      return next;
    });
  };

  return (
    <BalancePrivacyContext.Provider
      value={{ areBalancesVisible, toggleBalancesVisibility }}
    >
      {children}
    </BalancePrivacyContext.Provider>
  );
}

export function SensitiveMoney({
  amount,
  currency,
  prefix = "",
}: {
  amount: number;
  currency: GoalCurrency;
  prefix?: string;
}) {
  const { areBalancesVisible } = useBalancePrivacy();
  return (
    <>{areBalancesVisible ? prefix + formatMoney(amount, currency) : "****"}</>
  );
}
