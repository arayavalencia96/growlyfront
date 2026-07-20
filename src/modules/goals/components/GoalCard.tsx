import { CalendarDays, Pencil, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import type { IGoalCardProps } from "@/modules/goals/interfaces/goals.interface";
import { SensitiveMoney } from "@/common/components/BalancePrivacy";
import { formatDate } from "@/utils/format.utils";

const statusLabels = {
  active: "Activo",
  paused: "Pausado",
  completed: "Completado",
} as const;

function getGoalTypeLabel(type: string): string {
  if (type === "long_term") return "Largo plazo";
  if (type === "medium_term") return "Mediano plazo";
  return "Corto plazo";
}

export function GoalCard({ goal, onEdit, onDelete }: IGoalCardProps) {
  return (
    <article className="group relative isolate flex h-full cursor-pointer flex-col rounded-[1.75rem] border border-outline/9 bg-surface-soft p-6 shadow-[0_18px_55px_rgba(20,54,44,0.06)] transition hover:-translate-y-1 hover:shadow-[0_25px_65px_rgba(20,54,44,0.11)]">
      <Link
        to={"/objetivos/" + goal.id}
        aria-label={`Abrir objetivo ${goal.name}`}
        className="absolute inset-0 z-0 rounded-[1.75rem] outline-none focus-visible:ring-3 focus-visible:ring-secondary/35"
      />

      <div className="pointer-events-none relative z-10 flex items-start justify-between gap-4">
        <span className="rounded-full bg-accent/65 px-3 py-1 text-[11px] font-extrabold tracking-[0.1em] text-primary uppercase">
          {getGoalTypeLabel(goal.type)}
        </span>
        <div className="pointer-events-auto flex items-center gap-1">
          <button
            type="button"
            onClick={() => onEdit(goal)}
            aria-label="Editar objetivo"
            className="rounded-xl p-2 text-secondary hover:bg-page hover:text-primary"
          >
            <Pencil size={16} />
          </button>
          <button
            type="button"
            onClick={() => onDelete(goal)}
            aria-label="Eliminar objetivo"
            className="rounded-xl p-2 text-secondary hover:bg-ember/10 hover:text-ember"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
      <h2 className="pointer-events-none relative z-10 mt-7 font-display text-3xl leading-tight text-primary">
        {goal.name}
      </h2>
      <p className="pointer-events-none relative z-10 mt-2 text-xs font-bold tracking-[0.1em] text-secondary uppercase">
        Meta{" "}
        <SensitiveMoney amount={goal.targetAmount} currency={goal.currency} />
      </p>
      <div className="pointer-events-none relative z-10 mt-8 flex items-center gap-2 text-sm text-body/50">
        <CalendarDays size={16} />
        {goal.endDate
          ? "Hasta " + formatDate(goal.endDate)
          : "Sin fecha límite"}
      </div>
      <div className="pointer-events-none relative z-10 mt-auto flex items-center border-t border-outline/8 pt-5">
        <span className="text-xs font-bold text-secondary">
          {statusLabels[goal.status]}
        </span>
      </div>
    </article>
  );
}
