import { useCallback, useEffect, useRef, useState } from "react";
import { toastService } from "@/common/services/toast.service";
import { contributionStatusLabels } from "./contribution-status";
import { integrationService } from "./integration.service";
import type { ContributionJobView } from "./contribution.types";
import { SensitiveMoney } from "@/common/components/BalancePrivacy";
import { getErrorMessage } from "@/utils/error.utils";
import { CashyContributionActions } from "./CashyContributionActions";

export function CashyContributionsPanel({
  goalId,
  onChanged,
  trackedId = "",
}: Readonly<{
  goalId: string;
  trackedId?: string;
  onChanged(): Promise<void>;
}>) {
  const [jobs, setJobs] = useState<ContributionJobView[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState("");
  const previousStatuses = useRef(
    new Map<string, ContributionJobView["status"]>(),
  );
  const notified = useRef(new Set<string>());
  const pending = useRef(false);
  const alive = useRef(false),
    inFlight = useRef(false);
  const signature = useRef("");
  const changed = useRef(onChanged);
  useEffect(() => {
    changed.current = onChanged;
  }, [onChanged]);
  const reload = useCallback(async () => {
    if (inFlight.current) return;
    inFlight.current = true;
    setLoading(true);
    try {
      const { result } = await integrationService.contributions(goalId);
      if (!alive.current) return;
      for (const job of result) {
        if (
          job.status !== "pending" &&
          (previousStatuses.current.get(job.id) === "pending" ||
            job.id === trackedId) &&
          !notified.current.has(job.id)
        ) {
          notified.current.add(job.id);
          if (job.status === "confirmed")
            toastService.success("Aporte de Cashy confirmado", job.message);
          else
            toastService.error(
              "El aporte de Cashy requiere atención",
              job.message,
            );
        }
        previousStatuses.current.set(job.id, job.status);
      }
      setJobs(result);
      pending.current = result.some((job) => job.status === "pending");
      setError("");
      const next = result
        .filter((job) => job.status === "confirmed")
        .map((job) => job.id + ":" + job.revision)
        .sort()
        .join(",");
      if (signature.current !== next) {
        await changed.current();
        signature.current = next;
      }
    } catch (failure) {
      if (alive.current) setError(getErrorMessage(failure));
    } finally {
      inFlight.current = false;
      if (alive.current) setLoading(false);
    }
  }, [goalId, trackedId]);
  useEffect(() => {
    alive.current = true;
    const initial = window.setTimeout(() => void reload(), 0);
    const timer = window.setInterval(() => {
      if (pending.current && document.visibilityState === "visible")
        void reload();
    }, 15000);
    return () => {
      alive.current = false;
      window.clearTimeout(initial);
      window.clearInterval(timer);
    };
  }, [reload]);
  return (
    <section aria-label="Actividad de Cashy">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-body/55">
          Últimos 50 aportes de este objetivo, de todos los meses.
        </p>
      </div>
      {error && (
        <p role="alert" className="mt-3 text-sm text-ember">
          {error} No se pudo verificar el estado actual.
        </p>
      )}
      {loading && !jobs.length && (
        <p role="status" className="mt-4 text-sm text-body/55">
          Cargando aportes…
        </p>
      )}
      {!loading && !jobs.length && !error && (
        <p className="rounded-3xl border border-dashed border-outline/15 py-16 text-center text-sm text-body/45">
          Todavía no hay aportes de Cashy para este objetivo.
        </p>
      )}
      <ul className="mt-4 space-y-3">
        {jobs.map((job) => (
          <li
            key={job.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-outline/8 bg-surface p-4 text-sm"
          >
            <button
              type="button"
              onClick={() => setSelectedId(job.id)}
              className="flex-1 rounded-xl text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-secondary"
              aria-label={"Ver detalle del aporte de Cashy de " + job.period}
            >
              <p className="font-bold text-primary">
                <SensitiveMoney
                  amount={
                    (job.status === "voided"
                      ? job.originalAmountMinor
                      : job.amountMinor) / 100
                  }
                  currency={job.currency}
                />
                {" · "}
                {job.period}
                {" · "}
                {contributionStatusLabels[job.status]}
              </p>
              <p className="mt-1 text-xs text-body/55">
                {job.platform} · {job.message}
              </p>
            </button>
            <CashyContributionActions
              job={job}
              detailOpen={selectedId === job.id}
              onDetailClose={() => setSelectedId("")}
              onChanged={async () => {
                await reload();
                await changed.current();
              }}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
