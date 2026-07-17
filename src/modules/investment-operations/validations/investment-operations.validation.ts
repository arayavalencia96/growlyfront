import { z } from "zod";
import { GOAL_CURRENCIES } from "@/modules/goals/interfaces/goals.interface";
import { INVESTMENT_OPERATION_TYPES } from "@/modules/investment-operations/interfaces/investment-operations.interface";

export const investmentOperationSchema = z.object({
  platform: z.string().trim().min(2, "Ingresa la plataforma").max(120),
  ticker: z.string().trim().min(1, "Ingresa el ticker").max(30),
  type: z.enum(INVESTMENT_OPERATION_TYPES),
  operationDate: z.string().min(1, "Selecciona una fecha"),
  quantity: z
    .number({ error: "Ingresa una cantidad válida" })
    .positive("La cantidad debe ser mayor a cero"),
  unitPrice: z
    .number({ error: "Ingresa un precio válido" })
    .positive("El precio debe ser mayor a cero"),
  fees: z.number().min(0, "Las comisiones no pueden ser negativas"),
  currency: z.enum(GOAL_CURRENCIES),
  exchangeRateArsPerUsd: z
    .number()
    .min(0, "La cotización no puede ser negativa"),
  notes: z.string().trim().max(500, "Máximo 500 caracteres"),
});
