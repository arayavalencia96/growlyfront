import { z } from "zod";
import {
  CONTRIBUTION_FUNDING_SOURCES,
  GOAL_MOVEMENT_TYPES,
} from "@/modules/goal-movements/interfaces/goal-movements.interface";
import { GOAL_CURRENCIES } from "@/modules/goals/interfaces/goals.interface";
import {
  CUSTOM_INVESTMENT_PLATFORM,
  INVESTMENT_PLATFORM_SELECTIONS,
} from "@/modules/investment-operations/interfaces/investment-operations.interface";

export const goalMovementSchema = z
  .object({
    type: z.enum(GOAL_MOVEMENT_TYPES),
    fundingSource: z.enum(CONTRIBUTION_FUNDING_SOURCES),
    amount: z
      .number({ error: "Ingresa un monto válido" })
      .positive("El monto debe ser mayor a cero"),
    currency: z.enum(GOAL_CURRENCIES),
    movementDate: z.string().min(1, "Selecciona una fecha"),
    exchangeRateArsPerUsd: z
      .number()
      .min(0, "La cotización no puede ser negativa"),
    platformOption: z.enum(INVESTMENT_PLATFORM_SELECTIONS),
    customPlatform: z.string().trim().max(120, "Máximo 120 caracteres"),
    notes: z.string().trim().max(500, "Máximo 500 caracteres"),
  })
  .superRefine(
    (
      {
        platformOption,
        customPlatform,
        type,
        fundingSource,
        currency,
        amount,
        exchangeRateArsPerUsd,
      },
      context,
    ) => {
      if (type === "contribution" && fundingSource === "cashy") {
        const minor = Math.round(amount * 100);
        if (
          !Number.isSafeInteger(minor) ||
          minor <= 0 ||
          Math.abs(amount - minor / 100) >
            Number.EPSILON * Math.max(1, amount) * 2
        )
          context.addIssue({
            code: "custom",
            message:
              "El aporte de Cashy admite hasta dos decimales y debe estar dentro de la precisión admitida.",
            path: ["amount"],
          });
        if (currency === "USD" && exchangeRateArsPerUsd <= 0)
          context.addIssue({
            code: "custom",
            message: "Indicá la cotización ARS por USD para este aporte.",
            path: ["exchangeRateArsPerUsd"],
          });
      }
      if (
        platformOption === CUSTOM_INVESTMENT_PLATFORM &&
        customPlatform.length < 2
      ) {
        context.addIssue({
          code: "custom",
          message: "Ingresa el nombre de la plataforma",
          path: ["customPlatform"],
        });
      }
    },
  );
