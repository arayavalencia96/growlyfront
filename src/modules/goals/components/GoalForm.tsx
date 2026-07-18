import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import type {
  IGoalFormProps,
  IGoalFormValues,
} from '@/modules/goals/interfaces/goals.interface'
import { goalSchema } from '@/modules/goals/validations/goals.validation'
import { toDateInput } from '@/utils/format.utils'

const today = new Date().toISOString().slice(0, 10)

export function GoalForm({
  goal,
  isSubmitting,
  onSubmit,
  onCancel,
}: IGoalFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<IGoalFormValues>({
    resolver: zodResolver(goalSchema),
    defaultValues: {
      name: goal?.name || '',
      type: goal?.type || 'long_term',
      targetAmount: goal?.targetAmount || 0,
      currency: goal?.currency || 'USD',
      startDate: goal ? toDateInput(goal.startDate) : today,
      endDate: goal?.endDate ? toDateInput(goal.endDate) : '',
      status: goal?.status || 'active',
      notes: goal?.notes || '',
    },
  })

  const submit = handleSubmit(async (values) => {
    await onSubmit({
      ...values,
      endDate: values.endDate || null,
      notes: values.notes || null,
    })
  })

  return (
    <form onSubmit={submit} className="space-y-5">
      <div>
        <label className="app-label" htmlFor="goal-name">Nombre</label>
        <input
          id="goal-name"
          className="app-field"
          placeholder="Ej. Mi primer departamento"
          {...register('name')}
        />
        {errors.name ? <p className="mt-1.5 text-xs text-ember">{errors.name.message}</p> : null}
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="app-label" htmlFor="goal-type">Tipo</label>
          <select id="goal-type" className="app-field" {...register('type')}>
            <option value="long_term">Largo plazo</option>
            <option value="medium_term">Mediano plazo</option>
            <option value="short_term">Corto plazo / trading</option>
          </select>
        </div>
        <div>
          <label className="app-label" htmlFor="goal-status">Estado</label>
          <select id="goal-status" className="app-field" {...register('status')}>
            <option value="active">Activo</option>
            <option value="paused">Pausado</option>
            <option value="completed">Completado</option>
          </select>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-[1fr_140px]">
        <div>
          <label className="app-label" htmlFor="goal-amount">Monto objetivo</label>
          <input
            id="goal-amount"
            type="number"
            min="0"
            step="0.01"
            className="app-field"
            {...register('targetAmount', { valueAsNumber: true })}
          />
          {errors.targetAmount ? <p className="mt-1.5 text-xs text-ember">{errors.targetAmount.message}</p> : null}
        </div>
        <div>
          <label className="app-label" htmlFor="goal-currency">Moneda</label>
          <select id="goal-currency" className="app-field" {...register('currency')}>
            <option value="USD">USD</option>
            <option value="ARS">ARS</option>
          </select>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="app-label" htmlFor="goal-start">Fecha de inicio</label>
          <input id="goal-start" type="date" className="app-field" {...register('startDate')} />
          {errors.startDate ? <p className="mt-1.5 text-xs text-ember">{errors.startDate.message}</p> : null}
        </div>
        <div>
          <label className="app-label" htmlFor="goal-end">Fecha objetivo</label>
          <input id="goal-end" type="date" className="app-field" {...register('endDate')} />
          {errors.endDate ? <p className="mt-1.5 text-xs text-ember">{errors.endDate.message}</p> : null}
        </div>
      </div>

      <div>
        <label className="app-label" htmlFor="goal-notes">Notas</label>
        <textarea
          id="goal-notes"
          rows={3}
          className="app-field resize-none"
          placeholder="Detalles que quieras tener presentes..."
          {...register('notes')}
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
          {isSubmitting ? 'Guardando...' : goal ? 'Guardar cambios' : 'Crear objetivo'}
        </button>
      </div>
    </form>
  )
}
