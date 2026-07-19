import { zodResolver } from "@hookform/resolvers/zod";
import { CircleHelp, Plus, Trash2 } from "lucide-react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import type {
  IGoalFormProps,
  IGoalFormValues,
  IGoalPayload,
} from "@/modules/goals/interfaces/goals.interface";
import { goalSchema } from "@/modules/goals/validations/goals.validation";
import { toDateInput } from "@/utils/format.utils";

const today = new Date().toISOString().slice(0, 10);

function getNestedErrorMessage(error: unknown): string | undefined {
  if (!error || typeof error !== "object") return undefined;
  const value = error as Record<string, unknown>;
  if (typeof value.message === "string") return value.message;
  for (const nested of Object.values(value)) {
    const message = getNestedErrorMessage(nested);
    if (message) return message;
  }
  return undefined;
}

interface IOpeningFieldLabelProps {
  htmlFor: string;
  label: string;
  help?: string;
}

function OpeningFieldLabel({ htmlFor, label, help }: IOpeningFieldLabelProps) {
  return (
    <div className="mb-1.5 flex items-center gap-1.5">
      <label
        htmlFor={htmlFor}
        className="text-[10px] font-bold uppercase tracking-[0.12em] text-forest/65"
      >
        {label}
      </label>
      {help ? (
        <span className="group relative inline-flex">
          <button
            type="button"
            aria-label={`Ayuda sobre ${label}`}
            className="text-forest/40 transition hover:text-forest focus:text-forest focus:outline-none"
          >
            <CircleHelp size={13} />
          </button>
          <span
            role="tooltip"
            className="pointer-events-none invisible absolute bottom-full left-1/2 z-20 mb-2 w-56 -translate-x-1/2 rounded-xl bg-forest px-3 py-2 text-left text-[11px] font-medium normal-case leading-4 tracking-normal text-white opacity-0 shadow-lg transition group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100"
          >
            {help}
          </span>
        </span>
      ) : null}
    </div>
  );
}

