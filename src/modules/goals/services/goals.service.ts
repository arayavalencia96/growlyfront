import { apiService } from '@/common/services/api.service'
import type {
  IGoal,
  IGoalFilters,
  IGoalPayload,
  IGoalsService,
} from '@/modules/goals/interfaces/goals.interface'

class GoalsService implements IGoalsService {
  getAll(filters: IGoalFilters = {}) {
    const query = Object.fromEntries(
      Object.entries(filters).filter(([, value]) => Boolean(value)),
    )
    return apiService.get<IGoal[]>('/goals', { query })
  }

  getById(id: string) {
    return apiService.get<IGoal>('/goals/' + id)
  }

  create(payload: IGoalPayload) {
    return apiService.post<IGoal, IGoalPayload>('/goals', payload)
  }

  update(id: string, payload: Partial<IGoalPayload>) {
    return apiService.patch<IGoal, Partial<IGoalPayload>>(
      '/goals/' + id,
      payload,
    )
  }

  remove(id: string) {
    return apiService.delete<IGoal>('/goals/' + id)
  }
}

export const goalsService = new GoalsService()
