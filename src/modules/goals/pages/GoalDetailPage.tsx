import { ArrowLeft, CalendarDays, Flag, Plus, WalletCards } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Modal } from '@/common/components/Modal'
import { GoalMovementForm } from '@/modules/goal-movements/components/GoalMovementForm'
import { GoalMovementsList } from '@/modules/goal-movements/components/GoalMovementsList'
import type {
  IGoalMovement,
  IGoalMovementPayload,
} from '@/modules/goal-movements/interfaces/goal-movements.interface'
import { goalMovementsService } from '@/modules/goal-movements/services/goal-movements.service'
import type { IGoal } from '@/modules/goals/interfaces/goals.interface'
import { goalsService } from '@/modules/goals/services/goals.service'
import { getErrorMessage } from '@/utils/error.utils'
import { formatDate, formatMoney } from '@/utils/format.utils'

export function GoalDetailPage() {
  const { goalId = '' } = useParams()
  const [goal, setGoal] = useState<IGoal | null>(null)
  const [movements, setMovements] = useState<IGoalMovement[]>([])
  const [editingMovement, setEditingMovement] = useState<IGoalMovement | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let isActive = true

    Promise.all([
      goalsService.getById(goalId),
      goalMovementsService.getByGoal(goalId),
    ])
      .then(([goalResponse, movementsResponse]) => {
        if (!isActive) return
        setGoal(goalResponse.result)
        setMovements(movementsResponse.result)
      })
      .catch((requestError: unknown) => {
        if (isActive) setError(getErrorMessage(requestError))
      })
      .finally(() => {
        if (isActive) setIsLoading(false)
      })

    return () => {
      isActive = false
    }
  }, [goalId])

  const openCreate = () => {
    setEditingMovement(null)
    setIsFormOpen(true)
  }

  const openEdit = (movement: IGoalMovement) => {
    setEditingMovement(movement)
    setIsFormOpen(true)
  }

  const saveMovement = async (payload: IGoalMovementPayload) => {
    setIsSubmitting(true)
    setError('')
    try {
      if (editingMovement) {
        const updatePayload = {
          type: payload.type,
          amount: payload.amount,
          currency: payload.currency,
          movementDate: payload.movementDate,
          exchangeRateArsPerUsd: payload.exchangeRateArsPerUsd,
          platform: payload.platform,
          notes: payload.notes,
        }
        const { result } = await goalMovementsService.update(
          editingMovement.id,
          updatePayload,
        )
        setMovements((current) =>
          current.map((movement) =>
            movement.id === result.id ? result : movement,
          ),
        )
      } else {
        const { result } = await goalMovementsService.create(payload)
        setMovements((current) => [result, ...current])
      }
      setIsFormOpen(false)
      setEditingMovement(null)
    } catch (requestError: unknown) {
      setError(getErrorMessage(requestError))
    } finally {
      setIsSubmitting(false)
    }
  }

  const deleteMovement = async (movement: IGoalMovement) => {
    if (!window.confirm('¿Eliminar este movimiento?')) return
    try {
      await goalMovementsService.remove(movement.id)
      setMovements((current) =>
        current.filter(({ id }) => id !== movement.id),
      )
    } catch (requestError: unknown) {
      setError(getErrorMessage(requestError))
    }
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl animate-pulse space-y-6">
        <div className="h-52 rounded-[2rem] bg-white/60" />
        <div className="h-80 rounded-[2rem] bg-white/60" />
      </div>
    )
  }

  if (!goal) {
    return (
      <div className="mx-auto max-w-3xl rounded-[2rem] bg-white p-10 text-center">
        <h1 className="font-display text-4xl text-forest">No encontramos el objetivo</h1>
        <p className="mt-3 text-sm text-ink/50">{error}</p>
        <Link to="/objetivos" className="mt-6 inline-block font-bold text-forest">Volver a objetivos</Link>
      </div>
    )
  }

  const comparableMovements = movements.filter(
    ({ currency }) => currency === goal.currency,
  )
  const contributed = comparableMovements
    .filter(({ type }) => type === 'contribution')
    .reduce((total, { amount }) => total + amount, 0)
  const withdrawn = comparableMovements
    .filter(({ type }) => type === 'withdrawal')
    .reduce((total, { amount }) => total + amount, 0)
  const accumulated = contributed - withdrawn
  const progress = goal.targetAmount
    ? Math.max(0, (accumulated / goal.targetAmount) * 100)
    : 0

  return (
    <section className="mx-auto max-w-7xl">
      <Link to="/objetivos" className="inline-flex items-center gap-2 text-sm font-bold text-moss hover:text-forest">
        <ArrowLeft size={17} />
        Volver a objetivos
      </Link>

      <div className="mt-6 overflow-hidden rounded-[2rem] bg-forest text-white shadow-[0_24px_70px_rgba(20,54,44,0.18)]">
        <div className="relative p-7 sm:p-10">
          <div className="absolute -top-20 -right-14 size-64 rounded-full border-[45px] border-lime/8" />
          <div className="relative flex flex-col justify-between gap-8 md:flex-row md:items-end">
            <div>
              <p className="text-xs font-bold tracking-[0.2em] text-lime uppercase">
                {goal.type === 'long_term' ? 'Objetivo de largo plazo' : 'Objetivo de corto plazo'}
              </p>
              <h1 className="mt-3 font-display text-5xl leading-none sm:text-6xl">{goal.name}</h1>
              <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm text-white/55">
                <span className="inline-flex items-center gap-2"><Flag size={15} />Meta {formatMoney(goal.targetAmount, goal.currency)}</span>
                <span className="inline-flex items-center gap-2"><CalendarDays size={15} />{goal.endDate ? formatDate(goal.endDate) : 'Sin fecha límite'}</span>
              </div>
            </div>
            <button type="button" onClick={openCreate} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-lime px-5 py-3.5 text-sm font-bold text-forest">
              <Plus size={18} />
              Nuevo movimiento
            </button>
          </div>
        </div>
        <div className="border-t border-white/10 bg-white/5 p-7 sm:px-10">
          <div className="flex items-center justify-between gap-4 text-sm">
            <span className="text-white/55">Avance por movimientos en {goal.currency}</span>
            <strong className="text-lime">{progress.toFixed(1)}%</strong>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full bg-lime transition-all duration-700" style={{ width: Math.min(progress, 100) + '%' }} />
          </div>
        </div>
      </div>

      {error ? <div className="mt-6 rounded-2xl border border-ember/20 bg-ember/8 px-5 py-4 text-sm font-semibold text-ember">{error}</div> : null}

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {[
          { label: 'Acumulado neto', value: accumulated, accent: true },
          { label: 'Total aportado', value: contributed, accent: false },
          { label: 'Total extraído', value: withdrawn, accent: false },
        ].map(({ label, value, accent }) => (
          <article key={label} className={'rounded-[1.5rem] border p-5 ' + (accent ? 'border-lime bg-lime/55' : 'border-forest/8 bg-white')}>
            <p className="text-xs font-bold tracking-[0.1em] text-moss uppercase">{label}</p>
            <p className="mt-3 font-display text-3xl text-forest">{formatMoney(value, goal.currency)}</p>
          </article>
        ))}
      </div>

      <div className="mt-8 rounded-[2rem] border border-forest/8 bg-cream p-5 sm:p-7">
        <div className="mb-6 flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-xl bg-lime text-forest"><WalletCards size={19} /></span>
          <div>
            <h2 className="font-display text-3xl text-forest">Movimientos</h2>
            <p className="text-xs text-ink/45">{movements.length} registros en todas las monedas</p>
          </div>
        </div>
        <GoalMovementsList movements={movements} onEdit={openEdit} onDelete={deleteMovement} />
      </div>

      {isFormOpen ? (
        <Modal
          eyebrow={editingMovement ? 'Editar registro' : 'Caja del objetivo'}
          title={editingMovement ? 'Modificar movimiento' : 'Nuevo movimiento'}
          onClose={() => setIsFormOpen(false)}
        >
          <GoalMovementForm
            goalId={goal.id}
            defaultCurrency={goal.currency}
            movement={editingMovement || undefined}
            isSubmitting={isSubmitting}
            onSubmit={saveMovement}
            onCancel={() => setIsFormOpen(false)}
          />
        </Modal>
      ) : null}
    </section>
  )
}
