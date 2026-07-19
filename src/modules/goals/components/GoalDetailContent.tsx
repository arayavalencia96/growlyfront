import type { IGoalMovement } from "@/modules/goal-movements/interfaces/goal-movements.interface";
import type { IInvestmentOperation } from "@/modules/investment-operations/interfaces/investment-operations.interface";
import type { IGoalSummary } from "@/modules/summaries/interfaces/summaries.interface";
import { formatDate, formatMoney } from "@/utils/format.utils";

export type GoalDetailSelection =
  | { type: "cash"; summary: IGoalSummary }
  | { type: "movement"; movement: IGoalMovement }
  | { type: "operation"; operation: IInvestmentOperation };

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-forest/8 bg-white p-4">
      <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-moss">
        {label}
      </p>
      <p className="mt-1.5 text-sm font-bold text-forest">{value}</p>
    </div>
  );
}

export function GoalDetailContent({ detail }: { detail: GoalDetailSelection }) {
  if (detail.type === "cash") {
    return (
      <div className="space-y-5">
        <div className="rounded-2xl bg-forest p-5 text-white">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-lime">
            Total contable disponible
          </p>
          <p className="mt-2 font-display text-3xl">
            {formatMoney(detail.summary.cashBalance.usd, "USD")}
          </p>
          <p className="mt-1 text-sm text-white/65">
            {formatMoney(detail.summary.cashBalance.ars, "ARS")}
          </p>
        </div>

        <div>
          <h3 className="text-sm font-bold text-forest">
            Composición por plataforma
          </h3>
          <p className="mt-1 text-xs leading-5 text-ink/45">
            Saldos sin invertir luego de aportes, extracciones, compras y
            ventas.
          </p>
          {detail.summary.cashBalances.length ? (
            <div className="mt-3 space-y-2">
              {detail.summary.cashBalances.map((balance) => (
                <div
                  key={`${balance.platform}:${balance.currency}`}
                  className="flex items-center justify-between gap-4 rounded-2xl border border-forest/8 bg-white px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-bold text-forest">
                      {balance.platform}
                    </p>
                    <p className="mt-0.5 text-[10px] font-bold uppercase tracking-[0.1em] text-moss">
                      Saldo en {balance.currency}
                    </p>
                  </div>
                  <p className="font-display text-xl text-forest">
                    {formatMoney(balance.amount, balance.currency)}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-3 rounded-2xl border border-dashed border-forest/15 py-8 text-center text-sm text-ink/45">
              No hay efectivo disponible.
            </div>
          )}
        </div>
      </div>
    );
  }

  if (detail.type === "movement") {
    const { movement } = detail;
    return (
      <div className="grid gap-3 sm:grid-cols-2">
        <DetailItem
          label="Movimiento"
          value={movement.type === "contribution" ? "Aporte" : "Extracción"}
        />
        <DetailItem
          label="Monto"
          value={formatMoney(movement.amount, movement.currency)}
        />
        <DetailItem label="Plataforma" value={movement.platform || "GENERAL"} />
        <DetailItem label="Fecha" value={formatDate(movement.movementDate)} />
        <DetailItem label="Moneda" value={movement.currency} />
        <DetailItem
          label="Dólar MEP / CCL"
          value={
            movement.exchangeRateArsPerUsd
              ? formatMoney(movement.exchangeRateArsPerUsd, "ARS")
              : "Sin cotización"
          }
        />
        <div className="sm:col-span-2">
          <DetailItem label="Notas" value={movement.notes || "Sin notas"} />
        </div>
      </div>
    );
  }

  const { operation } = detail;
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <DetailItem
        label="Operación"
        value={operation.type === "buy" ? "Compra" : "Venta"}
      />
      <DetailItem label="Ticker" value={operation.ticker} />
      <DetailItem label="Plataforma" value={operation.platform} />
      <DetailItem label="Fecha" value={formatDate(operation.operationDate)} />
      <DetailItem label="Cantidad" value={`${operation.quantity} unidades`} />
      <DetailItem
        label={operation.type === "buy" ? "PPC" : "PPV"}
        value={formatMoney(operation.unitPrice, operation.currency)}
      />
      <DetailItem
        label={operation.type === "buy" ? "Total invertido" : "Total obtenido"}
        value={formatMoney(operation.totalAmount, operation.currency)}
      />
      <DetailItem label="Moneda" value={operation.currency} />
      <DetailItem
        label="Dólar MEP / CCL"
        value={
          operation.exchangeRateArsPerUsd
            ? formatMoney(operation.exchangeRateArsPerUsd, "ARS")
            : "Sin cotización"
        }
      />
      <div className="sm:col-span-2">
        <DetailItem label="Notas" value={operation.notes || "Sin notas"} />
      </div>
    </div>
  );
}
