import { useEffect, useState } from "react";
import type {
  IExchangeRateQuote,
  IMepExchangeRateState,
} from "@/common/interfaces/exchange-rate.interface";
import { exchangeRateService } from "@/common/services/exchange-rate.service";

export function useMepExchangeRate(enabled: boolean): IMepExchangeRateState {
  const [quote, setQuote] = useState<IExchangeRateQuote | null>(null);
  const [isLoading, setIsLoading] = useState(enabled);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (!enabled) return;

    const controller = new AbortController();
    exchangeRateService
      .getMepQuote(controller.signal)
      .then(setQuote)
      .catch((error: unknown) => {
        if (!(error instanceof DOMException && error.name === "AbortError")) {
          setHasError(true);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });

    return () => controller.abort();
  }, [enabled]);

  return { quote, isLoading, hasError };
}
