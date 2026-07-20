import { z } from "zod";
import { GOAL_CURRENCIES } from "@/modules/goals/interfaces/goals.interface";
import {
  CUSTOM_INVESTMENT_PLATFORM,
  INVESTMENT_OPERATION_TYPES,
  INVESTMENT_PLATFORM_SELECTIONS,
} from "@/modules/investment-operations/interfaces/investment-operations.interface";

export const investmentOperationSchema = z
  .object({
    platformOption: z.enum(INVESTMENT_PLATFORM_SELECTIONS),
    customPlatform: z.string().trim().max(120, "Máximo 120 caracteres"),
    ticker: z.string().trim().min(1, "Ingresa el ticker").max(30),
    type: z.enum(INVESTMENT_OPERATION_TYPES),
    operationDate: z.string().min(1, "Selecciona una fecha"),
    quantity: z
      .number({ error: "Ingresa una cantidad válida" })
      .positive("La cantidad debe ser mayor a cero"),
    unitPrice: z
      .number({ error: "Ingresa un precio válido" })
      .positive("El precio debe ser mayor a cero"),
    totalAmount: z
      .number({ error: "Ingresa el monto total" })
      .positive("El monto total debe ser mayor a cero"),
    currency: z.enum(GOAL_CURRENCIES),
    exchangeRateArsPerUsd: z
      .number()
      .min(0, "La cotización no puede ser negativa"),
    notes: z.string().trim().max(500, "Máximo 500 caracteres"),
  })
  .superRefine(({ platformOption, customPlatform }, context) => {
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
  });
