import { ArrowDownLeft, ArrowUpRight, Pencil, Trash2 } from 'lucide-react'
import type { IGoalMovement } from '@/modules/goal-movements/interfaces/goal-movements.interface'
import { formatDate, formatMoney } from '@/utils/format.utils'

interface IGoalMovementsListProps {
  movements: IGoalMovement[]
  onEdit(movement: IGoalMovement): void
  onDelete(movement: IGoalMovement): void
}

export function GoalMovementsList({
  movements,
  onEdit,
  onDelete,
}: IGoalMovementsListProps) {
  if (!movements.length) {
    return (
      <div className="rounded-[1.5rem] border border-dashed border-forest/15 py-16 text-center text-sm text-ink/45">
        Todavía no registraste aportes ni extracciones.
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {movements.map((movement) => {
        const isContribution = movement.type === 'contribution'
        return (
          <article key={movement.id} className="grid gap-4 rounded-2xl border border-forest/8 bg-white p-4 sm:grid-cols-[auto_1fr_auto_auto] sm:items-center">
            <span className={'grid size-10 place-items-center rounded-xl ' + (isContribution ? 'bg-lime text-forest' : 'bg-ember/12 text-ember')}>
              {isContribution ? <ArrowDownLeft size={19} /> : <ArrowUpRight size={19} />}
            </span>
            <div>
              <p className="text-sm font-bold text-forest">
                {isContribution ? 'Aporte' : 'Extracción'}
                {movement.platform ? ' · ' + movement.platform : ''}
              </p>
              <p className="mt-1 text-xs text-ink/45">
                {formatDate(movement.movementDate)}
                {movement.notes ? ' · ' + movement.notes : ''}
              </p>
            </div>
            <p className={'font-display text-2xl ' + (isContribution ? 'text-forest' : 'text-ember')}>
              {isContribution ? '+' : '-'}{formatMoney(movement.amount, movement.currency)}
            </p>
            <div className="flex justify-end gap-1">
              <button type="button" onClick={() => onEdit(movement)} aria-label="Editar movimiento" className="rounded-xl p-2 text-moss hover:bg-linen">
                <Pencil size={16} />
              </button>
              <button type="button" onClick={() => onDelete(movement)} aria-label="Eliminar movimiento" className="rounded-xl p-2 text-moss hover:bg-ember/10 hover:text-ember">
                <Trash2 size={16} />
              </button>
            </div>
          </article>
        )
      })}
    </div>
  )
}
