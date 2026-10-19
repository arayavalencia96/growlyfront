import { ArrowLeftRight, LoaderCircle, RotateCw } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Modal } from "@/common/components/Modal";
import { SensitiveMoney } from "@/common/components/BalancePrivacy";
import { useBalancePrivacy } from "@/common/components/balance-privacy.context";
import { toastService } from "@/common/services/toast.service";
import { formatDateTime } from "@/utils/format.utils";
import { getErrorMessage } from "@/utils/error.utils";
import { transfersService } from "./transfers.service";
import { unitsText } from "./transfer-state";
import type { TransferRecord } from "./transfer.types";

const statuses = {
  pending: "Procesando",
  completed: "Completada",
  rejected: "Rechazada",
};
const units: Record<string, string> = {
  "crypto:bitcoin": "BTC",
  "crypto:tether": "USDT",
};

export function TransfersActivity({
  goalId,
  revision,
  onChanged,
}: {
  readonly goalId: string;
  readonly revision: number;
  readonly onChanged: () => Promise<void>;
}) {
  const [records, setRecords] = useState<TransferRecord[]>([]);
  const [selected, setSelected] = useState<TransferRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const alive = useRef(true);
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);
  const { areBalancesVisible } = useBalancePrivacy();
  useEffect(() => {
    let active = true;
    transfersService
      .byGoal(goalId)
      .then((history) => {
        if (!active) return;
        setRecords(history.result);
        setError("");
        setSelected((current) =>
          current
            ? (history.result.find((item) => item.id === current.id) ?? current)
            : null,
        );
      })
      .catch((failure: unknown) => {
        if (active) setError(getErrorMessage(failure));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [goalId, revision]);

  const amount = (record: TransferRecord, fee = false) =>
    areBalancesVisible
      ? unitsText(
          fee ? record.intent.feeUnits : record.intent.quantityUnits,
          record.intent.unitScale,
        ) +
        " " +
        (units[record.intent.unit] ?? record.intent.unit)
      : "****";
  const endpoint = (record: TransferRecord, side: "source" | "destination") => {
    const value = record.intent[side];
    const reference = record.goals?.[side];
    return (
      (reference?.name ?? "Objetivo no disponible") +
      (reference?.deleted
        ? " (objetivo eliminado)"
        : !reference
          ? " (no existe)"
          : "") +
      " / " +
      value.platform
    );
  };
  const updatePending = async (retry: boolean) => {
    if (!selected || busy || (retry && selected.processing !== false)) return;
    setBusy(true);
    try {
      const { result: current } = await transfersService.byKey(
        selected.intent.idempotencyKey,
      );
      const { result } =
        retry && current.status === "pending" && current.processing === false
          ? await transfersService.retry(selected.id)
          : { result: current };
      if (!alive.current) return;
      setSelected((current) => (current?.id === result.id ? result : current));
      setRecords((current) =>
        current.map((item) => (item.id === result.id ? result : item)),
      );
      if (result.status !== "pending") await onChanged();
      else
        toastService.info(
          "Transferencia en proceso",
          "No registres otra por el mismo dinero. Podés consultar su estado nuevamente.",
        );
    } catch (failure: unknown) {
      toastService.error(
        "No pudimos actualizar la transferencia",
        getErrorMessage(failure),
      );
    } finally {
      if (alive.current) setBusy(false);
    }
  };

  if (loading)
    return (
      <div
        role="status"
        aria-label="Cargando transferencias"
        className="space-y-3"
      >
        {[1, 2].map((key) => (
          <div
            key={key}
            className="h-20 animate-pulse rounded-2xl bg-outline/8"
          />
        ))}
      </div>
    );
  if (error)
    return (
      <p role="alert" className="text-sm text-ember">
        {error}
      </p>
    );
  return (
    <>
      <p className="mb-4 text-xs text-body/45">
        Últimas 50 transferencias de este objetivo, de todos los meses. No son
        aportes ni consumen presupuesto de Cashy.
      </p>
      {!records.length ? (
        <p className="py-8 text-center text-sm text-body/45">
          Todavía no registraste transferencias.
        </p>
      ) : (
        <div className="space-y-3">
          {records.map((record) => (
            <button
              key={record.id}
              type="button"
              onClick={() => setSelected(record)}
              className="flex w-full items-center gap-4 rounded-2xl border border-outline/8 bg-surface p-4 text-left transition hover:border-secondary/40 focus-visible:outline-2 focus-visible:outline-secondary"
            >
              <ArrowLeftRight size={19} className="shrink-0 text-secondary" />
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-bold text-primary">
                  {amount(record)} · {statuses[record.status]}
                </span>
                <span className="mt-1 block text-xs text-secondary">
                  {endpoint(record, "source")} →{" "}
                  {endpoint(record, "destination")}
                </span>
                <span className="mt-1 block text-xs text-body/45">
                  {formatDateTime(record.effectiveAt)}
                </span>
              </span>
            </button>
          ))}
        </div>
      )}
      {selected ? (
        <Modal
          eyebrow="Actividad de transferencias"
          title="Detalle de transferencia"
          onClose={() => setSelected(null)}
        >
          <dl className="space-y-4 text-sm text-primary">
            <div>
              <dt className="text-body/50">Estado</dt>
              <dd className="font-bold">{statuses[selected.status]}</dd>
            </div>
            <div>
              <dt className="text-body/50">Origen</dt>
              <dd>{endpoint(selected, "source")}</dd>
            </div>
            <div>
              <dt className="text-body/50">Destino</dt>
              <dd>{endpoint(selected, "destination")}</dd>
            </div>
            <div>
              <dt className="text-body/50">Cantidad recibida</dt>
              <dd className="font-bold">{amount(selected)}</dd>
            </div>
            <div>
              <dt className="text-body/50">
                Comisión adicional debitada del origen
              </dt>
              <dd>{amount(selected, true)}</dd>
            </div>
            <div>
              <dt className="text-body/50">Fecha del registro</dt>
              <dd>{formatDateTime(selected.effectiveAt)}</dd>
            </div>
            {selected.bookValue ? (
              <div>
                <dt className="text-body/50">Costo contable trasladado</dt>
                <dd>
                  <SensitiveMoney
                    amount={Number(selected.bookValue.delivered.ars)}
                    currency="ARS"
                    fractionDigits={2}
                  />{" "}
                  /{" "}
                  <SensitiveMoney
                    amount={Number(selected.bookValue.delivered.usd)}
                    currency="USD"
                  />
                </dd>
                <dt className="mt-2 text-body/50">
                  Costo contable de la comisión
                </dt>
                <dd>
                  <SensitiveMoney
                    amount={Number(selected.bookValue.commission.ars)}
                    currency="ARS"
                    fractionDigits={2}
                  />{" "}
                  /{" "}
                  <SensitiveMoney
                    amount={Number(selected.bookValue.commission.usd)}
                    currency="USD"
                  />
                </dd>
                {selected.bookValue.delivered.hasUnconvertedAmounts ? (
                  <dd className="mt-2 text-body/50">
                    Hay importes sin conversión registrada.
                  </dd>
                ) : null}
              </div>
            ) : null}
            {selected.intent.notes ? (
              <div>
                <dt className="text-body/50">Notas</dt>
                <dd className="whitespace-pre-wrap">{selected.intent.notes}</dd>
              </div>
            ) : null}
            {selected.rejectionCode ? (
              <div>
                <dt className="text-body/50">Motivo del rechazo</dt>
                <dd>{selected.rejectionCode}. No se modificaron los saldos.</dd>
              </div>
            ) : null}
            <div>
              <dt className="text-body/50">Referencia de la operación</dt>
              <dd className="break-all text-xs">{selected.id}</dd>
            </div>
          </dl>
          <p className="mt-5 text-xs leading-5 text-body/50">
            Solo registra la redistribución. No mueve dinero real, no vende
            activos y no modifica aportes de Cashy. Los registros de origen y
            destino no se pueden editar ni eliminar por separado.
          </p>
          {selected.status === "pending" ? (
            <div className="mt-5 flex flex-wrap gap-3">
              <button
                type="button"
                disabled={busy}
                onClick={() => void updatePending(false)}
                className="inline-flex items-center gap-2 rounded-xl border border-outline/15 px-4 py-3 text-sm font-bold text-primary"
              >
                {busy ? (
                  <LoaderCircle size={16} className="animate-spin" />
                ) : (
                  <RotateCw size={16} />
                )}
                Consultar estado
              </button>
              <button
                type="button"
                disabled={busy || selected.processing !== false}
                onClick={() => void updatePending(true)}
                className="rounded-xl bg-brand px-4 py-3 text-sm font-bold text-white disabled:opacity-50"
              >
                Reintentar la misma operación
              </button>
            </div>
          ) : null}
        </Modal>
      ) : null}
    </>
  );
}
