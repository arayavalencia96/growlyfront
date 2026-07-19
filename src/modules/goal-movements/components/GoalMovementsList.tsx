import { ArrowDownLeft, ArrowUpRight, Pencil, Trash2 } from "lucide-react";
import type { IGoalMovement } from "@/modules/goal-movements/interfaces/goal-movements.interface";
import { SensitiveMoney } from "@/common/components/BalancePrivacy";
import { formatDate } from "@/utils/format.utils";

interface IGoalMovementsListProps {
  movements: IGoalMovement[];
  onView(movement: IGoalMovement): void;
  onEdit(movement: IGoalMovement): void;
  onDelete(movement: IGoalMovement): void;
}

export function GoalMovementsList({
  movements,
  onView,
  onEdit,
  onDelete,
}: IGoalMovementsListProps) {
  if (!movements.length) {
    return (
      <div className="rounded-[1.5rem] border border-dashed border-forest/15 py-16 text-center text-sm text-ink/45">
        Todavía no registraste aportes ni extracciones.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {movements.map((movement) => {
        const isContribution = movement.type === "contribution";
        return (
          <article
            key={movement.id}
            role="button"
            tabIndex={0}
            onClick={() => onView(movement)}
            onKeyDown={(event) => {
              if (event.target !== event.currentTarget) return;
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onView(movement);
              }
            }}
            className="grid cursor-pointer gap-4 rounded-2xl border border-forest/8 bg-white p-4 transition hover:border-forest/20 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-moss/30 sm:grid-cols-[auto_1fr_auto_auto] sm:items-center"
          >
            <span
              className={
                "grid size-10 place-items-center rounded-xl " +
                (isContribution
                  ? "bg-lime text-forest"
                  : "bg-ember/12 text-ember")
              }
            >
              {isContribution ? (
                <ArrowDownLeft size={19} />
              ) : (
                <ArrowUpRight size={19} />
              )}
            </span>
            <div>
              <p className="text-sm font-bold text-forest">
                {isContribution ? "Aporte" : "Extracción"}
                {movement.platform ? " · " + movement.platform : ""}
              </p>
              <p className="mt-1 text-xs text-ink/45">
                {formatDate(movement.movementDate)}
                {movement.notes ? " · " + movement.notes : ""}
              </p>
            </div>
            <p
              className={
                "font-display text-2xl " +
                (isContribution ? "text-forest" : "text-ember")
              }
            >
              <SensitiveMoney
                amount={movement.amount}
                currency={movement.currency}
                prefix={isContribution ? "+" : "-"}
              />
            </p>
            <div className="flex justify-end gap-1">
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  onEdit(movement);
                }}
                aria-label="Editar movimiento"
                className="rounded-xl p-2 text-moss hover:bg-linen"
              >
                <Pencil size={16} />
              </button>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  onDelete(movement);
                }}
                aria-label="Eliminar movimiento"
                className="rounded-xl p-2 text-moss hover:bg-ember/10 hover:text-ember"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </article>
        );
      })}
    </div>
  );
}
