import { AlertTriangle, Building2, Layers3 } from "lucide-react";
import { SensitiveMoney } from "@/common/components/BalancePrivacy";
import type { IPortfolioSummary } from "@/modules/summaries/interfaces/summaries.interface";

export function PortfolioSummaryPanel({
  summary,
}: {
  summary: IPortfolioSummary;
}) {
  return (
    <section className="mt-8 overflow-hidden rounded-[2rem] bg-forest text-white shadow-[0_20px_55px_rgba(20,54,44,0.16)]">
      <div className="grid lg:grid-cols-[minmax(260px,0.8fr)_1.5fr]">
        <div className="relative overflow-hidden border-white/10 p-6 sm:p-8 lg:border-r">
          <div className="absolute -top-16 -right-14 size-52 rounded-full border-[38px] border-lime/8" />
          <div className="relative">
            <span className="grid size-11 place-items-center rounded-2xl bg-lime text-forest">
              <Layers3 size={21} />
            </span>
            <p className="mt-5 text-xs font-bold uppercase tracking-[0.16em] text-lime">
              Valor contable total
            </p>
            <p className="mt-2 font-display text-4xl sm:text-5xl">
              <SensitiveMoney
                amount={summary.totalBookValue.usd}
                currency="USD"
              />
            </p>
            <p className="mt-2 text-sm font-semibold text-white/60">
              <SensitiveMoney
                amount={summary.totalBookValue.ars}
                currency="ARS"
              />
            </p>
            <p className="mt-6 text-xs text-white/45">
              Distribuido en {summary.goalsCount}{" "}
              {summary.goalsCount === 1 ? "objetivo" : "objetivos"}
            </p>
          </div>
        </div>

        <div className="p-6 sm:p-8">
          <div className="flex items-center gap-2">
            <Building2 size={17} className="text-lime" />
            <h2 className="text-sm font-bold uppercase tracking-[0.12em]">
              Total por plataforma
            </h2>
          </div>

          {summary.platformBookValues.length ? (
            <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {summary.platformBookValues.map((item) => (
                <article
                  key={item.platform}
                  className="rounded-2xl border border-white/10 bg-white/7 p-4"
                >
                  <p className="text-xs font-bold uppercase tracking-[0.1em] text-lime">
                    {item.platform}
                  </p>
                  <p className="mt-2 font-display text-2xl">
                    <SensitiveMoney amount={item.value.usd} currency="USD" />
                  </p>
                  <p className="mt-1 text-xs font-semibold text-white/50">
                    <SensitiveMoney amount={item.value.ars} currency="ARS" />
                  </p>
                </article>
              ))}
            </div>
          ) : (
            <div className="mt-5 rounded-2xl border border-dashed border-white/15 py-9 text-center text-sm text-white/45">
              Todavía no hay patrimonio registrado.
            </div>
          )}

          {summary.hasUnconvertedAmounts ? (
            <div className="mt-4 flex items-start gap-2 text-xs leading-5 text-amber-200">
              <AlertTriangle className="mt-0.5 shrink-0" size={15} />
              Algunos registros no tienen cotización. Los equivalentes pueden
              estar incompletos.
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
