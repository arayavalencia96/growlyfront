import { createContext, useContext } from "react";

export interface IBalancePrivacyContext {
  areBalancesVisible: boolean;
  toggleBalancesVisibility(): void;
}

export const BalancePrivacyContext =
  createContext<IBalancePrivacyContext | null>(null);

export function useBalancePrivacy(): IBalancePrivacyContext {
  const context = useContext(BalancePrivacyContext);
  if (!context) {
    throw new Error(
      "useBalancePrivacy must be used within BalancePrivacyProvider",
    );
  }
  return context;
}
