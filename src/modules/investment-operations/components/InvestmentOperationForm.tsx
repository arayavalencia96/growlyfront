import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { useMepExchangeRate } from "@/common/hooks/useMepExchangeRate";
import type {
  IInvestmentOperationFormProps,
  IInvestmentOperationFormValues,
  InvestmentPlatform,
} from "@/modules/investment-operations/interfaces/investment-operations.interface";
import {
  CUSTOM_INVESTMENT_PLATFORM,
  INVESTMENT_PLATFORM_LABELS,
  INVESTMENT_PLATFORMS,
} from "@/modules/investment-operations/interfaces/investment-operations.interface";
import { investmentOperationSchema } from "@/modules/investment-operations/validations/investment-operations.validation";
import { formatDateTime, toDateInput } from "@/utils/format.utils";

const today = new Date().toISOString().slice(0, 10);

function isKnownPlatform(value: string): value is InvestmentPlatform {
  return INVESTMENT_PLATFORMS.some((platform) => platform === value);
}

export function InvestmentOperationForm({
  goalId,
  defaultCurrency,
  operation,
  isSubmitting,
  onSubmit,
  onCancel,
}: IInvestmentOperationFormProps) {
  const savedPlatform = operation?.platform.toUpperCase() || "";
  const isSavedPlatformKnown = isKnownPlatform(savedPlatform);
  const {
    register,
    handleSubmit,
    control,
    getFieldState,
    setValue,
    formState: { errors },
  } = useForm<IInvestmentOperationFormValues>({
    resolver: zodResolver(investmentOperationSchema),
    defaultValues: {
      platformOption: isSavedPlatformKnown
        ? savedPlatform
        : operation
          ? CUSTOM_INVESTMENT_PLATFORM
          : "IOL",
      customPlatform:
        operation && !isSavedPlatformKnown ? operation.platform : "",
      ticker: operation?.ticker || "",
      type: operation?.type || "buy",
      operationDate: operation ? toDateInput(operation.operationDate) : today,
      quantity: operation?.quantity || 0,
      unitPrice: operation?.unitPrice || 0,
      totalAmount: operation?.totalAmount || 0,
      currency: operation?.currency || defaultCurrency,
      exchangeRateArsPerUsd: operation?.exchangeRateArsPerUsd || 0,
      notes: operation?.notes || "",
    },
  });
  const {
    quote,
    isLoading: isRateLoading,
    hasError: hasRateError,
  } = useMepExchangeRate(!operation);
  const operationType = useWatch({ control, name: "type" });
  const platformOption = useWatch({ control, name: "platformOption" });

  useEffect(() => {
    if (!quote || getFieldState("exchangeRateArsPerUsd").isDirty) return;

    setValue("exchangeRateArsPerUsd", quote.venta, { shouldValidate: true });
  }, [getFieldState, quote, setValue]);

  const submit = handleSubmit(
    async ({ platformOption: selectedPlatform, customPlatform, ...values }) => {
      await onSubmit({
        goalId,
        ...values,
        platform:
          selectedPlatform === CUSTOM_INVESTMENT_PLATFORM
            ? customPlatform.trim()
            : selectedPlatform,
        ticker: values.ticker.trim().toUpperCase(),
        exchangeRateArsPerUsd: values.exchangeRateArsPerUsd || null,
        notes: values.notes || null,
      });
    },
  );

  return (
    <form onSubmit={submit} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="app-label" htmlFor="operation-type">
            Operación
          </label>
          <select
            id="operation-type"
            className="app-field"
            {...register("type")}
          >
            <option value="buy">Compra</option>
            <option value="sell">Venta</option>
          </select>
        </div>
        <div>
          <label className="app-label" htmlFor="operation-date">
            Fecha
          </label>
          <input
            id="operation-date"
            type="date"
            className="app-field"
            {...register("operationDate")}
          />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="app-label" htmlFor="operation-platform">
            Plataforma
          </label>
          <select
            id="operation-platform"
            className="app-field"
            {...register("platformOption")}
          >
            {INVESTMENT_PLATFORMS.map((platform) => (
              <option key={platform} value={platform}>
                {INVESTMENT_PLATFORM_LABELS[platform]}
              </option>
            ))}
            <option value={CUSTOM_INVESTMENT_PLATFORM}>
              {INVESTMENT_PLATFORM_LABELS[CUSTOM_INVESTMENT_PLATFORM]}
            </option>
          </select>
          {errors.platformOption ? (
            <p className="mt-1.5 text-xs text-ember">
              {errors.platformOption.message}
            </p>
          ) : null}
          {platformOption === CUSTOM_INVESTMENT_PLATFORM ? (
            <div className="mt-3">
              <label className="app-label" htmlFor="operation-custom-platform">
                Nombre de la plataforma
              </label>
              <input
                id="operation-custom-platform"
                className="app-field"
                placeholder="Ingresa la plataforma"
                {...register("customPlatform")}
              />
              {errors.customPlatform ? (
                <p className="mt-1.5 text-xs text-ember">
                  {errors.customPlatform.message}
                </p>
              ) : null}
            </div>
          ) : null}
        </div>
        <div>
          <label className="app-label" htmlFor="operation-ticker">
            Ticker
          </label>
          <input
            id="operation-ticker"
            className="app-field uppercase"
            placeholder="AAPL, SPY, MELI"
            {...register("ticker", {
              setValueAs: (value: string) => value.toUpperCase(),
            })}
            onInput={(event) => {
              event.currentTarget.value =
                event.currentTarget.value.toUpperCase();
            }}
          />
          {errors.ticker ? (
            <p className="mt-1.5 text-xs text-ember">{errors.ticker.message}</p>
          ) : null}
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="app-label" htmlFor="operation-quantity">
            Cantidad
          </label>
          <input
            id="operation-quantity"
            type="number"
            min="0"
            step="0.00000001"
            className="app-field"
            {...register("quantity", { valueAsNumber: true })}
          />
          {errors.quantity ? (
            <p className="mt-1.5 text-xs text-ember">
              {errors.quantity.message}
            </p>
          ) : null}
        </div>
        <div>
          <label className="app-label" htmlFor="operation-price">
            {operationType === "buy"
              ? "PPC · Precio promedio de compra"
              : "PPV · Precio promedio de venta"}
          </label>
          <input
            id="operation-price"
            type="number"
            min="0"
            step="0.00000001"
            className="app-field"
            {...register("unitPrice", { valueAsNumber: true })}
          />
          {errors.unitPrice ? (
            <p className="mt-1.5 text-xs text-ember">
              {errors.unitPrice.message}
            </p>
          ) : null}
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <div>
          <label className="app-label" htmlFor="operation-total-amount">
            {operationType === "buy"
              ? "Monto total invertido"
              : "Monto total obtenido"}
          </label>
          <input
            id="operation-total-amount"
            type="number"
            min="0"
            step="0.01"
            className="app-field"
            {...register("totalAmount", { valueAsNumber: true })}
          />
          {errors.totalAmount ? (
            <p className="mt-1.5 text-xs text-ember">
              {errors.totalAmount.message}
            </p>
          ) : null}
        </div>
        <div>
          <label className="app-label" htmlFor="operation-currency">
            Moneda
          </label>
          <select
            id="operation-currency"
            className="app-field"
            {...register("currency")}
          >
            <option value="USD">USD</option>
            <option value="ARS">ARS</option>
          </select>
        </div>
        <div>
          <label className="app-label" htmlFor="operation-rate">
            Dólar MEP / CCL
          </label>
          <input
            id="operation-rate"
            type="number"
            min="0"
            step="0.01"
            className="app-field"
            placeholder="Opcional"
            {...register("exchangeRateArsPerUsd", { valueAsNumber: true })}
          />
          {!operation ? (
            <p aria-live="polite" className="mt-1.5 text-xs text-body/45">
              {isRateLoading
                ? "Obteniendo cotización de venta..."
                : hasRateError
                  ? "No pudimos obtenerla. Puedes ingresarla manualmente."
                  : quote
                    ? "Actualizada el " +
                      formatDateTime(quote.fechaActualizacion)
                    : null}
            </p>
          ) : null}
        </div>
      </div>

      <div>
        <label className="app-label" htmlFor="operation-notes">
          Notas
        </label>
        <textarea
          id="operation-notes"
          rows={3}
          className="app-field resize-none"
          placeholder="Tesis, estrategia o detalle de la operación..."
          {...register("notes")}
        />
      </div>

      <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-2xl border border-outline/12 bg-surface px-5 py-3 text-sm font-bold text-primary"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-2xl bg-brand px-6 py-3 text-sm font-bold text-white transition hover:bg-brand-hover disabled:opacity-50"
        >
          {isSubmitting
            ? "Guardando..."
            : operation
              ? "Guardar cambios"
              : "Registrar operación"}
        </button>
      </div>
    </form>
  );
}
