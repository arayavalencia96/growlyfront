import type { ContributionJobView } from "./contribution.types";

export const contributionStatusLabels: Record<
  ContributionJobView["status"],
  string
> = {
  pending: "Pendiente",
  confirmed: "Confirmado",
  cancelled: "No confirmado",
  "reconciliation-required": "Requiere revisión",
  voided: "Anulado",
};
