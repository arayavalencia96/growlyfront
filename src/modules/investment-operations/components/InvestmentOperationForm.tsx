import { zodResolver } from "@hookform/resolvers/zod";
import { CircleHelp } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { Modal } from "@/common/components/Modal";
import { FormFieldLabel } from "@/common/components/FormFieldLabel";
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
import { calculateSellPreview } from "@/modules/investment-operations/utils/sell-preview.utils";
import { formatDateTime, formatMoney, toDateInput } from "@/utils/format.utils";

const today = new Date().toISOString().slice(0, 10);

function isKnownPlatform(value: string): value is InvestmentPlatform {
  return INVESTMENT_PLATFORMS.includes(value as InvestmentPlatform);
}

interface IPreviewInfoButtonProps {
  label: string;
  help: string;
}

function PreviewInfoButton({
  label,
  help,
}: Readonly<IPreviewInfoButtonProps>) {
  return (
    <button
      type="button"
      aria-label={`Ayuda sobre ${label}`}
      title={help}
      className="align-text-bottom text-secondary/65 transition hover:text-primary focus:text-primary focus:outline-none"
    >
      <CircleHelp size={13} />
    </button>
  );
}

export function InvestmentOperationForm({
  goalId,
  defaultCurrency,
  openingPositions,
  operations,
  operation,
  isSubmitting,
  onSubmit,
  onCancel,
}: Readonly<IInvestmentOperationFormProps>) {
  const [isPreviewExplanationOpen, setIsPreviewExplanationOpen] =
    useState(false);
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
  const customPlatform = useWatch({ control, name: "customPlatform" });
  const ticker = useWatch({ control, name: "ticker" });
  const operationDate = useWatch({ control, name: "operationDate" });
  const quantity = useWatch({ control, name: "quantity" });
  const totalAmount = useWatch({ control, name: "totalAmount" });
  const currency = useWatch({ control, name: "currency" });
  const selectedPlatform =
    platformOption === CUSTOM_INVESTMENT_PLATFORM
      ? customPlatform
      : platformOption;
  const sellPreview = useMemo(
    () =>
      operationType === "sell"
        ? calculateSellPreview({
            operations,
            openingPositions,
            operationId: operation?.id,
            platform: selectedPlatform,
            ticker,
            operationDate,
            quantity,
            totalAmount,
            currency,
          })
        : null,
    [
      currency,
      openingPositions,
      operation?.id,
      operationDate,
      operationType,
      operations,
      quantity,
      selectedPlatform,
      ticker,
      totalAmount,
    ],
  );

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
          <FormFieldLabel
            htmlFor="operation-quantity"
            label="Cantidad"
            help="Cantidad de unidades del activo que compraste o vendiste en esta operación."
          />
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
          <FormFieldLabel
            htmlFor="operation-price"
            label={
              operationType === "buy"
                ? "PPC · Precio promedio de compra"
                : "PPV · Precio promedio de venta"
            }
            help={
              operationType === "buy"
                ? "Precio promedio pagado por cada unidad comprada."
                : "Precio promedio obtenido por cada unidad vendida."
            }
          />
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
          <FormFieldLabel
            htmlFor="operation-total-amount"
            label={
              operationType === "buy"
                ? "Monto total invertido"
                : "Monto total obtenido"
            }
            help={
              operationType === "buy"
                ? "Importe total debitado por la compra, incluyendo comisiones y cargos de la plataforma."
                : "Importe neto acreditado por la venta, luego de comisiones y cargos de la plataforma."
            }
          />
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
          <FormFieldLabel
            htmlFor="operation-rate"
            label="Dólar MEP / CCL"
            help="Cotización de venta utilizada para convertir esta operación entre ARS y USD. Se sugiere automáticamente y puedes modificarla."
          />
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

      {operationType === "sell" ? (
        sellPreview ? (
          <section
            aria-live="polite"
            className={
              "rounded-2xl border p-4 " +
              (sellPreview.profitOrLoss >= 0
                ? "border-emerald-500/20 bg-emerald-500/8"
                : "border-ember/20 bg-ember/8")
            }
          >
            <div className="flex items-center gap-1.5">
              <p className="text-xs font-bold tracking-[0.16em] text-secondary uppercase">
                Resultado estimado de la venta
              </p>
              <button
                type="button"
                aria-label="Ver cómo calculamos el resultado estimado"
                onClick={() => setIsPreviewExplanationOpen(true)}
                className="text-secondary/65 transition hover:text-primary focus:text-primary focus:outline-none"
              >
                <CircleHelp size={15} />
              </button>
            </div>
            <p
              className={
                "mt-2 text-2xl font-bold " +
                (sellPreview.profitOrLoss >= 0
                  ? "text-emerald-700"
                  : "text-ember")
              }
            >
              {sellPreview.profitOrLoss >= 0 ? "Ganancia" : "Pérdida"}: {" "}
              {formatMoney(Math.abs(sellPreview.profitOrLoss), currency)}
              {" · "}
              {Math.abs(sellPreview.percentage).toFixed(2)}%
            </p>
            <dl className="mt-3 grid gap-2 text-sm text-secondary sm:grid-cols-3">
              <div>
                <dt className="flex items-center gap-1 text-body/50">
                  Costo promedio
                  <PreviewInfoButton
                    label="Costo promedio"
                    help="Precio promedio ponderado que pagaste por cada unidad que todavía tienes de este activo, en esta plataforma y objetivo."
                  />
                </dt>
                <dd className="font-bold">{formatMoney(sellPreview.averageCost, currency)}</dd>
              </div>
              <div>
                <dt className="flex items-center gap-1 text-body/50">
                  Costo de esta venta
                  <PreviewInfoButton
                    label="Costo de esta venta"
                    help="Lo que te costó originalmente la cantidad de unidades que quieres vender, calculado con el costo promedio actual."
                  />
                </dt>
                <dd className="font-bold">{formatMoney(sellPreview.costBasis, currency)}</dd>
              </div>
              <div>
                <dt className="flex items-center gap-1 text-body/50">
                  Neto a recibir
                  <PreviewInfoButton
                    label="Neto a recibir"
                    help="Lo que recibirías si vendieras ahora: el monto total obtenido que ingresaste, después de comisiones y cargos."
                  />
                </dt>
                <dd className="font-bold">{formatMoney(sellPreview.proceeds, currency)}</dd>
              </div>
            </dl>
          </section>
        ) : (
          <p aria-live="polite" className="text-sm text-body/55">
            Completa plataforma, ticker, fecha, cantidad y monto total. La estimación se mostrará si hay posición suficiente y sus costos pueden expresarse en esta moneda.
          </p>
        )
      ) : null}

      {isPreviewExplanationOpen ? (
        <Modal
          eyebrow="Resultado estimado"
          title="Cómo calculamos tu ganancia o pérdida"
          onClose={() => setIsPreviewExplanationOpen(false)}
        >
          <div className="space-y-4 text-sm leading-6 text-secondary">
            <p>
              Consideramos solamente las unidades del mismo activo y plataforma
              dentro de este objetivo. Por ejemplo, AAPL en IOL no se mezcla con
              AAPL en otro broker.
            </p>
            <p>
              Sumamos los montos totales invertidos de las compras, incluidas
              sus comisiones, y los dividimos por las unidades que todavía
              conservas. Así obtenemos el costo promedio ponderado por unidad.
            </p>
            <p>
              Las ventas anteriores reducen las unidades y su costo asociado.
              Para esta venta, multiplicamos el costo promedio por la cantidad
              que quieres vender: ese es el costo de esta venta.
            </p>
            <p>
              Finalmente, comparamos ese costo con el neto a recibir que
              ingresaste. Si recibes más, hay ganancia; si recibes menos, hay
              pérdida. Si los importes son iguales, el resultado es cero.
            </p>
          </div>
        </Modal>
      ) : null}

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
