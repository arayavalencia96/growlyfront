import { currentRecordDay } from "@/utils/format.utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef, useState } from "react";
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
import { formatDateTime, formatMoney, toDateInput } from "@/utils/format.utils";
import { useCashyContributionBudget } from "@/modules/integration/useCashyContributionBudget";
import { integrationService } from "@/modules/integration/integration.service";
import { getErrorMessage } from "@/utils/error.utils";
import { SensitiveMoney } from "@/common/components/BalancePrivacy";

function isKnownPlatform(value: string): value is InvestmentPlatform {
  return INVESTMENT_PLATFORMS.includes(value as InvestmentPlatform);
}

export function GoalMovementForm({
  goalId,
  defaultCurrency,
  cashBalances,
  movement,
  isSubmitting,
  onSubmit,
  onConfirmCashy,
  onCancel,
}: Readonly<IGoalMovementFormProps>) {
  const budget = useCashyContributionBudget(!movement);
  const confirming = useRef(false);
  const [prepareError, setPrepareError] = useState("");
  const [preparing, setPreparing] = useState(false);
  const [confirmationId, setConfirmationId] = useState("");
  const savedPlatform = movement?.platform?.toUpperCase() || "";
  const isSavedPlatformKnown = isKnownPlatform(savedPlatform);
  const fallbackPlatform = movement ? CUSTOM_INVESTMENT_PLATFORM : "IOL";
  const defaultPlatformOption = isSavedPlatformKnown
    ? savedPlatform
    : fallbackPlatform;
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
      fundingSource:
        movement?.type === "contribution"
          ? (movement.fundingSource ?? "legacy")
          : "external",
      amount: movement?.amount || 0,
      currency: movement?.currency || defaultCurrency,
      movementDate: movement
        ? toDateInput(movement.movementDate)
        : currentRecordDay(),
      exchangeRateArsPerUsd: movement?.exchangeRateArsPerUsd || 0,
      platformOption: defaultPlatformOption,
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
  const customPlatform = useWatch({ control, name: "customPlatform" });
  const movementType = useWatch({ control, name: "type" });
  const currency = useWatch({ control, name: "currency" });
  const fundingSource = useWatch({ control, name: "fundingSource" });
  const selectedPlatform =
    platformOption === CUSTOM_INVESTMENT_PLATFORM
      ? customPlatform.trim().toUpperCase()
      : platformOption;
  const isCashy = movementType === "contribution" && fundingSource === "cashy";
  const allocation =
    budget.state?.status === "available" ? budget.state.allocation : undefined;
  const canContribute =
    budget.state?.status === "available" &&
    budget.state.budgetDefined &&
    allocation !== undefined &&
    allocation.availableMinor > 0;
  const currentCashBalance = cashBalances.find(
    (balance) =>
      balance.platform.trim().toUpperCase() === selectedPlatform &&
      balance.currency === currency,
  )?.amount;
  const isEditingMatchingWithdrawal =
    movement?.type === "withdrawal" &&
    movement.currency === currency &&
    (movement.platform || "GENERAL").trim().toUpperCase() === selectedPlatform;
  const availableToWithdraw =
    currentCashBalance === undefined
      ? undefined
      : currentCashBalance +
        (isEditingMatchingWithdrawal ? movement.amount : 0);

  useEffect(() => {
    if (
      confirmationId ||
      !quote ||
      getFieldState("exchangeRateArsPerUsd").isDirty
    )
      return;

    setValue("exchangeRateArsPerUsd", quote.venta, { shouldValidate: true });
  }, [confirmationId, getFieldState, quote, setValue]);

  const submit = async ({
    platformOption: chosenPlatform,
    customPlatform,
    fundingSource: source,
    ...values
  }: IGoalMovementFormValues) => {
    const platform =
      chosenPlatform === CUSTOM_INVESTMENT_PLATFORM
        ? customPlatform.trim().toUpperCase()
        : chosenPlatform;
    if (values.type === "contribution" && source === "cashy") {
      if (movement || confirming.current) return;
      if (!confirmationId && !canContribute) {
        setPrepareError(
          "No hay un presupuesto disponible. Cerrá y volvé a abrir el formulario para consultar nuevamente.",
        );
        return;
      }
      confirming.current = true;
      setPreparing(true);
      setPrepareError("");
      let id = confirmationId;
      try {
        if (!id) {
          const { result } = await integrationService.prepareContribution({
            goalId,
            amount: values.amount,
            currency: values.currency,
            movementDate: values.movementDate,
            platform,
            ...(values.currency === "USD"
              ? { exchangeRateArsPerUsd: values.exchangeRateArsPerUsd }
              : {}),
          });
          id = result.id;
          setConfirmationId(id);
        }
        await onConfirmCashy({
          previewId: id,
          notes: values.notes,
          ...(values.currency === "ARS" && values.exchangeRateArsPerUsd > 0
            ? { valuationExchangeRateArsPerUsd: values.exchangeRateArsPerUsd }
            : {}),
        });
      } catch (failure) {
        setPrepareError(
          getErrorMessage(failure) +
            (id
              ? " Reintentá esta misma operación; no registres otro aporte por el mismo dinero."
              : ""),
        );
      } finally {
        confirming.current = false;
        setPreparing(false);
      }
      return;
    }
    await onSubmit({
      goalId,
      ...values,
      movementDate:
        movement && values.movementDate === toDateInput(movement.movementDate)
          ? movement.movementDate
          : values.movementDate,
      ...(values.type === "contribution" && source === "external"
        ? { fundingSource: source }
        : {}),
      exchangeRateArsPerUsd: values.exchangeRateArsPerUsd || null,
      platform,
      notes: values.notes || null,
    });
  };

  return (
    <form
      onSubmit={(event) => void handleSubmit(submit)(event)}
      className="space-y-5"
    >
      <fieldset disabled={preparing || !!confirmationId} className="space-y-5">
        {movementType === "contribution" && (
          <div className="rounded-2xl border border-outline/12 p-4">
            <label className="app-label" htmlFor="movement-source">
              Origen del aporte
            </label>
            {movement ? (
              <p className="text-sm text-body/65">
                {fundingSource === "legacy"
                  ? "Histórico · sin vínculo con Cashy"
                  : fundingSource === "cashy"
                    ? "Presupuesto de Cashy · edición todavía no habilitada"
                    : "Dinero externo / ya ahorrado"}
                . El origen de un aporte existente no se cambia en esta etapa.
              </p>
            ) : (
              <>
                <select
                  id="movement-source"
                  className="app-field"
                  {...register("fundingSource")}
                >
                  <option value="external">Dinero externo / ya ahorrado</option>
                  {(allocation || isCashy) && (
                    <option value="cashy" disabled={!canContribute}>
                      Presupuesto mensual de Cashy
                    </option>
                  )}
                </select>
                <p className="mt-2 text-xs text-body/55">
                  Usá dinero externo para fondos que ya tenías, reinversiones o
                  dinero extraído de otro objetivo. No consume el presupuesto
                  mensual de Cashy.
                </p>
                {budget.loading && (
                  <p role="status" className="mt-2 text-xs text-body/55">
                    Consultando presupuesto de Cashy…
                  </p>
                )}
                {budget.error && (
                  <p className="mt-2 text-xs text-ember">
                    {budget.error} Podés continuar con dinero externo.
                  </p>
                )}
                {allocation && (
                  <p className="mt-2 text-xs text-body/65">
                    Disponible este mes:{" "}
                    <SensitiveMoney
                      amount={allocation.availableMinor / 100}
                      currency="ARS"
                      fractionDigits={2}
                    />
                    .
                  </p>
                )}
                {budget.state?.status === "not-configured" && (
                  <p className="mt-2 text-xs text-body/55">
                    Definí el sueldo del mes en Cashy para habilitar este
                    origen.
                  </p>
                )}
                {budget.state?.status === "access-paused" && (
                  <p className="mt-2 text-xs text-ember">
                    La conexión con Cashy está suspendida. Revisala en tu
                    perfil.
                  </p>
                )}
                {budget.state?.status === "not-linked" && (
                  <p className="mt-2 text-xs text-body/55">
                    Para usar el presupuesto de Cashy, vinculá las cuentas desde
                    la configuración de Cashy.
                  </p>
                )}
              </>
            )}
            {isCashy && currency === "USD" && (
              <p className="mt-2 text-xs text-body/65">
                Ingresá la cotización ARS por USD usada para este aporte. El
                equivalente se fija al confirmar y no depende de futuras
                cotizaciones.
              </p>
            )}
            {isCashy && !confirmationId && prepareError && (
              <p role="alert" className="mt-3 text-sm text-ember">
                {prepareError}
              </p>
            )}
          </div>
        )}
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
              max={
                movementType === "withdrawal" ? availableToWithdraw : undefined
              }
              step={isCashy ? "0.01" : "0.00000001"}
              className="app-field"
              {...register("amount", { valueAsNumber: true })}
            />
            {errors.amount ? (
              <p className="mt-1.5 text-xs text-ember">
                {errors.amount.message}
              </p>
            ) : null}
            {movementType === "withdrawal" ? (
              <p aria-live="polite" className="mt-1.5 text-xs text-body/55">
                {availableToWithdraw === undefined
                  ? `No hay efectivo disponible en ${selectedPlatform || "esta plataforma"} para esta moneda.`
                  : `Máximo extraíble en ${selectedPlatform}: ${formatMoney(availableToWithdraw, currency, 2)}.`}
              </p>
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
              placeholder={
                isCashy && currency === "USD"
                  ? "Obligatoria para usar Cashy"
                  : "Opcional"
              }
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
      </fieldset>
      {confirmationId && !preparing && prepareError && (
        <p role="status" className="text-sm text-body/65">
          Confirmación enviada · {confirmationId}. Si cerrás esta pantalla,
          consultá su estado en «Aportes desde Cashy» antes de registrar otro
          aporte por este dinero.
        </p>
      )}
      {confirmationId && prepareError && (
        <p role="alert" className="text-sm text-ember">
          {prepareError}
        </p>
      )}
      <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-2xl border border-outline/12 bg-surface px-5 py-3 text-sm font-bold text-primary"
        >
          {confirmationId ? "Cerrar" : "Cancelar"}
        </button>
        <button
          type="submit"
          disabled={
            isSubmitting ||
            preparing ||
            (isCashy && ((!confirmationId && !canContribute) || !!movement))
          }
          className="rounded-2xl bg-brand px-6 py-3 text-sm font-bold text-white transition hover:bg-brand-hover disabled:opacity-50"
        >
          {preparing
            ? "Confirmando aporte…"
            : isCashy
              ? confirmationId
                ? "Reintentar misma confirmación"
                : "Confirmar aporte de Cashy"
              : isSubmitting
                ? "Guardando..."
                : movement
                  ? "Guardar cambios"
                  : "Registrar movimiento"}
        </button>
      </div>
    </form>
  );
}
