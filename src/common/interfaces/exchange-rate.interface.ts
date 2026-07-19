export interface IExchangeRateQuote {
  moneda: string;
  casa: string;
  nombre: string;
  compra: number;
  venta: number;
  fechaActualizacion: string;
}

export interface IExchangeRateService {
  getMepQuote(signal?: AbortSignal): Promise<IExchangeRateQuote>;
}

export interface IMepExchangeRateState {
  quote: IExchangeRateQuote | null;
  isLoading: boolean;
  hasError: boolean;
}
