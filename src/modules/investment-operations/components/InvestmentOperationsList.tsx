import { Pencil, ShoppingCart, Trash2, TrendingUp } from "lucide-react";
import type { IInvestmentOperationsListProps } from "@/modules/investment-operations/interfaces/investment-operations.interface";
import { formatDate, formatMoney } from "@/utils/format.utils";

export function InvestmentOperationsList({
  operations,
  onEdit,
  onDelete,
}: IInvestmentOperationsListProps) {
  if (!operations.length) {
    return (
      <div className="rounded-[1.5rem] border border-dashed border-forest/15 py-16 text-center text-sm text-ink/45">
        Todavía no registraste compras ni ventas.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {operations.map((operation) => {
        const isBuy = operation.type === "buy";
        return (
          <article
            key={operation.id}
            className="grid gap-4 rounded-2xl border border-forest/8 bg-white p-4 sm:grid-cols-[auto_1fr_auto_auto] sm:items-center"
          >
            <span
              className={
                "grid size-10 place-items-center rounded-xl " +
                (isBuy ? "bg-lime text-forest" : "bg-forest text-lime")
              }
            >
              {isBuy ? <ShoppingCart size={18} /> : <TrendingUp size={18} />}
            </span>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-display text-xl text-forest">
                  {operation.ticker}
                </p>
                <span className="rounded-full bg-linen px-2.5 py-1 text-[10px] font-bold text-moss uppercase">
                  {operation.platform}
                </span>
              </div>
              <p className="mt-1 text-xs text-ink/45">
                {isBuy ? "Compra" : "Venta"} · {operation.quantity} unidades ·{" "}
                {formatDate(operation.operationDate)}
              </p>
            </div>
            <div className="sm:text-right">
              <p className="font-display text-2xl text-forest">
                {formatMoney(operation.totalAmount, operation.currency)}
              </p>
              <p className="mt-1 text-xs text-ink/40">
                {operation.type === "buy" ? "PPC " : "PPV "}
                {formatMoney(operation.unitPrice, operation.currency)}
              </p>
            </div>
            <div className="flex justify-end gap-1">
              <button
                type="button"
                onClick={() => onEdit(operation)}
                aria-label="Editar operación"
                className="rounded-xl p-2 text-moss hover:bg-linen"
              >
                <Pencil size={16} />
              </button>
              <button
                type="button"
                onClick={() => onDelete(operation)}
                aria-label="Eliminar operación"
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
