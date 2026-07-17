import { apiService } from "@/common/services/api.service";
import type {
  IGoalSummary,
  ISummariesService,
} from "@/modules/summaries/interfaces/summaries.interface";

class SummariesService implements ISummariesService {
  getByGoal(goalId: string) {
    return apiService.get<IGoalSummary>("/summaries/goals/" + goalId);
  }
}

export const summariesService = new SummariesService();
