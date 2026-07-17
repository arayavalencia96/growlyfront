import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type {
  IInvestmentOperationFormProps,
  IInvestmentOperationFormValues,
} from "@/modules/investment-operations/interfaces/investment-operations.interface";
import { investmentOperationSchema } from "@/modules/investment-operations/validations/investment-operations.validation";
import { toDateInput } from "@/utils/format.utils";

const today = new Date().toISOString().slice(0, 10);

export function InvestmentOperationForm({
  goalId,
  defaultCurrency,
  operation,
  isSubmitting,
  onSubmit,
  onCancel,
}: IInvestmentOperationFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<IInvestmentOperationFormValues>({
    resolver: zodResolver(investmentOperationSchema),
    defaultValues: {
      platform: operation?.platform || "",
      ticker: operation?.ticker || "",
      type: operation?.type || "buy",
      operationDate: operation ? toDateInput(operation.operationDate) : today,
      quantity: operation?.quantity || 0,
      unitPrice: operation?.unitPrice || 0,
      fees: operation?.fees || 0,
      currency: operation?.currency || defaultCurrency,
      exchangeRateArsPerUsd: operation?.exchangeRateArsPerUsd || 0,
      notes: operation?.notes || "",
    },
  });

  const submit = handleSubmit(async (values) => {
    await onSubmit({
      goalId,
      ...values,
      platform: values.platform.trim(),
      ticker: values.ticker.trim(),
      exchangeRateArsPerUsd: values.exchangeRateArsPerUsd || null,
      notes: values.notes || null,
    });
  });

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
          <input
            id="operation-platform"
            className="app-field uppercase"
            placeholder="IOL, NEXO, BULL MARKET"
            {...register("platform")}
          />
          {errors.platform ? (
            <p className="mt-1.5 text-xs text-ember">
              {errors.platform.message}
            </p>
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
            {...register("ticker")}
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
            Precio unitario
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
          <label className="app-label" htmlFor="operation-fees">
            Comisiones
          </label>
          <input
            id="operation-fees"
            type="number"
            min="0"
            step="0.01"
            className="app-field"
            {...register("fees", { valueAsNumber: true })}
          />
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
          className="rounded-2xl border border-forest/12 bg-white px-5 py-3 text-sm font-bold text-forest"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-2xl bg-forest px-6 py-3 text-sm font-bold text-white transition hover:bg-moss disabled:opacity-50"
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
