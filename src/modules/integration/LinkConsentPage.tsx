import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { sessionService } from "@/common/services/session.service";
import { getErrorMessage } from "@/utils/error.utils";
import { integrationService } from "./integration.service";
import { capturePendingLink, clearPendingLink } from "./pending-link";
import type { LinkConsent } from "./integration.types";

export function LinkConsentPage() {
  const navigate = useNavigate();
  const [requestToken] = useState(capturePendingLink);
  const [consent, setConsent] = useState<LinkConsent>();
  const [error, setError] = useState(
    requestToken
      ? ""
      : "Iniciá la conexión desde la sección Inversiones o Cuenta de Cashy.",
  );
  const [loading, setLoading] = useState(!!requestToken);
  const [busy, setBusy] = useState(false);
  const [now, setNow] = useState(Date.now);
  const [attempt, setAttempt] = useState(0);
  const decisionPending = useRef(false);

  useEffect(() => {
    if (!requestToken) {
      return;
    }
    if (!sessionService.hasSession()) {
      navigate("/login", { replace: true });
      return;
    }
    let active = true;
    integrationService
      .preview(requestToken)
      .then((response) => {
        if (active) setConsent(response.result);
      })
      .catch((failure: unknown) => {
        if (!active) return;
        if (!sessionService.hasSession()) navigate("/login", { replace: true });
        else setError(getErrorMessage(failure));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [requestToken, navigate, attempt]);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const remaining = consent
    ? Math.max(0, Math.ceil((Date.parse(consent.expiresAt) - now) / 1000))
    : 0;
  const expired = !!consent && remaining === 0;

  const decide = async (accept: boolean) => {
    if (
      decisionPending.current ||
      !requestToken ||
      (accept && (!consent || expired))
    )
      return;
    decisionPending.current = true;
    setBusy(true);
    setError("");
    try {
      const response =
        accept && consent
          ? await integrationService.approve(requestToken, consent.growlyUserId)
          : await integrationService.deny(requestToken);
      clearPendingLink();
      window.location.assign(response.result.redirectUrl);
    } catch (failure) {
      setError(getErrorMessage(failure));
      if (!sessionService.hasSession()) navigate("/login", { replace: true });
    } finally {
      decisionPending.current = false;
      setBusy(false);
    }
  };

  const switchAccount = () => {
    sessionService.clear();
    navigate("/login", { replace: true });
  };

  const leave = () => {
    clearPendingLink();
    navigate("/home", { replace: true });
  };

  return (
    <main className="min-h-screen bg-page px-4 py-10 text-body">
      <article className="mx-auto max-w-2xl rounded-3xl border border-outline/15 bg-surface p-6 sm:p-8">
        <p className="text-xs font-bold uppercase tracking-widest text-secondary">
          Conexión de cuentas
        </p>
        <h1 className="mt-3 font-display text-3xl text-primary">
          Conectar Growly con Cashy
        </h1>
        <p className="mt-4 text-sm leading-6">
          Revisá las cuentas y los permisos antes de autorizar. Tus correos
          pueden ser diferentes.
        </p>
        {loading ? (
          <p className="mt-5" role="status">
            Consultando la solicitud…
          </p>
        ) : null}
        {error ? (
          <p
            className="mt-5 rounded-xl bg-red-500/10 p-4 text-sm text-red-600"
            role="alert"
          >
            {error}
          </p>
        ) : null}
        {consent ? (
          <>
            <dl className="mt-6 grid gap-4 rounded-2xl border border-outline/15 p-4 sm:grid-cols-2">
              <div>
                <dt className="text-sm text-body/60">Cuenta Cashy</dt>
                <dd className="mt-1 break-all font-bold">
                  {consent.cashyEmail}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-body/60">Cuenta Growly</dt>
                <dd className="mt-1 break-all font-bold">
                  {consent.growlyEmail}
                </dd>
              </div>
            </dl>
            <h2 className="mt-6 text-lg font-bold">Qué autorizás</h2>
            <ul className="mt-3 list-disc space-y-3 pl-5 text-sm leading-6">
              {consent.permissions.includes("portfolio:read") && (
                <li>
                  Cashy podrá consultar el valor contable total de tu cartera y
                  su distribución por plataforma, incluyendo los objetivos y
                  fondos que no provienen de Cashy.
                </li>
              )}
              <li>
                Growly podrá consultar lo asignado en Cashy para ahorro e
                inversiones y su disponibilidad mensual.
              </li>
              <li>
                Growly podrá registrar, corregir o anular el consumo de esa
                asignación cuando elijas usarla para un aporte.
              </li>
              <li>
                Cashy podrá consultar el estado de los aportes asociados a su
                presupuesto para mostrar cuánto utilizaste y cuánto queda.
              </li>
            </ul>
            <details className="mt-5 rounded-2xl border border-outline/15 p-4 text-sm leading-6">
              <summary className="cursor-pointer font-bold">
                Duración y alcance del acceso
              </summary>
              <p className="mt-3">
                Estos permisos podrán utilizarse aunque no tengas la otra app
                abierta, mientras la conexión permanezca activa. Vincular las
                cuentas no inicia automáticamente una sesión en la otra
                aplicación.
              </p>
              <p className="mt-3">
                La autorización no incluye contraseñas, gastos personales ni
                acceso a toda tu cartera. Tus compras, ventas y objetivos se
                administran en Growly. Los movimientos ya registrados se
                conservan cuando se revoca una conexión.
              </p>
              <p className="mt-3">
                Podés revocar estos permisos desde la configuración de
                cualquiera de las dos apps. Las operaciones ya aceptadas podrán
                terminar de sincronizarse; no se autorizarán nuevos movimientos.
              </p>
            </details>
            <p className="mt-5 text-sm text-body/65" role="status">
              {expired
                ? "La solicitud venció. Iniciá una nueva conexión desde Cashy."
                : "Tiempo restante para confirmar: " + remaining + " segundos."}
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                disabled={busy || expired || !!error}
                onClick={() => void decide(true)}
                className="rounded-xl bg-primary px-5 py-3 font-bold text-white disabled:opacity-50"
              >
                {busy ? "Procesando…" : "Aceptar y vincular"}
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => void decide(false)}
                className="rounded-xl border border-outline/20 px-5 py-3 font-bold disabled:opacity-50"
              >
                Cancelar
              </button>
            </div>
            <button
              type="button"
              disabled={busy}
              onClick={switchAccount}
              className="mt-5 text-sm font-bold text-primary underline"
            >
              Usar otra cuenta Growly
            </button>
          </>
        ) : null}
        {error && requestToken ? (
          <button
            type="button"
            disabled={busy || loading}
            onClick={() => {
              setLoading(true);
              setError("");
              setConsent(undefined);
              setAttempt((value) => value + 1);
            }}
            className="mt-5 rounded-xl border border-outline/20 px-4 py-2"
          >
            Volver a consultar
          </button>
        ) : null}
        <div className="mt-6 text-sm">
          {requestToken ? (
            <button
              type="button"
              disabled={busy}
              onClick={leave}
              className="text-primary underline"
            >
              Salir sin completar la conexión
            </button>
          ) : (
            <Link to="/home" className="text-primary underline">
              Volver a Growly
            </Link>
          )}
        </div>
      </article>
    </main>
  );
}
