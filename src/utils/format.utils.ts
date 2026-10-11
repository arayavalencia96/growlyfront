import type { GoalCurrency } from "@/modules/goals/interfaces/goals.interface";

export function formatMoney(
  value: number,
  currency: GoalCurrency,
  fractionDigits = currency === "ARS" ? 0 : 2,
): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency,
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(value);
}

export function formatDate(value: string): string {
  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(value));
}

export function toDateInput(value: string): string {
  return value.slice(0, 10);
}

export function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat("es-AR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}
