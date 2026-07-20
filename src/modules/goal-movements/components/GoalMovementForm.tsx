import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { useMepExchangeRate } from "@/common/hooks/useMepExchangeRate";
import type {
  IGoalMovementFormProps,
  IGoalMovementFormValues,
} from "@/modules/goal-movements/interfaces/goal-movements.interface";
import { goalMovementSchema } from "@/modules/goal-movements/validations/goal-movements.validation";
import {
  CUSTOM_INVESTMENT_PLATFORM,
  INVESTMENT_PLATFORM_LABELS,
  INVESTMENT_PLATFORMS,
} from "@/modules/investment-operations/interfaces/investment-operations.interface";
import type { InvestmentPlatform } from "@/modules/investment-operations/interfaces/investment-operations.interface";
import { formatDateTime, toDateInput } from "@/utils/format.utils";

const today = new Date().toISOString().slice(0, 10);

function isKnownPlatform(value: string): value is InvestmentPlatform {
  return INVESTMENT_PLATFORMS.some((platform) => platform === value);
}

export function GoalMovementForm({
  goalId,
  defaultCurrency,
  movement,
  isSubmitting,
  onSubmit,
  onCancel,
}: Readonly<IGoalMovementFormProps>) {
  const savedPlatform = movement?.platform?.toUpperCase() || "";
  const isSavedPlatformKnown = isKnownPlatform(savedPlatform);
  const {
    register,
    handleSubmit,
    control,
    getFieldState,
    setValue,
    formState: { errors },
  } = useForm<IGoalMovementFormValues>({
    resolver: zodResolver(goalMovementSchema),
    defaultValues: {
      type: movement?.type || "contribution",
      amount: movement?.amount || 0,
      currency: movement?.currency || defaultCurrency,
      movementDate: movement ? toDateInput(movement.movementDate) : today,
      exchangeRateArsPerUsd: movement?.exchangeRateArsPerUsd || 0,
      platformOption: isSavedPlatformKnown
        ? savedPlatform
        : movement
          ? CUSTOM_INVESTMENT_PLATFORM
          : "IOL",
      customPlatform:
        movement && !isSavedPlatformKnown ? movement.platform || "" : "",
      notes: movement?.notes || "",
    },
  });
  const {
    quote,
    isLoading: isRateLoading,
    hasError: hasRateError,
  } = useMepExchangeRate(!movement);
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
        exchangeRateArsPerUsd: values.exchangeRateArsPerUsd || null,
        platform:
          selectedPlatform === CUSTOM_INVESTMENT_PLATFORM
            ? customPlatform.trim().toUpperCase()
            : selectedPlatform,
        notes: values.notes || null,
      });
    },
  );

  return (
    <form onSubmit={submit} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="app-label" htmlFor="movement-type">
            Movimiento
          </label>
          <select
            id="movement-type"
            className="app-field"
            {...register("type")}
          >
            <option value="contribution">Aporte</option>
            <option value="withdrawal">Extracción</option>
          </select>
        </div>
        <div>
          <label className="app-label" htmlFor="movement-date">
            Fecha
          </label>
          <input
            id="movement-date"
            type="date"
            className="app-field"
            {...register("movementDate")}
          />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-[1fr_140px]">
        <div>
          <label className="app-label" htmlFor="movement-amount">
            Monto
          </label>
          <input
            id="movement-amount"
            type="number"
            min="0"
            step="0.00000001"
            className="app-field"
            {...register("amount", { valueAsNumber: true })}
          />
          {errors.amount ? (
            <p className="mt-1.5 text-xs text-ember">{errors.amount.message}</p>
          ) : null}
        </div>
        <div>
          <label className="app-label" htmlFor="movement-currency">
            Moneda
          </label>
          <select
            id="movement-currency"
            className="app-field"
            {...register("currency")}
          >
            <option value="USD">USD</option>
            <option value="ARS">ARS</option>
          </select>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="app-label" htmlFor="movement-rate">
            Dólar MEP / CCL
          </label>
          <input
            id="movement-rate"
            type="number"
            min="0"
            step="0.01"
            className="app-field"
            placeholder="Opcional"
            {...register("exchangeRateArsPerUsd", { valueAsNumber: true })}
          />
          {!movement ? (
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
          {errors.exchangeRateArsPerUsd ? (
            <p className="mt-1.5 text-xs text-ember">
              {errors.exchangeRateArsPerUsd.message}
            </p>
          ) : null}
        </div>
        <div>
          <label className="app-label" htmlFor="movement-platform">
            Plataforma
          </label>
          <select
            id="movement-platform"
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
              <label className="app-label" htmlFor="movement-custom-platform">
                Nombre de la plataforma
              </label>
              <input
                id="movement-custom-platform"
                className="app-field uppercase"
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
      </div>

      <div>
        <label className="app-label" htmlFor="movement-notes">
          Notas
        </label>
        <textarea
          id="movement-notes"
          rows={3}
          className="app-field resize-none"
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
            : movement
              ? "Guardar cambios"
              : "Registrar movimiento"}
        </button>
      </div>
    </form>
  );
}
