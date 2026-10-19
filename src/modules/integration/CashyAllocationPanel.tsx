import { useCallback, useEffect, useRef, useState } from "react";
import { RefreshButton } from "@/common/components/RefreshButton";
import { integrationService } from "./integration.service";
import type { LinkedAllocationState } from "./allocation.types";
import { getErrorMessage } from "@/utils/error.utils";
import { SensitiveMoney } from "@/common/components/BalancePrivacy";
import { CashyAllocationSkeleton } from "@/modules/goals/components/GoalsSkeletons";

export function CashyAllocationPanel({
  onInitialSettled,
}: {
  readonly onInitialSettled?: () => void;
}) {
  const settled = useRef(false);
  const [state, setState] = useState<LinkedAllocationState>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [checkedAt, setCheckedAt] = useState("");
  const inFlight = useRef(false);
  const alive = useRef(false);
  const pending = useRef(false);

  const reload = useCallback(async () => {
    if (inFlight.current) return;
    inFlight.current = true;
    setLoading(true);
    setState(undefined);
    setError("");
    try {
      const response = await integrationService.allocation();
      if (alive.current) {
        setState(response.result);
        pending.current =
          response.result.status === "available" &&
          response.result.allocation.reservedMinor > 0;
        setCheckedAt(
          new Intl.DateTimeFormat("es-AR", { timeStyle: "short" }).format(
            new Date(),
          ),
        );
      }
    } catch (failure) {
      if (alive.current) setError(getErrorMessage(failure));
    } finally {
      inFlight.current = false;
      if (alive.current) {
        setLoading(false);
        if (!settled.current) {
          settled.current = true;
          onInitialSettled?.();
        }
      }
    }
  }, [onInitialSettled]);

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

  if (loading) return <CashyAllocationSkeleton />;

  const allocation =
    state?.status === "available" ? state.allocation : undefined;

  return (
    <aside
      className="mt-6 rounded-3xl border border-outline/10 bg-surface/75 p-5"
      aria-label="Presupuesto de Cashy"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-2xl text-primary">
          Presupuesto mensual de Cashy
        </h2>
        <RefreshButton
          label="Actualizar presupuesto de Cashy"
          loading={loading}
          onClick={() => void reload()}
        />
      </div>
      {error && (
        <p role="alert" className="mt-3 text-sm text-red-600">
          {error} No hay un saldo actualizado disponible.
        </p>
      )}
      {state?.status === "access-paused" && (
        <p className="mt-3 text-sm text-body/60">
          La conexión está suspendida o pendiente de desvinculación. Revisá las
          cuentas conectadas en tu perfil.
        </p>
      )}
      {state?.status === "not-linked" && (
        <p className="mt-3 text-sm text-body/60">
          No hay una vinculación entre tus cuentas de Growly y Cashy. Conectalas
          desde Configuración → Cuenta en Cashy.
        </p>
      )}
      {state?.status === "disabled" && (
        <p className="mt-3 text-sm text-body/60">
          La integración con Cashy no está habilitada en este entorno.
        </p>
      )}
      {state?.status === "not-configured" && (
        <p className="mt-3 text-sm text-body/60">
          Todavía no definiste el sueldo de este mes en Cashy. No se arrastra el
          presupuesto del mes anterior.
        </p>
      )}
      {checkedAt && (
        <p className="mt-2 text-sm text-body/60">
          Consultado a las {checkedAt}
        </p>
      )}
      <dl className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {(
          [
            ["Asignado", allocation?.assignedMinor],
            ["Aportado desde Cashy", allocation?.contributedMinor],
            ["Disponible", allocation?.availableMinor],
          ] as const
        ).map(([label, amount]) => (
          <div key={label}>
            <dt className="text-sm text-body/60">{label}</dt>
            <dd className="mt-1 text-lg font-bold text-primary">
              {amount === undefined ? (
                "N/A"
              ) : (
                <SensitiveMoney amount={amount / 100} currency="ARS" />
              )}
            </dd>
          </div>
        ))}
      </dl>
      {allocation && (
        <>
          {allocation.reservedMinor > 0 && (
            <p role="status" className="mt-3 text-sm text-body/60">
              Hay aportes en proceso por{" "}
              <SensitiveMoney
                amount={allocation.reservedMinor / 100}
                currency="ARS"
              />
              . Este monto está apartado temporalmente del disponible.
            </p>
          )}
          {(allocation.legacyCommittedMinor ?? 0) > 0 && (
            <p className="mt-3 text-sm text-body/60">
              Utilizado antes de Growly:{" "}
              <SensitiveMoney
                amount={(allocation.legacyCommittedMinor ?? 0) / 100}
                currency="ARS"
              />
              .
            </p>
          )}
          {state?.status === "available" && !state.budgetDefined && (
            <p className="mt-3 text-sm text-red-600">
              El presupuesto ya no está definido. Se conservan los aportes y
              reservas existentes.
            </p>
          )}
          {allocation.legacyReviewRequired && (
            <p role="alert" className="mt-3 text-sm text-red-600">
              Hay registros anteriores en Cashy este mes. Revisá allí el
              presupuesto ya utilizado antes de vincular nuevos aportes.
            </p>
          )}
          {allocation.excessMinor > 0 && (
            <p role="alert" className="mt-3 text-sm text-red-600">
              El presupuesto se redujo: hay{" "}
              <SensitiveMoney
                amount={allocation.excessMinor / 100}
                currency="ARS"
              />{" "}
              por encima de lo asignado. El historial se conserva.
            </p>
          )}
          <p className="mt-4 text-sm text-body/60">
            Este monto incluye ahorro e inversión y no es el valor de tu
            cartera. Solo los aportes de Cashy confirmados consumen este
            presupuesto. Las compras, ventas y aportes externos no lo consumen.
            Los movimientos anteriores no se vinculan automáticamente.
          </p>
        </>
      )}
    </aside>
  );
}
