import { useEffect, useRef, useState } from "react";
import { transfersService } from "./transfers.service";
import { buildTransfer, unitsText } from "./transfer-state";
import type { TransferContext, TransferInput } from "./transfer.types";
import { getErrorMessage } from "@/utils/error.utils";
import { INVESTMENT_PLATFORMS } from "@/modules/investment-operations/interfaces/investment-operations.interface";
import { useBalancePrivacy } from "@/common/components/balance-privacy.context";

export function TransferForm({
  goalId,
  goalName,
  busy,
  onSubmit,
  onCancel,
}: {
  goalId: string;
  goalName: string;
  busy: boolean;
  onSubmit(input: TransferInput, enabled: boolean): Promise<void>;
  onCancel(): void;
}) {
  const [context, setContext] = useState<TransferContext | null>(null);
  const [error, setError] = useState("");
  const [sourceKey, setSourceKey] = useState("");
  const [destination, setDestination] = useState("");
  const [platform, setPlatform] = useState("");
  const [amount, setAmount] = useState("");
  const [fee, setFee] = useState("0");
  const [notes, setNotes] = useState("");
  const loading = useRef(false);
  const { areBalancesVisible } = useBalancePrivacy();
  useEffect(() => {
    let active = true;
    transfersService
      .context(goalId)
      .then((data) => {
        if (!active) return;
        setContext(data.result);
        setSourceKey(data.result.sources[0]?.key ?? "");
        setDestination(
          data.result.goals.find((goal) => goal.id !== goalId)?.id ?? goalId,
        );
      })
      .catch((failure: unknown) => {
        if (active) setError(getErrorMessage(failure));
      });
    return () => {
      active = false;
    };
  }, [goalId]);
  const source = context?.sources.find((item) => item.key === sourceKey);
  const inputClass =
    "mt-2 w-full rounded-2xl border border-outline/15 bg-surface px-4 py-3 text-sm text-primary";
  return (
    <form
      className="space-y-5"
      onSubmit={async (event) => {
        event.preventDefault();
        if (busy || loading.current || !source || !context) return;
        loading.current = true;
        setError("");
        try {
          await onSubmit(
            buildTransfer(
              goalId,
              source,
              destination,
              platform,
              amount,
              fee,
              notes,
            ),
            context.enabled,
          );
        } catch (failure: unknown) {
          setError(
            failure instanceof Error
              ? failure.message
              : "No se pudo validar la transferencia.",
          );
        } finally {
          loading.current = false;
        }
      }}
    >
      <p className="text-sm text-body/60">
        Registro interno: no envía dinero ni criptomonedas a un broker o una
        red. No consume ni devuelve presupuesto de Cashy. No realiza
        conversiones ni compras/ventas.
      </p>
      {!context && !error ? (
        <div
          role="status"
          aria-label="Cargando saldos"
          className="grid animate-pulse gap-5 sm:grid-cols-2"
        >
          {[1, 2, 3, 4].map((key) => (
            <div key={key}>
              <div className="mb-2 h-4 w-32 rounded bg-outline/10" />
              <div className="h-12 rounded-2xl bg-outline/10" />
            </div>
          ))}
          <span className="sr-only">
            Consultando saldos disponibles para registrar la transferencia.
          </span>
        </div>
      ) : null}
      {context?.warnings.map((warning) => (
        <p key={warning} className="text-sm text-ember">
          {warning}
        </p>
      ))}
      {context && !context.enabled ? (
        <p className="rounded-2xl bg-accent/30 p-4 text-sm text-primary">
          Modo de validación: podés revisar el formulario. No se registrarán
          transferencias mientras el registro esté deshabilitado en este
          entorno.
        </p>
      ) : null}
      {context ? (
        <fieldset disabled={busy} className="grid gap-5 sm:grid-cols-2">
          <label className="text-sm font-bold text-primary">
            Origen: {goalName}
            <select
              className={inputClass}
              value={sourceKey}
              onChange={(event) => {
                setSourceKey(event.target.value);
                setAmount("");
              }}
              required
            >
              <option value="">Elegí un saldo o posición</option>
              {context.sources.map((item) => (
                <option key={item.key} value={item.key}>
                  {item.platform} · {item.label}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm font-bold text-primary">
            Objetivo de destino
            <select
              className={inputClass}
              value={destination}
              onChange={(event) => setDestination(event.target.value)}
              required
            >
              <option value="">Elegí un objetivo</option>
              {context.goals.map((goal) => (
                <option key={goal.id} value={goal.id}>
                  {goal.name}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm font-bold text-primary">
            Plataforma de destino
            <input
              className={inputClass}
              list="transfer-platforms"
              value={platform}
              onChange={(event) => setPlatform(event.target.value)}
              maxLength={80}
              required
              autoComplete="off"
            />
            <datalist id="transfer-platforms">
              {[
                ...new Set([...INVESTMENT_PLATFORMS, ...context.platforms]),
              ].map((name) => (
                <option key={name} value={name} />
              ))}
            </datalist>
          </label>
          <div className="text-sm text-body/60">
            Disponible:{" "}
            {source
              ? areBalancesVisible
                ? unitsText(source.availableUnits, source.scale) +
                  " " +
                  source.label
                : "****"
              : "N/A"}
            <p className="mt-2 text-xs">
              Consultado:{" "}
              {new Date(context.consultedAt).toLocaleTimeString("es-AR")}. Se
              valida nuevamente al confirmar; no reserva fondos.
            </p>
          </div>
          <label className="text-sm font-bold text-primary">
            {source?.kind === "crypto"
              ? "Cantidad que recibe el destino"
              : "Importe que recibe el destino"}
            <input
              className={inputClass}
              inputMode="decimal"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              maxLength={40}
              required
              autoComplete="off"
            />
          </label>
          <label className="text-sm font-bold text-primary">
            Comisión ({source?.label ?? "misma unidad"})
            <input
              className={inputClass}
              inputMode="decimal"
              value={fee}
              onChange={(event) => setFee(event.target.value)}
              maxLength={40}
              required
              autoComplete="off"
            />
            <span className="mt-1 block text-xs font-normal text-body/50">
              El origen descuenta importe + comisión. No se admite gas en otro
              activo.
            </span>
          </label>
          <label className="text-sm font-bold text-primary sm:col-span-2">
            Notas
            <textarea
              className={inputClass}
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              maxLength={500}
              rows={3}
            />
          </label>
        </fieldset>
      ) : null}
      {error ? (
        <p role="alert" className="text-sm text-ember">
          {error}
        </p>
      ) : null}
      {context && !context.sources.length ? (
        <p className="text-sm text-body/60">
          No hay saldo o criptomonedas identificadas disponibles para
          transferir.
        </p>
      ) : null}
      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={busy}
          className="rounded-2xl border border-outline/15 bg-surface px-5 py-3 text-sm font-bold text-primary transition hover:bg-page disabled:opacity-50"
        >
          Cerrar
        </button>
        <button
          type="submit"
          disabled={busy || !source || !context}
          className="rounded-2xl bg-brand px-5 py-3 text-sm font-bold text-white transition hover:bg-brand-hover disabled:opacity-50"
        >
          {busy
            ? "Registrando…"
            : !context
              ? error
                ? "No disponible"
                : "Cargando saldos…"
              : context.enabled
                ? "Registrar transferencia"
                : "Validar sin registrar"}
        </button>
      </div>
    </form>
  );
}
