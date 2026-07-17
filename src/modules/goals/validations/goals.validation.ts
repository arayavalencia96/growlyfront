import { z } from 'zod'
import {
  GOAL_CURRENCIES,
  GOAL_STATUSES,
  GOAL_TYPES,
} from '@/modules/goals/interfaces/goals.interface'

export const goalSchema = z
  .object({
    name: z.string().trim().min(2, 'Ingresa al menos 2 caracteres').max(120),
    type: z.enum(GOAL_TYPES),
    targetAmount: z
      .number({ error: 'Ingresa un monto válido' })
      .positive('El monto debe ser mayor a cero'),
    currency: z.enum(GOAL_CURRENCIES),
    startDate: z.string().min(1, 'Selecciona una fecha de inicio'),
    endDate: z.string(),
    status: z.enum(GOAL_STATUSES),
    notes: z.string().trim().max(500, 'Máximo 500 caracteres'),
  })
  .refine(
    ({ startDate, endDate }) => !endDate || endDate >= startDate,
    {
      message: 'Debe ser posterior a la fecha de inicio',
      path: ['endDate'],
    },
  )
