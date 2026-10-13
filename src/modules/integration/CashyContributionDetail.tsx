import { SensitiveMoney } from "@/common/components/BalancePrivacy";
import { formatDate } from "@/utils/format.utils";
import { contributionStatusLabels } from "./contribution-status";
import type { ContributionJobView } from "./contribution.types";

export function CashyContributionDetail({
  job,
}: Readonly<{ job: ContributionJobView }>) {
  return (
    <div className="space-y-4">
      <dl className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-outline/8 bg-surface p-4">
          <dt className="text-xs text-secondary">Monto del aporte</dt>
          <dd className="mt-1 font-bold text-primary">
            <SensitiveMoney
              amount={job.amountMinor / 100}
              currency={job.currency}
            />
          </dd>
        </div>
        <div className="rounded-2xl border border-outline/8 bg-surface p-4">
          <dt className="text-xs text-secondary">
            Consumo en Cashy · {job.period}
          </dt>
          <dd className="mt-1 font-bold text-primary">
            <SensitiveMoney
              amount={job.allocationAmountMinor / 100}
              currency="ARS"
            />
          </dd>
        </div>
        <div>
          <dt className="text-xs text-secondary">Estado</dt>
          <dd>{contributionStatusLabels[job.status]}</dd>
        </div>
        <div>
          <dt className="text-xs text-secondary">Plataforma</dt>
          <dd>{job.platform}</dd>
        </div>
        <div>
          <dt className="text-xs text-secondary">Fecha</dt>
          <dd>{formatDate(job.movementDate)}</dd>
        </div>
        <div>
          <dt className="text-xs text-secondary">Revisión</dt>
          <dd>{job.revision}</dd>
        </div>
        <div>
          <dt className="text-xs text-secondary">Importe original</dt>
          <dd>
            <SensitiveMoney
              amount={job.originalAmountMinor / 100}
              currency={job.currency}
            />
          </dd>
        </div>
        <div>
          <dt className="text-xs text-secondary">
            Cotización histórica ARS/USD
          </dt>
          <dd>
            <SensitiveMoney amount={job.exchangeRateArsPerUsd} currency="ARS" />
          </dd>
        </div>
      </dl>
      <p className="text-sm text-body/65">{job.message}</p>
      <p className="text-sm text-body/65">Notas: {job.notes || "Sin notas"}</p>
      {job.status === "pending" && (
        <p className="text-sm text-body/65">
          La operación continúa aunque cierres esta pantalla. No registres otro
          aporte por el mismo dinero.
        </p>
      )}
      <p className="break-all text-xs text-body/45">Operación: {job.id}</p>
    </div>
  );
}
