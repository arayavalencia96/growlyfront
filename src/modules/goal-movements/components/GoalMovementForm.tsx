import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useMepExchangeRate } from '@/common/hooks/useMepExchangeRate'
import type {
  IGoalMovementFormProps,
  IGoalMovementFormValues,
} from '@/modules/goal-movements/interfaces/goal-movements.interface'
import { goalMovementSchema } from '@/modules/goal-movements/validations/goal-movements.validation'
import { formatDateTime, toDateInput } from '@/utils/format.utils'

const today = new Date().toISOString().slice(0, 10)

export function GoalMovementForm({
  goalId,
  defaultCurrency,
  movement,
  isSubmitting,
  onSubmit,
  onCancel,
}: IGoalMovementFormProps) {
  const {
    register,
    handleSubmit,
    getFieldState,
    setValue,
    formState: { errors },
  } = useForm<IGoalMovementFormValues>({
    resolver: zodResolver(goalMovementSchema),
    defaultValues: {
      type: movement?.type || 'contribution',
      amount: movement?.amount || 0,
      currency: movement?.currency || defaultCurrency,
      movementDate: movement ? toDateInput(movement.movementDate) : today,
      exchangeRateArsPerUsd: movement?.exchangeRateArsPerUsd || 0,
      platform: movement?.platform || '',
      notes: movement?.notes || '',
    },
  })
  const { quote, isLoading: isRateLoading, hasError: hasRateError } =
    useMepExchangeRate(!movement)

  useEffect(() => {
    if (!quote || getFieldState('exchangeRateArsPerUsd').isDirty) return

    setValue('exchangeRateArsPerUsd', quote.venta, { shouldValidate: true })
  }, [getFieldState, quote, setValue])

  const submit = handleSubmit(async (values) => {
    await onSubmit({
      goalId,
      ...values,
      exchangeRateArsPerUsd: values.exchangeRateArsPerUsd || null,
      platform: values.platform || null,
      notes: values.notes || null,
    })
  })

  return (
    <form onSubmit={submit} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="app-label" htmlFor="movement-type">Movimiento</label>
          <select id="movement-type" className="app-field" {...register('type')}>
            <option value="contribution">Aporte</option>
            <option value="withdrawal">Extracción</option>
          </select>
        </div>
        <div>
          <label className="app-label" htmlFor="movement-date">Fecha</label>
          <input id="movement-date" type="date" className="app-field" {...register('movementDate')} />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-[1fr_140px]">
        <div>
          <label className="app-label" htmlFor="movement-amount">Monto</label>
          <input
            id="movement-amount"
            type="number"
            min="0"
            step="0.00000001"
            className="app-field"
            {...register('amount', { valueAsNumber: true })}
          />
          {errors.amount ? <p className="mt-1.5 text-xs text-ember">{errors.amount.message}</p> : null}
        </div>
        <div>
          <label className="app-label" htmlFor="movement-currency">Moneda</label>
          <select id="movement-currency" className="app-field" {...register('currency')}>
            <option value="USD">USD</option>
            <option value="ARS">ARS</option>
          </select>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="app-label" htmlFor="movement-rate">Dólar MEP / CCL</label>
          <input
            id="movement-rate"
            type="number"
            min="0"
            step="0.01"
            className="app-field"
            placeholder="Opcional"
            {...register('exchangeRateArsPerUsd', { valueAsNumber: true })}
          />
          {!movement ? (
            <p aria-live="polite" className="mt-1.5 text-xs text-ink/45">
              {isRateLoading
                ? 'Obteniendo cotización de venta...'
                : hasRateError
                  ? 'No pudimos obtenerla. Puedes ingresarla manualmente.'
                  : quote
                    ? 'Actualizada el ' +
                      formatDateTime(quote.fechaActualizacion) +
                      '. Puedes modificarla.'
                    : null}
            </p>
          ) : null}
          {errors.exchangeRateArsPerUsd ? <p className="mt-1.5 text-xs text-ember">{errors.exchangeRateArsPerUsd.message}</p> : null}
        </div>
        <div>
          <label className="app-label" htmlFor="movement-platform">Plataforma</label>
          <input id="movement-platform" className="app-field" placeholder="IOL, Nexo, Bull Market..." {...register('platform')} />
        </div>
      </div>

      <div>
        <label className="app-label" htmlFor="movement-notes">Notas</label>
        <textarea id="movement-notes" rows={3} className="app-field resize-none" {...register('notes')} />
      </div>

      <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
        <button type="button" onClick={onCancel} className="rounded-2xl border border-forest/12 bg-white px-5 py-3 text-sm font-bold text-forest">
          Cancelar
        </button>
        <button type="submit" disabled={isSubmitting} className="rounded-2xl bg-forest px-6 py-3 text-sm font-bold text-white transition hover:bg-moss disabled:opacity-50">
          {isSubmitting ? 'Guardando...' : movement ? 'Guardar cambios' : 'Registrar movimiento'}
        </button>
      </div>
    </form>
  )
}
