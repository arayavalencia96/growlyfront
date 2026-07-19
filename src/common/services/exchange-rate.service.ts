import { environment } from "@/common/config/environment";
import type {
  IExchangeRateQuote,
  IExchangeRateService,
} from "@/common/interfaces/exchange-rate.interface";

function isExchangeRateQuote(value: unknown): value is IExchangeRateQuote {
  if (typeof value !== "object" || value === null) return false;

  const quote = value as Record<string, unknown>;
  return (
    typeof quote.moneda === "string" &&
    typeof quote.casa === "string" &&
    typeof quote.nombre === "string" &&
    typeof quote.compra === "number" &&
    typeof quote.venta === "number" &&
    quote.venta > 0 &&
    typeof quote.fechaActualizacion === "string" &&
    !Number.isNaN(Date.parse(quote.fechaActualizacion))
  );
}

class ExchangeRateService implements IExchangeRateService {
  async getMepQuote(signal?: AbortSignal): Promise<IExchangeRateQuote> {
    const response = await fetch(environment.dolarApiUrl, {
      headers: { Accept: "application/json" },
      signal,
    });

    if (!response.ok) throw new Error("DolarAPI request failed");

    const payload: unknown = await response.json();
    if (!isExchangeRateQuote(payload)) {
      throw new Error("DolarAPI returned an invalid response");
    }

    return payload;
  }
}

export const exchangeRateService = new ExchangeRateService();