export function GoalForm({
  goal,
  isSubmitting,
  onSubmit,
  onCancel,
}: IGoalFormProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<IGoalFormValues>({
    resolver: zodResolver(goalSchema),
    defaultValues: {
      name: goal?.name || "",
      type: goal?.type || "long_term",
      targetAmount: goal?.targetAmount || 0,
      currency: goal?.currency || "USD",
      startDate: goal ? toDateInput(goal.startDate) : today,
      endDate: goal?.endDate ? toDateInput(goal.endDate) : "",
      status: goal?.status || "active",
      trackingMode:
        goal?.trackingMode === "existing_portfolio"
          ? "existing_portfolio"
          : "from_scratch",
      openingCashBalances: (goal?.openingCashBalances || []).map((item) => ({
        ...item,
        exchangeRateArsPerUsd: item.exchangeRateArsPerUsd || 0,
      })),
      openingPositions: (goal?.openingPositions || []).map((item) => ({
        ...item,
        exchangeRateArsPerUsd: item.exchangeRateArsPerUsd || 0,
      })),
      notes: goal?.notes || "",
    },
  });
  const {
    fields: cashFields,
    append: appendCash,
    remove: removeCash,
    replace: replaceCash,
  } = useFieldArray({ control, name: "openingCashBalances" });
  const {
    fields: positionFields,
    append: appendPosition,
    remove: removePosition,
    replace: replacePositions,
  } = useFieldArray({ control, name: "openingPositions" });
  const trackingMode = useWatch({ control, name: "trackingMode" });
  const trackingRegistration = register("trackingMode");

  const submit = handleSubmit(async (values) => {
    const payload: IGoalPayload = {
      name: values.name.trim(),
      type: values.type,
      targetAmount: values.targetAmount,
      currency: values.currency,
      endDate: values.endDate || null,
      status: values.status,
      notes: values.notes || null,
      ...(!goal
        ? {
            trackingMode: values.trackingMode,
            startDate: values.startDate,
            openingCashBalances: values.openingCashBalances.map((item) => ({
              ...item,
              platform: item.platform.trim().toUpperCase(),
              exchangeRateArsPerUsd:
                item.exchangeRateArsPerUsd && item.exchangeRateArsPerUsd > 0
                  ? item.exchangeRateArsPerUsd
                  : undefined,
            })),
            openingPositions: values.openingPositions.map((item) => ({
              ...item,
              platform: item.platform.trim().toUpperCase(),
              ticker: item.ticker.trim().toUpperCase(),
              exchangeRateArsPerUsd:
                item.exchangeRateArsPerUsd && item.exchangeRateArsPerUsd > 0
                  ? item.exchangeRateArsPerUsd
                  : undefined,
            })),
          }
        : {}),
    };
    await onSubmit(payload);
  });

  return (
    <form onSubmit={submit} className="space-y-5">
      <div>
        <label className="app-label" htmlFor="goal-name">
          Nombre
        </label>
        <input
          id="goal-name"
          className="app-field"
          placeholder="Ej. Mi primer departamento"
          {...register("name")}
        />
        {errors.name ? (
          <p className="mt-1.5 text-xs text-ember">{errors.name.message}</p>
        ) : null}
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="app-label" htmlFor="goal-type">
            Tipo
          </label>
          <select id="goal-type" className="app-field" {...register("type")}>
            <option value="long_term">Largo plazo</option>
            <option value="medium_term">Mediano plazo</option>
            <option value="short_term">Corto plazo / trading</option>
          </select>
        </div>
        <div>
          <label className="app-label" htmlFor="goal-status">
            Estado
          </label>
          <select
            id="goal-status"
            className="app-field"
            {...register("status")}
          >
            <option value="active">Activo</option>
            <option value="paused">Pausado</option>
            <option value="completed">Completado</option>
          </select>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-[1fr_140px]">
        <div>
          <label className="app-label" htmlFor="goal-amount">
            Monto objetivo
          </label>
          <input
            id="goal-amount"
            type="number"
            min="0"
            step="0.01"
            className="app-field"
            {...register("targetAmount", { valueAsNumber: true })}
          />
          {errors.targetAmount ? (
            <p className="mt-1.5 text-xs text-ember">
              {errors.targetAmount.message}
            </p>
          ) : null}
        </div>
        <div>
          <label className="app-label" htmlFor="goal-currency">
            Moneda
          </label>
          <select
            id="goal-currency"
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
          <label className="app-label" htmlFor="goal-start">
            Fecha de inicio
          </label>
          <input
            id="goal-start"
            type="date"
            className="app-field"
            disabled={Boolean(goal)}
            {...register("startDate")}
          />
          {errors.startDate ? (
            <p className="mt-1.5 text-xs text-ember">
              {errors.startDate.message}
            </p>
          ) : null}
        </div>
        <div>
          <label className="app-label" htmlFor="goal-end">
            Fecha objetivo
          </label>
          <input
            id="goal-end"
            type="date"
            className="app-field"
            {...register("endDate")}
          />
          {errors.endDate ? (
            <p className="mt-1.5 text-xs text-ember">
              {errors.endDate.message}
            </p>
          ) : null}
        </div>
      </div>

      {!goal ? (
        <section className="rounded-2xl border border-forest/10 bg-white/65 p-4 sm:p-5">
          <label className="app-label" htmlFor="goal-tracking-mode">
            ¿Cómo empiezas el seguimiento?
          </label>
          <select
            id="goal-tracking-mode"
            className="app-field"
            {...trackingRegistration}
            onChange={(event) => {
              void trackingRegistration.onChange(event);
              if (event.target.value === "from_scratch") {
                replaceCash([]);
                replacePositions([]);
              }
            }}
          >
            <option value="from_scratch">Comenzar desde cero</option>
            <option value="existing_portfolio">
              Registrar una cartera existente
            </option>
          </select>
          <p className="mt-2 text-xs leading-5 text-ink/45">
            {trackingMode === "from_scratch"
              ? "Primero registrarás aportes y luego las compras."
              : "Carga el efectivo y las posiciones que ya tienes al iniciar."}
          </p>
          {errors.trackingMode ? (
            <p className="mt-1.5 text-xs text-ember">
              {errors.trackingMode.message}
            </p>
          ) : null}

          {trackingMode === "existing_portfolio" ? (
            <div className="mt-6 space-y-7">
              <div>
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-bold text-forest">
                      Efectivo inicial
                    </h3>
                    <p className="text-xs text-ink/45">
                      Saldo disponible por plataforma y moneda.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      appendCash({
                        platform: "IOL",
                        currency: "ARS",
                        amount: 0,
                        exchangeRateArsPerUsd: 0,
                      })
                    }
                    className="inline-flex items-center gap-1 rounded-xl bg-lime px-3 py-2 text-xs font-bold text-forest"
                  >
                    <Plus size={14} /> Agregar
                  </button>
                </div>
                <div className="space-y-3">
                  {cashFields.map((field, index) => (
                    <div
                      key={field.id}
                      className="grid gap-3 rounded-2xl border border-forest/8 bg-cream p-3 sm:grid-cols-[1fr_100px_1fr_1fr_auto]"
                    >
                      <div>
                        <OpeningFieldLabel
                          htmlFor={`opening-cash-platform-${index}`}
                          label="Plataforma"
                          help="Cuenta o entidad donde se encuentra disponible este dinero."
                        />
                        <input
                          id={`opening-cash-platform-${index}`}
                          className="app-field uppercase"
                          placeholder="Ej. IOL"
                          {...register(`openingCashBalances.${index}.platform`)}
                        />
                      </div>
                      <div>
                        <OpeningFieldLabel
                          htmlFor={`opening-cash-currency-${index}`}
                          label="Moneda"
                        />
                        <select
                          id={`opening-cash-currency-${index}`}
                          className="app-field"
                          {...register(`openingCashBalances.${index}.currency`)}
                        >
                          <option value="ARS">ARS</option>
                          <option value="USD">USD</option>
                        </select>
                      </div>
                      <div>
                        <OpeningFieldLabel
                          htmlFor={`opening-cash-amount-${index}`}
                          label="Saldo disponible"
                          help="Dinero sin invertir que tienes disponible actualmente en esta plataforma."
                        />
                        <input
                          id={`opening-cash-amount-${index}`}
                          type="number"
                          min="0"
                          step="0.01"
                          className="app-field"
                          placeholder="0"
                          {...register(`openingCashBalances.${index}.amount`, {
                            valueAsNumber: true,
                          })}
                        />
                      </div>
                      <div>
                        <OpeningFieldLabel
                          htmlFor={`opening-cash-rate-${index}`}
                          label="Dolar MEP / CCL"
                          help="Cotizacion de venta usada para convertir este saldo entre ARS y USD. Es opcional."
                        />
                        <input
                          id={`opening-cash-rate-${index}`}
                          type="number"
                          min="0"
                          step="0.01"
                          className="app-field"
                          placeholder="Opcional"
                          {...register(
                            `openingCashBalances.${index}.exchangeRateArsPerUsd`,
                            { valueAsNumber: true },
                          )}
                        />
                      </div>
                      <button
                        type="button"
                        aria-label="Eliminar saldo inicial"
                        onClick={() => removeCash(index)}
                        className="self-end rounded-xl p-3 text-ember hover:bg-ember/8"
                      >
                        <Trash2 size={17} />
                      </button>
                    </div>
                  ))}
                </div>
                {errors.openingCashBalances ? (
                  <p className="mt-2 text-xs text-ember">
                    {getNestedErrorMessage(errors.openingCashBalances)}
                  </p>
                ) : null}
              </div>

              <div>
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-bold text-forest">
                      Posiciones iniciales
                    </h3>
                    <p className="text-xs text-ink/45">
                      Activos que ya posees y su costo de adquisición.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      appendPosition({
                        platform: "IOL",
                        ticker: "",
                        quantity: 0,
                        unitPrice: 0,
                        totalAmount: 0,
                        currency: "ARS",
                        exchangeRateArsPerUsd: 0,
                      })
                    }
                    className="inline-flex items-center gap-1 rounded-xl bg-lime px-3 py-2 text-xs font-bold text-forest"
                  >
                    <Plus size={14} /> Agregar
                  </button>
                </div>
                <div className="space-y-3">
                  {positionFields.map((field, index) => (
                    <div
                      key={field.id}
                      className="rounded-2xl border border-forest/8 bg-cream p-3"
                    >
                      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        <div>
                          <OpeningFieldLabel
                            htmlFor={`opening-position-platform-${index}`}
                            label="Plataforma"
                            help="Cuenta o entidad donde mantienes este activo."
                          />
                          <input
                            id={`opening-position-platform-${index}`}
                            className="app-field uppercase"
                            placeholder="Ej. IOL"
                            {...register(`openingPositions.${index}.platform`)}
                          />
                        </div>
                        <div>
                          <OpeningFieldLabel
                            htmlFor={`opening-position-ticker-${index}`}
                            label="Ticker"
                            help="Simbolo con el que se identifica el activo, por ejemplo AAPL, SPY o BTC."
                          />
                          <input
                            id={`opening-position-ticker-${index}`}
                            className="app-field uppercase"
                            placeholder="Ej. AAPL"
                            {...register(`openingPositions.${index}.ticker`)}
                          />
                        </div>
                        <div>
                          <OpeningFieldLabel
                            htmlFor={`opening-position-quantity-${index}`}
                            label="Cantidad"
                            help="Cantidad total de unidades que posees actualmente."
                          />
                          <input
                            id={`opening-position-quantity-${index}`}
                            type="number"
                            min="0"
                            step="0.00000001"
                            className="app-field"
                            placeholder="0"
                            {...register(`openingPositions.${index}.quantity`, {
                              valueAsNumber: true,
                            })}
                          />
                        </div>
                        <div>
                          <OpeningFieldLabel
                            htmlFor={`opening-position-price-${index}`}
                            label="PPC"
                            help="Precio promedio de compra por cada unidad del activo."
                          />
                          <input
                            id={`opening-position-price-${index}`}
                            type="number"
                            min="0"
                            step="0.00000001"
                            className="app-field"
                            placeholder="0"
                            {...register(
                              `openingPositions.${index}.unitPrice`,
                              {
                                valueAsNumber: true,
                              },
                            )}
                          />
                        </div>
                        <div>
                          <OpeningFieldLabel
                            htmlFor={`opening-position-total-${index}`}
                            label="Total invertido"
                            help="Costo total real de la posicion, incluyendo las comisiones o cargos que haya aplicado la plataforma."
                          />
                          <input
                            id={`opening-position-total-${index}`}
                            type="number"
                            min="0"
                            step="0.01"
                            className="app-field"
                            placeholder="0"
                            {...register(
                              `openingPositions.${index}.totalAmount`,
                              { valueAsNumber: true },
                            )}
                          />
                        </div>
                        <div>
                          <OpeningFieldLabel
                            htmlFor={`opening-position-currency-${index}`}
                            label="Moneda"
                          />
                          <select
                            id={`opening-position-currency-${index}`}
                            className="app-field"
                            {...register(`openingPositions.${index}.currency`)}
                          >
                            <option value="ARS">ARS</option>
                            <option value="USD">USD</option>
                          </select>
                        </div>
                        <div>
                          <OpeningFieldLabel
                            htmlFor={`opening-position-rate-${index}`}
                            label="Dolar MEP / CCL"
                            help="Cotizacion de venta correspondiente al costo cargado, usada para mostrar equivalencias en ARS y USD. Es opcional."
                          />
                          <input
                            id={`opening-position-rate-${index}`}
                            type="number"
                            min="0"
                            step="0.01"
                            className="app-field"
                            placeholder="Opcional"
                            {...register(
                              `openingPositions.${index}.exchangeRateArsPerUsd`,
                              { valueAsNumber: true },
                            )}
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removePosition(index)}
                          className="inline-flex self-end items-center justify-center gap-2 rounded-xl border border-ember/20 px-3 py-3 text-xs font-bold text-ember"
                        >
                          <Trash2 size={15} /> Eliminar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                {errors.openingPositions ? (
                  <p className="mt-2 text-xs text-ember">
                    {getNestedErrorMessage(errors.openingPositions)}
                  </p>
                ) : null}
              </div>
            </div>
          ) : null}
        </section>
      ) : null}

      <div>
        <label className="app-label" htmlFor="goal-notes">
          Notas
        </label>
        <textarea
          id="goal-notes"
          rows={3}
          className="app-field resize-none"
          placeholder="Detalles que quieras tener presentes..."
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
            : goal
              ? "Guardar cambios"
              : "Crear objetivo"}
        </button>
      </div>
    </form>
  );
}
