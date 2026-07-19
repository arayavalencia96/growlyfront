import type { ReactNode } from "react";
import { SensitiveMoney } from "@/common/components/BalancePrivacy";
import type { IGoalMovement } from "@/modules/goal-movements/interfaces/goal-movements.interface";
import type { IInvestmentOperation } from "@/modules/investment-operations/interfaces/investment-operations.interface";
import type { IGoalSummary } from "@/modules/summaries/interfaces/summaries.interface";
import { formatDate } from "@/utils/format.utils";

export type GoalDetailSelection =
  | { type: "cash"; summary: IGoalSummary }
  | { type: "movement"; movement: IGoalMovement }
  | { type: "operation"; operation: IInvestmentOperation };

function DetailItem({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="rounded-2xl border border-outline/8 bg-surface p-4">
      <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-secondary">
        {label}
      </p>
      <p className="mt-1.5 text-sm font-bold text-primary">{value}</p>
    </div>
  );
}

export function GoalDetailContent({ detail }: { detail: GoalDetailSelection }) {
  if (detail.type === "cash") {
    return (
      <div className="space-y-5">
        <div className="rounded-2xl bg-brand p-5 text-white">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-accent-text">
            Total contable disponible
          </p>
          <p className="mt-2 font-display text-3xl">
            <SensitiveMoney
              amount={detail.summary.cashBalance.usd}
              currency="USD"
            />
          </p>
          <p className="mt-1 text-sm text-white/65">
            <SensitiveMoney
              amount={detail.summary.cashBalance.ars}
              currency="ARS"
            />
          </p>
        </div>

        <div>
          <h3 className="text-sm font-bold text-primary">
            Composición por plataforma
          </h3>
          <p className="mt-1 text-xs leading-5 text-body/45">
            Saldos sin invertir luego de aportes, extracciones, compras y
            ventas.
          </p>
          {detail.summary.cashBalances.length ? (
            <div className="mt-3 space-y-2">
              {detail.summary.cashBalances.map((balance) => (
                <div
                  key={`${balance.platform}:${balance.currency}`}
                  className="flex items-center justify-between gap-4 rounded-2xl border border-outline/8 bg-surface px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-bold text-primary">
                      {balance.platform}
                    </p>
                    <p className="mt-0.5 text-[10px] font-bold uppercase tracking-[0.1em] text-secondary">
                      Saldo en {balance.currency}
                    </p>
                  </div>
                  <p className="font-display text-xl text-primary">
                    <SensitiveMoney
                      amount={balance.amount}
                      currency={balance.currency}
                    />
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-3 rounded-2xl border border-dashed border-outline/15 py-8 text-center text-sm text-body/45">
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
          value={
            <SensitiveMoney
              amount={movement.amount}
              currency={movement.currency}
            />
          }
        />
        <DetailItem label="Plataforma" value={movement.platform || "GENERAL"} />
        <DetailItem label="Fecha" value={formatDate(movement.movementDate)} />
        <DetailItem label="Moneda" value={movement.currency} />
        <DetailItem
          label="Dólar MEP / CCL"
          value={
            movement.exchangeRateArsPerUsd ? (
              <SensitiveMoney
                amount={movement.exchangeRateArsPerUsd}
                currency="ARS"
              />
            ) : (
              "Sin cotización"
            )
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
        value={
          <SensitiveMoney
            amount={operation.unitPrice}
            currency={operation.currency}
          />
        }
      />
      <DetailItem
        label={operation.type === "buy" ? "Total invertido" : "Total obtenido"}
        value={
          <SensitiveMoney
            amount={operation.totalAmount}
            currency={operation.currency}
          />
        }
      />
      <DetailItem label="Moneda" value={operation.currency} />
      <DetailItem
        label="Dólar MEP / CCL"
        value={
          operation.exchangeRateArsPerUsd ? (
            <SensitiveMoney
              amount={operation.exchangeRateArsPerUsd}
              currency="ARS"
            />
          ) : (
            "Sin cotización"
          )
        }
      />
      <div className="sm:col-span-2">
        <DetailItem label="Notas" value={operation.notes || "Sin notas"} />
      </div>
    </div>
  );
}
