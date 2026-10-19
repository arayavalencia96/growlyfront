import { ArrowLeftRight } from "lucide-react";
import { useEffect, useEffectEvent, useRef, useState } from "react";
import { toast } from "sonner";
import { Modal } from "@/common/components/Modal";
import { ApiError } from "@/common/errors/api.error";
import type { IGoal } from "@/modules/goals/interfaces/goals.interface";
import { getErrorMessage } from "@/utils/error.utils";
import { TransferForm } from "./TransferForm";
import { transfersService } from "./transfers.service";
import {
  clearPending,
  readDraft,
  readPending,
  rememberRecord,
  rememberTransfer,
  restoreDraft,
} from "./transfer-state";
import type {
  PendingTransfer,
  TransferInput,
  TransferRecord,
} from "./transfer.types";

export function TransferControl({
  goal,
  onChanged,
}: {
  goal: IGoal;
  onChanged(): Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [canRetry, setCanRetry] = useState(false);
  const canRetryRef = useRef(false);
  const [pending, setPending] = useState<PendingTransfer | null>(() =>
    readPending(goal.userId),
  );
  const [message, setMessage] = useState("");
  const pendingRef = useRef(pending);
  const sending = useRef(false);
  const alive = useRef(true);
  const toastId = "transfer:" + goal.userId;
  const pendingKey = pending?.key;
  const pendingRecordId = pending?.recordId;
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);
  const assignPending = (next: PendingTransfer | null) => {
    if (!next || next.key !== pendingRef.current?.key) {
      canRetryRef.current = false;
      if (alive.current) setCanRetry(false);
    }
    pendingRef.current = next;
    if (alive.current) setPending(next);
  };
  const handleRecord = async (record: TransferRecord) => {
    const current = pendingRef.current;
    if (
      !current ||
      record.userId !== goal.userId ||
      current.key !== record.intent.idempotencyKey
    )
      throw new Error(
        "La respuesta no coincide con la operación de tu cuenta.",
      );
    if (record.status === "pending") {
      canRetryRef.current = record.processing === false;
      if (alive.current) setCanRetry(canRetryRef.current);
      if (current.recordId !== record.id) {
        try {
          assignPending(rememberRecord(goal.userId, current, record.id));
        } catch {
          assignPending({ ...current, recordId: record.id });
        }
      }
      if (alive.current)
        setMessage(
          record.processing === false
            ? "El registro está pendiente, sin un proceso activo. Podés consultar o reintentar la misma operación."
            : "Registro recibido. Se está procesando; no lo vuelvas a registrar.",
        );
      if (record.processing === false) toast.dismiss(toastId);
      else toast.loading("Registrando transferencia…", { id: toastId });
      return;
    }
    try {
      clearPending(goal.userId, current.key);
    } catch {
      toast.warning(
        "El movimiento terminó, pero no se pudo limpiar su clave local.",
      );
    }
    assignPending(null);
    if (alive.current) setMessage("");
    if (record.status === "completed") {
      toast.success("Transferencia registrada", {
        id: toastId,
        description:
          "Registro interno confirmado. No se envió dinero a una plataforma ni se modificó el presupuesto de Cashy.",
      });
    } else
      toast.error("Transferencia rechazada", {
        id: toastId,
        description:
          record.rejectionCode === "INSUFFICIENT_BALANCE"
            ? "No había saldo suficiente al confirmar. No se registraron débitos ni créditos."
            : "No se aplicaron movimientos. Revisá el origen, los objetivos y la identificación del activo.",
      });
    if (
      alive.current &&
      [record.intent.source.goalId, record.intent.destination.goalId].includes(
        goal.id,
      )
    )
      await onChanged().catch(() =>
        toast.warning(
          "El movimiento terminó. Recargá para actualizar la vista.",
        ),
      );
  };
  const recordFromEffect = useEffectEvent(handleRecord);
  useEffect(() => {
    if (!pendingKey || busy) return;
    let active = true;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let attempts = 0;
    const poll = async () => {
      if (!active) return;
      try {
        const { result } = await transfersService.byKey(pendingKey);
        if (!active) return;
        await recordFromEffect(result);
        if (!active) return;
        if (result.status === "pending" && ++attempts < 20)
          timer = setTimeout(() => {
            void poll();
          }, 15000);
        else if (result.status === "pending") {
          setMessage(
            "El seguimiento automático se pausó. Consultá el estado; solo se puede reintentar cuando no hay un proceso activo.",
          );
          toast.dismiss(toastId);
        }
      } catch (error: unknown) {
        if (!active) return;
        canRetryRef.current =
          error instanceof ApiError &&
          error.statusCode === 404 &&
          !pendingRef.current?.recordId;
        setCanRetry(canRetryRef.current);
        setMessage(
          error instanceof ApiError && error.statusCode === 404
            ? "No se encontró la solicitud todavía. Conservá esta clave y reintentá los mismos datos, sin crear otra operación."
            : "No se pudo consultar el estado. Conservamos la clave para recuperarlo.",
        );
        toast.dismiss(toastId);
      }
    };
    void poll();
    return () => {
      active = false;
      if (timer) clearTimeout(timer);
      toast.dismiss(toastId);
    };
  }, [pendingKey, pendingRecordId, goal.userId, toastId, busy]);

  const submit = async (input: TransferInput, enabled: boolean) => {
    if (sending.current) return;
    sending.current = true;
    setBusy(true);
    let sent = false;
    let newKey = false;
    try {
      toast.loading("Validando disponibilidad y cantidad…", { id: toastId });
      const original = pendingRef.current;
      if (original) {
        if (!canRetryRef.current)
          throw new Error(
            "La solicitud todavía se está procesando. Consultá su estado antes de reintentar.",
          );
        if (original.goalId !== input.source.goalId)
          throw new Error(
            "Abrí el objetivo de origen original para recuperar el formulario.",
          );
        input = { ...input, idempotencyKey: original.key };
      }
      await transfersService.preview(input);
      if (!enabled) {
        toast.success("Validación correcta · no registrada", {
          id: toastId,
          description:
            "Esta etapa solo permite probar el formulario. No se reservaron ni movieron fondos.",
        });
        return;
      }
      if (original) restoreDraft(goal.userId, original, input);
      else {
        assignPending(rememberTransfer(goal.userId, input));
        newKey = true;
      }
      toast.loading("Registrando solicitud…", { id: toastId });
      sent = true;
      const { result } = await transfersService.submit(input);
      if (alive.current) setOpen(false);
      await handleRecord(result);
    } catch (failure: unknown) {
      if (!sent) {
        if (newKey) {
          clearPending(goal.userId, input.idempotencyKey);
          assignPending(null);
        }
        toast.error("No se pudo validar o preparar la transferencia", {
          id: toastId,
          description:
            failure instanceof Error
              ? failure.message
              : getErrorMessage(failure),
        });
        throw failure;
      }
      if (
        newKey &&
        failure instanceof ApiError &&
        [400, 401, 403].includes(failure.statusCode)
      ) {
        clearPending(goal.userId, input.idempotencyKey);
        assignPending(null);
        toast.error("Solicitud rechazada antes del registro", {
          id: toastId,
          description: getErrorMessage(failure),
        });
        throw failure;
      }
      if (alive.current) {
        setOpen(false);
        setMessage(
          "No pudimos confirmar la respuesta. Conservamos la clave y los datos originales: consultá o reintentá esta operación.",
        );
      }
      toast.warning("Resultado sin confirmar", {
        id: toastId,
        description:
          "No generes otra clave ni repitas el movimiento como una transferencia nueva.",
      });
    } finally {
      sending.current = false;
      if (alive.current) setBusy(false);
    }
  };
  const recover = async (retry: boolean) => {
    const current = pendingRef.current;
    if (!current || sending.current || (retry && !canRetryRef.current)) return;
    sending.current = true;
    setBusy(true);
    try {
      if (!retry) {
        const { result } = await transfersService.byKey(current.key);
        await handleRecord(result);
        return;
      }
      try {
        const { result: latest } = await transfersService.byKey(current.key);
        await handleRecord(latest);
        if (latest.status !== "pending" || latest.processing !== false) return;
      } catch (failure: unknown) {
        if (
          !(failure instanceof ApiError) ||
          failure.statusCode !== 404 ||
          current.recordId
        )
          throw failure;
      }
      const { result: setup } = await transfersService.setup();
      if (!setup.enabled)
        throw new Error(
          "El registro de transferencias está deshabilitado en este entorno.",
        );
      const draft = readDraft(goal.userId, current.key);
      if (!current.recordId && !draft)
        throw new Error(
          "No tenemos los datos originales en esta pestaña. Conservá la clave y consultá su estado; no crees otra operación para reemplazarla.",
        );
      toast.loading("Reintentando la misma operación…", { id: toastId });
      let record: TransferRecord;
      if (current.recordId)
        record = (await transfersService.retry(current.recordId)).result;
      else {
        if (!draft)
          throw new Error(
            "Necesitás reingresar los datos originales con la misma clave.",
          );
        record = (await transfersService.submit(draft)).result;
      }
      await handleRecord(record);
    } catch (failure: unknown) {
      toast.warning("La operación necesita revisión", {
        id: toastId,
        description:
          failure instanceof Error ? failure.message : getErrorMessage(failure),
      });
    } finally {
      sending.current = false;
      if (alive.current) setBusy(false);
    }
  };
  return (
    <div className="contents">
      <button
        type="button"
        onClick={() => setOpen(true)}
        disabled={busy || !!pending || goal.status !== "active"}
        className="inline-flex h-14 items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/8 px-4 py-3 text-sm font-bold text-white transition hover:bg-white/15 disabled:opacity-50"
      >
        <ArrowLeftRight size={18} />
        Registrar transferencia
      </button>
      {pending ? (
        <div
          className="order-last rounded-2xl border border-white/15 bg-white/5 p-4 text-xs leading-5 text-white/80 sm:col-span-3"
          role="status"
        >
          <p>{message || "Consultando la transferencia pendiente…"}</p>
          <p className="mt-2 break-all">Clave: {pending.key}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={() => {
                void recover(false);
              }}
              className="rounded-xl border border-white/20 px-3 py-2"
            >
              Consultar estado
            </button>
            <button
              type="button"
              disabled={busy || !canRetry}
              onClick={() => {
                void recover(true);
              }}
              className="rounded-xl border border-white/20 px-3 py-2 disabled:opacity-40"
            >
              Reintentar la misma
            </button>
            {!pending.recordId && pending.goalId === goal.id ? (
              <button
                type="button"
                disabled={busy || !canRetry}
                onClick={() => setOpen(true)}
                className="rounded-xl border border-white/20 px-3 py-2"
              >
                Reingresar datos · misma clave
              </button>
            ) : null}
          </div>
          {pending.goalId !== goal.id ? (
            <p className="mt-2">
              Para reconstruir el formulario, abrí el objetivo de origen
              original.
            </p>
          ) : null}
        </div>
      ) : null}
      {open ? (
        <Modal
          title="Registrar transferencia"
          eyebrow="Entre objetivos y plataformas"
          onClose={() => {
            if (!sending.current) setOpen(false);
          }}
        >
          <TransferForm
            goalId={goal.id}
            goalName={goal.name}
            busy={busy}
            onSubmit={submit}
            onCancel={() => {
              if (!sending.current) setOpen(false);
            }}
          />
        </Modal>
      ) : null}
    </div>
  );
}
