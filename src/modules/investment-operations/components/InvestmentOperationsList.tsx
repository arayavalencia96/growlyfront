import { Pencil, ShoppingCart, Trash2, TrendingUp } from "lucide-react";
import type { IInvestmentOperationsListProps } from "@/modules/investment-operations/interfaces/investment-operations.interface";
import { SensitiveMoney } from "@/common/components/BalancePrivacy";
import { formatDate } from "@/utils/format.utils";

export function InvestmentOperationsList({
  operations,
  onView,
  onEdit,
  onDelete,
}: IInvestmentOperationsListProps) {
  if (!operations.length) {
    return (
      <div className="rounded-[1.5rem] border border-dashed border-outline/15 py-16 text-center text-sm text-body/45">
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
            role="button"
            tabIndex={0}
            onClick={() => onView(operation)}
            onKeyDown={(event) => {
              if (event.target !== event.currentTarget) return;
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onView(operation);
              }
            }}
            className="grid cursor-pointer gap-4 rounded-2xl border border-outline/8 bg-surface p-4 transition hover:border-outline/20 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-secondary/30 sm:grid-cols-[auto_1fr_auto_auto] sm:items-center"
          >
            <span
              className={
                "grid size-10 place-items-center rounded-xl " +
                (isBuy ? "bg-accent text-primary" : "bg-brand text-accent-text")
              }
            >
              {isBuy ? <ShoppingCart size={18} /> : <TrendingUp size={18} />}
            </span>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-display text-xl text-primary">
                  {operation.ticker}
                </p>
                <span className="rounded-full bg-page px-2.5 py-1 text-[10px] font-bold text-secondary uppercase">
                  {operation.platform}
                </span>
              </div>
              <p className="mt-1 text-xs text-body/45">
                {isBuy ? "Compra" : "Venta"} · {operation.quantity} unidades ·{" "}
                {formatDate(operation.operationDate)}
              </p>
            </div>
            <div className="sm:text-right">
              <p className="font-display text-2xl text-primary">
                <SensitiveMoney
                  amount={operation.totalAmount}
                  currency={operation.currency}
                />
              </p>
              <p className="mt-1 text-xs text-body/40">
                {operation.type === "buy" ? "PPC " : "PPV "}
                <SensitiveMoney
                  amount={operation.unitPrice}
                  currency={operation.currency}
                />
              </p>
            </div>
            <div className="flex justify-end gap-1">
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  onEdit(operation);
                }}
                aria-label="Editar operación"
                className="rounded-xl p-2 text-secondary hover:bg-page"
              >
                <Pencil size={16} />
              </button>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  onDelete(operation);
                }}
                aria-label="Eliminar operación"
                className="rounded-xl p-2 text-secondary hover:bg-ember/10 hover:text-ember"
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
