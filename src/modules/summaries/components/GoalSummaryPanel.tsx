import {
  AlertTriangle,
  BriefcaseBusiness,
  Landmark,
  TrendingUp,
} from "lucide-react";
import type {
  IGoalSummaryPanelProps,
  IMoneyTotals,
} from "@/modules/summaries/interfaces/summaries.interface";
import { SensitiveMoney } from "@/common/components/BalancePrivacy";

function MoneyPair({ totals }: { totals: IMoneyTotals }) {
  return (
    <>
      <p className="font-display text-3xl text-primary">
        <SensitiveMoney amount={totals.usd} currency="USD" />
      </p>
      <p className="mt-1 text-xs font-semibold text-secondary">
        <SensitiveMoney amount={totals.ars} currency="ARS" />
      </p>
    </>
  );
}

export function GoalSummaryPanel({
  summary,
  onCashBalanceClick,
}: IGoalSummaryPanelProps) {
  const progress = Math.max(0, summary.progressPercentage);

  return (
    <div className="space-y-6">
      {summary.hasUnconvertedAmounts ? (
        <div className="flex gap-3 rounded-2xl border border-amber-600/20 bg-amber-50 px-5 py-4 text-sm text-amber-900">
          <AlertTriangle className="mt-0.5 shrink-0" size={18} />
          <p>
            Hay registros sin cotización MEP/CCL. Los totales de la moneda
            convertida no incluyen esos importes.
          </p>
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: "Valor contable",
            totals: summary.portfolioBookValue,
            icon: BriefcaseBusiness,
            accent: true,
          },
          {
            label: "Efectivo disponible",
            totals: summary.cashBalance,
            icon: Landmark,
            accent: false,
            onClick: onCashBalanceClick,
          },
          {
            label: "Posiciones abiertas",
            totals: summary.openPositionValueAtCost,
            icon: TrendingUp,
            accent: false,
          },
          {
            label: "Ganancia realizada",
            totals: summary.realizedProfit,
            icon: TrendingUp,
            accent: false,
          },
        ].map(({ label, totals, icon: Icon, accent, onClick }) => (
          <article
            key={label}
            role={onClick ? "button" : undefined}
            tabIndex={onClick ? 0 : undefined}
            onClick={onClick}
            onKeyDown={(event) => {
              if (onClick && (event.key === "Enter" || event.key === " ")) {
                event.preventDefault();
                onClick();
              }
            }}
            className={
              "rounded-[1.5rem] border p-5 transition " +
              (onClick
                ? "cursor-pointer hover:-translate-y-0.5 hover:border-outline/20 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-secondary/35 "
                : "") +
              (accent
                ? "border-accent bg-accent/55"
                : "border-outline/8 bg-surface")
            }
          >
            <div className="mb-4 flex items-center justify-between">
              <p className="text-xs font-bold tracking-[0.1em] text-secondary uppercase">
                {label}
              </p>
              <Icon size={17} className="text-secondary" />
            </div>
            <MoneyPair totals={totals} />
          </article>
        ))}
      </div>

      <div className="rounded-[1.5rem] border border-outline/8 bg-surface p-5 sm:p-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold tracking-[0.1em] text-secondary uppercase">
              Avance total
            </p>
            <p className="mt-2 text-sm text-body/50">
              Efectivo más posiciones valuadas a costo
            </p>
          </div>
          <strong className="font-display text-4xl text-primary">
            {progress.toFixed(1)}%
          </strong>
        </div>
        <div className="mt-5 h-2.5 overflow-hidden rounded-full bg-page">
          <div
            className="h-full rounded-full bg-brand transition-all duration-700"
            style={{ width: Math.min(progress, 100) + "%" }}
          />
        </div>
      </div>

      <div className="rounded-[1.5rem] border border-outline/8 bg-surface-soft p-5 sm:p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold tracking-[0.1em] text-secondary uppercase">
              Posiciones abiertas
            </p>
            <h3 className="mt-2 font-display text-3xl text-primary">
              Cartera actual
            </h3>
          </div>
          <span className="rounded-full bg-brand px-3 py-1.5 text-xs font-bold text-accent-text">
            {summary.openPositionsCount}
          </span>
        </div>

        {summary.openPositions.length ? (
          <div className="mt-6 grid gap-3 lg:grid-cols-2">
            {summary.openPositions.map((position) => (
              <article
                key={position.platform + ":" + position.ticker}
                className="rounded-2xl border border-outline/8 bg-surface p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-display text-2xl text-primary">
                      {position.ticker}
                    </p>
                    <p className="mt-1 text-xs font-bold tracking-[0.08em] text-secondary uppercase">
                      {position.platform}
                    </p>
                  </div>
                  <p className="text-sm font-bold text-primary">
                    {position.quantity} unidades
                  </p>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-4 border-t border-outline/8 pt-4">
                  <div>
                    <p className="text-[10px] font-bold text-body/40 uppercase">
                      Costo promedio
                    </p>
                    <p className="mt-1 text-sm font-bold text-primary">
                      <SensitiveMoney
                        amount={position.averageCost.usd}
                        currency="USD"
                      />
                    </p>
                    <p className="mt-0.5 text-xs text-secondary">
                      <SensitiveMoney
                        amount={position.averageCost.ars}
                        currency="ARS"
                      />
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-body/40 uppercase">
                      Total invertido
                    </p>
                    <p className="mt-1 text-sm font-bold text-primary">
                      <SensitiveMoney
                        amount={position.invested.usd}
                        currency="USD"
                      />
                    </p>
                    <p className="mt-0.5 text-xs text-secondary">
                      <SensitiveMoney
                        amount={position.invested.ars}
                        currency="ARS"
                      />
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="mt-6 rounded-2xl border border-dashed border-outline/15 py-12 text-center text-sm text-body/45">
            No hay posiciones abiertas.
          </div>
        )}
      </div>
    </div>
  );
}
