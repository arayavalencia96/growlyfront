import type { IApiResponse } from '@/common/interfaces/api.interface'

export const GOAL_TYPES = ['long_term', 'short_term', 'medium_term'] as const
export const GOAL_STATUSES = ['active', 'paused', 'completed'] as const
export const GOAL_CURRENCIES = ['ARS', 'USD'] as const

export type GoalType = (typeof GOAL_TYPES)[number]
export type GoalStatus = (typeof GOAL_STATUSES)[number]
export type GoalCurrency = (typeof GOAL_CURRENCIES)[number]

export interface IGoal {
  id: string
  userId: string
  name: string
  type: GoalType
  targetAmount: number
  currency: GoalCurrency
  startDate: string
  endDate: string | null
  status: GoalStatus
  notes: string | null
  createdAt: string
  updatedAt: string
}

export interface IGoalPayload {
  name: string
  type: GoalType
  targetAmount: number
  currency: GoalCurrency
  startDate: string
  endDate?: string | null
  status: GoalStatus
  notes?: string | null
}

export interface IGoalFormValues {
  name: string
  type: GoalType
  targetAmount: number
  currency: GoalCurrency
  startDate: string
  endDate: string
  status: GoalStatus
  notes: string
}

export interface IGoalFilters {
  search?: string
  type?: GoalType
  status?: GoalStatus
  currency?: GoalCurrency
}

export interface IGoalsService {
  getAll(filters?: IGoalFilters): Promise<IApiResponse<IGoal[]>>
  getById(id: string): Promise<IApiResponse<IGoal>>
  create(payload: IGoalPayload): Promise<IApiResponse<IGoal>>
  update(id: string, payload: Partial<IGoalPayload>): Promise<IApiResponse<IGoal>>
  remove(id: string): Promise<IApiResponse<IGoal>>
}

export interface IGoalFormProps {
  goal?: IGoal
  isSubmitting: boolean
  onSubmit(payload: IGoalPayload): Promise<void>
  onCancel(): void
}

export interface IGoalCardProps {
  goal: IGoal
  onEdit(goal: IGoal): void
  onDelete(goal: IGoal): void
}
