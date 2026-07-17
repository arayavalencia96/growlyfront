import { z } from 'zod'
import { GOAL_MOVEMENT_TYPES } from '@/modules/goal-movements/interfaces/goal-movements.interface'
import { GOAL_CURRENCIES } from '@/modules/goals/interfaces/goals.interface'

export const goalMovementSchema = z.object({
  type: z.enum(GOAL_MOVEMENT_TYPES),
  amount: z
    .number({ error: 'Ingresa un monto válido' })
    .positive('El monto debe ser mayor a cero'),
  currency: z.enum(GOAL_CURRENCIES),
  movementDate: z.string().min(1, 'Selecciona una fecha'),
  exchangeRateArsPerUsd: z.number().min(0, 'La cotización no puede ser negativa'),
  platform: z.string().trim().max(120, 'Máximo 120 caracteres'),
  notes: z.string().trim().max(500, 'Máximo 500 caracteres'),
})
