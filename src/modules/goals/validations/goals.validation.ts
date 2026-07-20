import { z } from "zod";
import {
  GOAL_CURRENCIES,
  GOAL_STATUSES,
  GOAL_TRACKING_MODES,
  GOAL_TYPES,
} from "@/modules/goals/interfaces/goals.interface";
import { CUSTOM_INVESTMENT_PLATFORM } from "@/modules/investment-operations/interfaces/investment-operations.interface";

const optionalExchangeRate = z
  .number()
  .min(0, "La cotización no puede ser negativa");

const openingCashSchema = z
  .object({
    platform: z.string().trim().min(2, "Ingresa la plataforma").max(120),
    customPlatform: z.string().trim().max(120),
    currency: z.enum(GOAL_CURRENCIES),
    amount: z.number().positive("El saldo debe ser mayor a cero"),
    exchangeRateArsPerUsd: optionalExchangeRate,
  })
  .superRefine(({ platform, customPlatform }, context) => {
    if (
      platform === CUSTOM_INVESTMENT_PLATFORM &&
      customPlatform.trim().length < 2
    ) {
      context.addIssue({
        code: "custom",
        message: "Ingresa el nombre de la plataforma",
        path: ["customPlatform"],
      });
    }
  });

const openingPositionSchema = z
  .object({
    platform: z.string().trim().min(2, "Ingresa la plataforma").max(120),
    customPlatform: z.string().trim().max(120),
    ticker: z.string().trim().min(1, "Ingresa el ticker").max(30),
    quantity: z.number().positive("La cantidad debe ser mayor a cero"),
    unitPrice: z.number().positive("El PPC debe ser mayor a cero"),
    totalAmount: z.number().positive("El total debe ser mayor a cero"),
    currency: z.enum(GOAL_CURRENCIES),
    exchangeRateArsPerUsd: optionalExchangeRate,
  })
  .superRefine(({ platform, customPlatform }, context) => {
    if (
      platform === CUSTOM_INVESTMENT_PLATFORM &&
      customPlatform.trim().length < 2
    ) {
      context.addIssue({
        code: "custom",
        message: "Ingresa el nombre de la plataforma",
        path: ["customPlatform"],
      });
    }
  });

export const goalSchema = z
  .object({
    name: z.string().trim().min(2, "Ingresa al menos 2 caracteres").max(120),
    type: z.enum(GOAL_TYPES),
    targetAmount: z
      .number({ error: "Ingresa un monto válido" })
      .positive("El monto debe ser mayor a cero"),
    currency: z.enum(GOAL_CURRENCIES),
    startDate: z.string().min(1, "Selecciona una fecha de inicio"),
    endDate: z.string(),
    status: z.enum(GOAL_STATUSES),
    trackingMode: z.enum(GOAL_TRACKING_MODES),
    openingCashBalances: z.array(openingCashSchema).max(50),
    openingPositions: z.array(openingPositionSchema).max(100),
    notes: z.string().trim().max(500, "Máximo 500 caracteres"),
  })
  .superRefine((values, context) => {
    if (values.endDate && values.endDate < values.startDate) {
      context.addIssue({
        code: "custom",
        message: "Debe ser posterior a la fecha de inicio",
        path: ["endDate"],
      });
    }
    const hasOpeningState =
      values.openingCashBalances.length > 0 ||
      values.openingPositions.length > 0;
    if (values.trackingMode === "from_scratch" && hasOpeningState) {
      context.addIssue({
        code: "custom",
        message: "Un objetivo desde cero no puede tener saldos iniciales",
        path: ["trackingMode"],
      });
    }
    if (values.trackingMode === "existing_portfolio" && !hasOpeningState) {
      context.addIssue({
        code: "custom",
        message: "Agrega al menos un saldo o una posición inicial",
        path: ["trackingMode"],
      });
    }

    const cashKeys = values.openingCashBalances.map(
      (item) =>
        `${(item.platform === CUSTOM_INVESTMENT_PLATFORM ? item.customPlatform : item.platform).trim().toUpperCase()}:${item.currency}`,
    );
    if (new Set(cashKeys).size !== cashKeys.length) {
      context.addIssue({
        code: "custom",
        message:
          "No repitas la misma combinacion de plataforma y moneda inicial",
        path: ["openingCashBalances"],
      });
    }

    const positionKeys = values.openingPositions.map(
      (item) =>
        `${(item.platform === CUSTOM_INVESTMENT_PLATFORM ? item.customPlatform : item.platform).trim().toUpperCase()}:${item.ticker.trim().toUpperCase()}`,
    );
    if (new Set(positionKeys).size !== positionKeys.length) {
      context.addIssue({
        code: "custom",
        message:
          "No repitas la misma combinacion de plataforma y ticker inicial",
        path: ["openingPositions"],
      });
    }
  });
