import { apiService } from "@/common/services/api.service";
import type {
  IGoalSummary,
  IPortfolioSummary,
  ISummariesService,
} from "@/modules/summaries/interfaces/summaries.interface";

class SummariesService implements ISummariesService {
  getPortfolio() {
    return apiService.get<IPortfolioSummary>("/summaries/portfolio");
  }

  getByGoal(goalId: string) {
    return apiService.get<IGoalSummary>("/summaries/goals/" + goalId);
  }
}

export const summariesService = new SummariesService();
