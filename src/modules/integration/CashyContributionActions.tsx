import { Ban, History, Pencil, RotateCw, XCircle } from "lucide-react";
import { Modal } from "@/common/components/Modal";
import { ContributionIconButton } from "./ContributionIconButton";
import { CashyContributionDetail } from "./CashyContributionDetail";
import { useEffect, useRef, useState } from "react";
import type {
  ContributionAdjustmentPayload,
  ContributionAdjustmentView,
  ContributionJobView,
} from "./contribution.types";
import { integrationService } from "./integration.service";
import { getErrorMessage } from "@/utils/error.utils";
import { SensitiveMoney } from "@/common/components/BalancePrivacy";

export function CashyContributionActions({
  job,
  onChanged,
  detailOpen = false,
  onDetailClose,
}: Readonly<{
  job: ContributionJobView;
  onChanged(): Promise<void>;
  detailOpen?: boolean;
  onDetailClose(): void;
}>) {
  const [showHistory, setShowHistory] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [history, setHistory] = useState<ContributionAdjustmentView[]>([]);
  const [mode, setMode] = useState<"edit" | "void">();
  const [amount, setAmount] = useState(String(job.amountMinor / 100));
  const [rate, setRate] = useState(String(job.exchangeRateArsPerUsd));
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const request = useRef<ContributionAdjustmentPayload | undefined>(undefined);
  const pendingStatus = useRef(false);
  const changed = useRef(onChanged);
  useEffect(() => {
    changed.current = onChanged;
  }, [onChanged]);
  useEffect(() => {
    let active = true;
    let inFlight = false;
    const reload = async () => {
      if (inFlight || !active) return;
      inFlight = true;
      try {
        const { result } = await integrationService.contributionAdjustments(
          job.id,
        );
        if (!active) return;
        const wasPending = pendingStatus.current;
        pendingStatus.current = result.some(
          (item) => item.status === "pending",
        );
        setHistory(result);
        setError("");
        if (wasPending && !pendingStatus.current) await changed.current();
      } catch (failure) {
        if (active) setError(getErrorMessage(failure));
      } finally {
        inFlight = false;
      }
    };
    const initial = window.setTimeout(() => {
      setHistoryLoading(true);
      void reload().finally(() => {
        if (active) setHistoryLoading(false);
      });
    }, 0);
    const timer = window.setInterval(() => {
      if (pendingStatus.current && document.visibilityState === "visible")
        void reload();
    }, 15000);
    return () => {
      active = false;
      window.clearTimeout(initial);
      window.clearInterval(timer);
    };
  }, [job.id, job.revision]);
  const pending = history.some((item) => item.status === "pending");
  async function submit() {
    if (!mode || !reason.trim()) return;
    const payload = request.current ?? {
      id: crypto.randomUUID(),
      expectedRevision: job.revision,
      kind: mode,
      ...(mode === "edit"
        ? {
            amount: Number(amount),
            ...(job.currency === "USD"
              ? { exchangeRateArsPerUsd: Number(rate) }
              : {}),
          }
        : {}),
      reason: reason.trim(),
    };
    request.current = payload;
    setSubmitted(true);
    setBusy(true);
    setError("");
    try {
      await integrationService.adjustContribution(job.id, payload);
      request.current = undefined;
      setSubmitted(false);
      setMode(undefined);
      setReason("");
      const { result } = await integrationService.contributionAdjustments(
        job.id,
      );
      setHistory(result);
      pendingStatus.current = result.some((item) => item.status === "pending");
      await onChanged();
    } catch (failure) {
      setError(getErrorMessage(failure));
    } finally {
      setBusy(false);
    }
  }
  async function recover(cancel: boolean) {
    setBusy(true);
    setError("");
    try {
      const { result } = cancel
        ? await integrationService.cancelPendingContribution(job.id)
        : await integrationService.reconcileContribution(job.id);
      if (cancel && result.status === "confirmed")
        setError(
          "El aporte ya estaba confirmado. Para restituir el presupuesto, usá Anular.",
        );
      await onChanged();
    } catch (failure) {
      setError(getErrorMessage(failure));
    } finally {
      setBusy(false);
    }
  }
  function begin(kind: "edit" | "void") {
    request.current = undefined;
    setSubmitted(false);
    setMode(kind);
    setError("");
    setReason("");
    setAmount(String(job.amountMinor / 100));
    setRate(String(job.exchangeRateArsPerUsd));
  }
  const historyContent = (
    <div className="space-y-3 text-sm">
      {historyLoading ? (
        <p role="status">Cargando historial…</p>
      ) : history.length ? (
        <ul className="mt-2 space-y-2">
          {history.map((item) => (
            <li key={item.id}>
              <p>
                {item.kind === "void" ? "Anulación" : "Corrección"} ·{" "}
                {item.status === "pending"
                  ? "Pendiente"
                  : item.status === "applied"
                    ? "Aplicada"
                    : "Rechazada"}{" "}
                ·{" "}
                {new Intl.DateTimeFormat("es-AR", {
                  dateStyle: "short",
                  timeStyle: "short",
                }).format(new Date(item.createdAt))}
              </p>
              <p>
                {item.reason} — {item.message}
              </p>
              <p>
                Consumo del aporte en Cashy:{" "}
                <SensitiveMoney
                  amount={item.beforeAllocationAmountMinor / 100}
                  currency="ARS"
                />{" "}
                → solicitado:{" "}
                <SensitiveMoney
                  amount={item.allocationAmountMinor / 100}
                  currency="ARS"
                />
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-body/55">
          No hay correcciones ni anulaciones registradas.
        </p>
      )}
      {error && (
        <p role="alert" className="text-ember">
          {error}
        </p>
      )}
    </div>
  );
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-1">
        <ContributionIconButton
          label={"Historial de correcciones (" + history.length + ")"}
          icon={History}
          onClick={() => setShowHistory(true)}
        />
        {job.status === "confirmed" && !pending && !mode && (
          <ContributionIconButton
            label="Corregir importe"
            icon={Pencil}
            disabled={busy}
            onClick={() => begin("edit")}
          />
        )}
        {(job.status === "confirmed" ||
          job.status === "reconciliation-required") &&
          !pending &&
          !mode && (
            <ContributionIconButton
              label="Anular aporte"
              icon={Ban}
              destructive
              disabled={busy}
              onClick={() => begin("void")}
            />
          )}
        {job.status === "reconciliation-required" && !pending && (
          <ContributionIconButton
            label="Reintentar conciliación"
            icon={RotateCw}
            disabled={busy}
            onClick={() => void recover(false)}
          />
        )}
        {job.status === "pending" && (
          <ContributionIconButton
            label="Solicitar cancelación pendiente"
            icon={XCircle}
            destructive
            disabled={busy}
            onClick={() => void recover(true)}
          />
        )}
      </div>
      {detailOpen && (
        <Modal
          eyebrow="Actividad de Cashy"
          title="Detalle del aporte"
          onClose={onDetailClose}
        >
          <CashyContributionDetail job={job} />
          <h3 className="mt-6 mb-3 font-bold text-primary">
            Historial de correcciones
          </h3>
          {historyContent}
        </Modal>
      )}
      {showHistory && (
        <Modal
          eyebrow="Actividad de Cashy"
          title="Historial de correcciones"
          onClose={() => setShowHistory(false)}
        >
          {historyContent}
        </Modal>
      )}
      {pending && (
        <p role="status" className="text-amber-700">
          Corrección pendiente: este objetivo no admite movimientos hasta
          completar la sincronización. Podés cerrar la página.
        </p>
      )}
      {mode && (
        <Modal
          eyebrow="Actividad de Cashy"
          title={mode === "void" ? "Anular aporte" : "Corregir importe"}
          onClose={() => {
            if (!busy) setMode(undefined);
          }}
        >
          <form
            onSubmit={(event) => {
              event.preventDefault();
              void submit();
            }}
            className="space-y-3 rounded-xl bg-background p-3"
          >
            <p>
              {mode === "void"
                ? "Anular no elimina el historial. Restituye únicamente el presupuesto del mes original; no equivale a retirar dinero del broker."
                : "La corrección mantiene objetivo, plataforma, fecha, moneda y mes originales."}
            </p>
            <p>
              Si el dinero ya se utilizó, la reducción o anulación será
              rechazada. Las transferencias entre objetivos se registran como
              extracción y aporte externo.
            </p>
            {mode === "edit" && (
              <label className="block">
                Nuevo importe ({job.currency})
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  required
                  value={amount}
                  disabled={busy || submitted}
                  onChange={(event) => setAmount(event.target.value)}
                  className="mt-1 block w-full rounded-lg border p-2"
                />
              </label>
            )}
            {mode === "edit" && job.currency === "USD" && (
              <label className="block">
                Cotización histórica ARS/USD
                <input
                  type="number"
                  min="0.00000001"
                  step="0.00000001"
                  required
                  value={rate}
                  disabled={busy || submitted}
                  onChange={(event) => setRate(event.target.value)}
                  className="mt-1 block w-full rounded-lg border p-2"
                />
              </label>
            )}
            <label className="block">
              Motivo
              <textarea
                required
                maxLength={500}
                value={reason}
                disabled={busy || submitted}
                onChange={(event) => setReason(event.target.value)}
                className="mt-1 block w-full rounded-lg border p-2"
              />
            </label>
            <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
              <button
                type="submit"
                disabled={busy || !reason.trim()}
                className="rounded-2xl bg-brand px-6 py-3 text-sm font-bold text-white transition hover:bg-brand-hover disabled:opacity-50"
              >
                {busy
                  ? "Procesando…"
                  : submitted
                    ? "Reintentar la misma operación"
                    : mode === "void"
                      ? "Confirmar anulación"
                      : "Confirmar corrección"}
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => {
                  setMode(undefined);
                  request.current = undefined;
                  setSubmitted(false);
                }}
                className="rounded-2xl border border-outline/12 bg-surface px-5 py-3 text-sm font-bold text-primary transition hover:bg-page disabled:opacity-50"
              >
                Cerrar
              </button>
            </div>
          </form>
          {error && (
            <p role="alert" className="mt-3 text-ember">
              {error}
            </p>
          )}
        </Modal>
      )}
      {error && (
        <p role="alert" className="text-ember">
          {error}
        </p>
      )}
    </div>
  );
}
