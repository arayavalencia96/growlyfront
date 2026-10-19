import { useCallback, useEffect, useRef, useState } from "react";
import { integrationService } from "./integration.service";
import { clearPendingLink } from "./pending-link";
import { getErrorMessage } from "@/utils/error.utils";
import type {
  AccountLinkState,
  IntegrationPermission,
} from "./integration.types";

const permissionLabels: Record<IntegrationPermission, string> = {
  "allocations:read":
    "Growly consulta la asignación mensual y su disponibilidad.",
  "contributions:write":
    "Growly registra, corrige y anula aportes asociados al presupuesto.",
  "portfolio:read":
    "Cashy consulta el valor contable total y por plataforma de Growly, sin mantener tu sesión abierta.",
  "contributions:read":
    "Cashy consulta los aportes asociados a sus asignaciones.",
};

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("es-AR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function CashyConnectionPanel({
  accountEmail,
}: Readonly<{ accountEmail: string }>) {
  const [state, setState] = useState<AccountLinkState>();
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [confirmingId, setConfirmingId] = useState("");
  const latestState = useRef<AccountLinkState | undefined>(undefined);
  const alive = useRef(true);
  const inFlight = useRef(false);
  const decisionPending = useRef(false);

  const applyState = useCallback((next: AccountLinkState) => {
    latestState.current = next;
    if (alive.current) {
      setState(next);
      setError("");
    }
  }, []);

  const reload = useCallback(async () => {
    if (inFlight.current || decisionPending.current) return;
    inFlight.current = true;
    try {
      const response = await integrationService.status();
      if (alive.current) applyState(response.result);
    } catch (failure) {
      if (alive.current) setError(getErrorMessage(failure));
    } finally {
      inFlight.current = false;
      if (alive.current) setLoading(false);
    }
  }, [applyState]);

  useEffect(() => {
    alive.current = true;
    void reload();
    const timer = window.setInterval(() => {
      if (
        latestState.current?.status === "revocation-pending" &&
        document.visibilityState === "visible"
      )
        void reload();
    }, 15000);
    return () => {
      alive.current = false;
      window.clearInterval(timer);
    };
  }, [reload, accountEmail]);

  const revoke = async () => {
    if (!confirmingId || decisionPending.current || inFlight.current) return;
    decisionPending.current = true;
    setBusy(true);
    setError("");
    try {
      const response = await integrationService.revoke(confirmingId);
      clearPendingLink();
      if (alive.current) {
        applyState(response.result);
        setConfirmingId("");
        setMessage(
          response.result.status === "revocation-pending"
            ? "Guardamos tu solicitud. El acceso está bloqueado en Growly y se confirmará con Cashy automáticamente."
            : "La conexión seleccionada quedó revocada. Los movimientos y el historial se conservaron.",
        );
      }
    } catch (failure) {
      if (alive.current) setError(getErrorMessage(failure));
    } finally {
      decisionPending.current = false;
      if (alive.current) setBusy(false);
    }
  };

  const link = state && state.status !== "not-linked" ? state.link : undefined;
  const pending = state?.status === "revocation-pending";

  return (
    <section className="rounded-[1.75rem] border border-outline/15 bg-surface p-6 sm:p-7">
      <p className="text-xs font-bold uppercase tracking-widest text-secondary">
        Cuenta conectada
      </p>
      <h2 className="mt-2 font-display text-3xl text-primary">
        Growly y Cashy
      </h2>
      {loading ? (
        <p className="mt-4 text-sm" role="status">
          Consultando conexión…
        </p>
      ) : null}
      {message ? (
        <p className="mt-4 text-sm text-secondary" role="status">
          {message}
        </p>
      ) : null}
      {error ? (
        <p className="mt-4 text-sm text-ember" role="alert">
          {error}
        </p>
      ) : null}
      {link ? (
        <>
          <p className="mt-4 text-sm font-bold">
            {pending ? "Desvinculación pendiente" : "Cuenta vinculada"}
          </p>
          <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-body/55">Cuenta Cashy</dt>
              <dd className="break-all font-bold">{link.cashyEmail}</dd>
            </div>
            <div>
              <dt className="text-body/55">Vinculada desde</dt>
              <dd>{formatDate(link.linkedAt)}</dd>
            </div>
          </dl>
          <details className="mt-5 rounded-xl border border-outline/15 p-4">
            <summary className="cursor-pointer text-sm font-bold">
              {pending ? "Permisos suspendidos" : "Permisos concedidos"}
            </summary>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-body/65">
              {link.permissions.map((permission) => (
                <li key={permission}>{permissionLabels[permission]}</li>
              ))}
            </ul>
            <p className="mt-3 text-sm leading-6 text-body/60">
              La conexión permite esos accesos aunque la otra app no esté
              abierta. Growly puede consultar el presupuesto mensual y confirmar
              los aportes que elijas vincular.
            </p>
          </details>
          {pending ? (
            <p className="mt-4 text-sm leading-6 text-body/65">
              Solicitaste la desvinculación el {formatDate(state.requestedAt)}.
              Se reintentará hasta confirmar la revocación con Cashy, incluso si
              cerrás esta página.
            </p>
          ) : (
            <>
              {state?.status === "active" && (!state.detailsFresh || error) ? (
                <p className="mt-4 text-sm text-ember">
                  No se pudo confirmar toda la información actual. Se muestra la
                  última referencia conocida.
                </p>
              ) : null}
              {state?.status === "active" &&
              state.detailsFresh &&
              !state.accessAvailable ? (
                <p className="mt-4 text-sm text-ember">
                  El acceso compartido está temporalmente suspendido. La
                  conexión se conserva.
                </p>
              ) : null}
              {confirmingId ? (
                <div className="mt-5 rounded-xl border border-ember/25 p-4">
                  <p className="text-sm leading-6">
                    ¿Desvincular esta cuenta Cashy? Se revocarán los permisos en
                    ambas apps. Los movimientos y el historial se conservarán.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <button
                      type="button"
                      disabled={busy || loading}
                      onClick={() => void revoke()}
                      className="rounded-xl bg-ember px-4 py-3 font-bold text-white disabled:opacity-50"
                    >
                      Confirmar desvinculación
                    </button>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => setConfirmingId("")}
                      className="rounded-xl border border-outline/20 px-4 py-3 font-bold"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : null}
            </>
          )}
        </>
      ) : !loading && !error ? (
        <p className="mt-4 text-sm leading-6 text-body/65">
          {state?.enabled
            ? "No tenés una cuenta Cashy vinculada. Para conectar ambas cuentas, iniciá el proceso desde Inversiones o Configuración → Cuenta en Cashy."
            : "La integración no está habilitada en este entorno."}
        </p>
      ) : null}
      <div className="mt-5 flex flex-wrap items-center justify-between gap-4 text-sm">
        {state?.peerFrontendUrl ? (
          <a
            href={state.peerFrontendUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-xl border border-outline/20 px-4 py-3 font-bold text-primary transition hover:bg-primary/5"
          >
            Abrir Cashy
          </a>
        ) : null}
        {link && !pending && !confirmingId ? (
          <button
            type="button"
            disabled={busy || loading}
            onClick={() => setConfirmingId(link.id)}
            className="ml-auto rounded-xl border border-ember/25 px-4 py-3 text-sm font-bold text-ember disabled:opacity-50"
          >
            Desvincular
          </button>
        ) : null}
      </div>
    </section>
  );
}
