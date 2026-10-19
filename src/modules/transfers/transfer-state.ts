import { z } from "zod";
import type {
  PendingTransfer,
  TransferInput,
  TransferSource,
} from "./transfer.types";

const endpoint = z.object({
  goalId: z.string().regex(/^[a-f\d]{24}$/i),
  platform: z.string().trim().min(1).max(80),
});
const base = {
  idempotencyKey: z.uuid(),
  source: endpoint,
  destination: endpoint,
  fee: z.string().max(40),
  notes: z.string().max(500),
};
const inputSchema = z.discriminatedUnion("kind", [
  z.object({
    ...base,
    kind: z.literal("cash"),
    currency: z.enum(["ARS", "USD"]),
    amount: z.string().max(40),
  }),
  z.object({
    ...base,
    kind: z.literal("crypto"),
    assetId: z.string().max(80),
    quantity: z.string().max(40),
  }),
]);
const pendingSchema = z.object({
  key: z.uuid(),
  goalId: z.string().regex(/^[a-f\d]{24}$/i),
  recordId: z.uuid().optional(),
});
const storageKey = (userId: string) => "growly.transfer.pending." + userId;

export function readPending(userId: string): PendingTransfer | null {
  try {
    const value = localStorage.getItem(storageKey(userId));
    return value ? pendingSchema.parse(JSON.parse(value)) : null;
  } catch {
    return null;
  }
}
export function rememberTransfer(
  userId: string,
  input: TransferInput,
): PendingTransfer {
  if (readPending(userId))
    throw new Error(
      "Hay una transferencia por resolver. Consultá su estado antes de crear otra.",
    );
  const pending = { key: input.idempotencyKey, goalId: input.source.goalId };
  const key = storageKey(userId);
  sessionStorage.setItem(key, JSON.stringify(input));
  try {
    localStorage.setItem(key, JSON.stringify(pending));
  } catch (error) {
    sessionStorage.removeItem(key);
    throw error;
  }
  return pending;
}
export function readDraft(userId: string, key: string): TransferInput | null {
  try {
    const value = sessionStorage.getItem(storageKey(userId));
    const parsed = value ? inputSchema.parse(JSON.parse(value)) : null;
    return parsed?.idempotencyKey === key ? parsed : null;
  } catch {
    return null;
  }
}
export function restoreDraft(
  userId: string,
  pending: PendingTransfer,
  input: TransferInput,
): void {
  if (
    input.idempotencyKey !== pending.key ||
    input.source.goalId !== pending.goalId
  )
    throw new Error("Usá el objetivo original y la misma clave.");
  sessionStorage.setItem(storageKey(userId), JSON.stringify(input));
}
export function rememberRecord(
  userId: string,
  pending: PendingTransfer,
  recordId: string,
): PendingTransfer {
  const next = { ...pending, recordId };
  localStorage.setItem(storageKey(userId), JSON.stringify(next));
  return next;
}
export function clearPending(userId: string, key: string): void {
  if (readPending(userId)?.key !== key) return;
  localStorage.removeItem(storageKey(userId));
  sessionStorage.removeItem(storageKey(userId));
}
export function unitsText(units: string, scale: number): string {
  const digits = units.padStart(scale + 1, "0");
  return scale ? digits.slice(0, -scale) + "," + digits.slice(-scale) : digits;
}
export function decimalUnits(
  value: string,
  scale: number,
  positive = false,
): bigint {
  const normalized = value.trim().replace(",", ".");
  if (normalized.length > 40 || !/^(0|[1-9]\d*)(\.\d+)?$/.test(normalized))
    throw new Error(
      "Ingresá un número decimal, sin exponentes ni separadores de miles.",
    );
  const [whole, fraction = ""] = normalized.split(".");
  if (fraction.length > scale)
    throw new Error(`Se admiten hasta ${scale} decimales.`);
  const units = BigInt(whole + fraction.padEnd(scale, "0"));
  if (units > BigInt(Number.MAX_SAFE_INTEGER) || (positive && units === 0n))
    throw new Error("La cantidad está fuera del rango permitido.");
  return units;
}
export function buildTransfer(
  sourceGoal: string,
  source: TransferSource,
  goalId: string,
  platform: string,
  amount: string,
  fee: string,
  notes: string,
): TransferInput {
  const normalized = platform.trim().toUpperCase();
  endpoint.parse({ goalId, platform: normalized });
  if (sourceGoal === goalId && source.platform === normalized)
    throw new Error("Elegí un destino distinto del origen.");
  const quantity = decimalUnits(amount, source.scale, true);
  const commission = decimalUnits(fee, source.scale);
  if (quantity + commission > BigInt(source.availableUnits))
    throw new Error(
      "La cantidad y la comisión exceden el disponible consultado.",
    );
  const common = {
    idempotencyKey: crypto.randomUUID(),
    source: { goalId: sourceGoal, platform: source.platform },
    destination: { goalId, platform: normalized },
    fee: fee.trim().replace(",", "."),
    notes: notes.trim(),
  };
  const value = amount.trim().replace(",", ".");
  return inputSchema.parse(
    source.kind === "cash"
      ? { ...common, kind: "cash", currency: source.unit, amount: value }
      : { ...common, kind: "crypto", assetId: source.unit, quantity: value },
  );
}
