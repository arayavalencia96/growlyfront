import { apiService } from "@/common/services/api.service";
import { sessionService } from "@/common/services/session.service";
import type { IApiResponse } from "@/common/interfaces/api.interface";
import type {
  IGoal,
  IGoalFilters,
  IGoalPayload,
  IGoalsService,
} from "@/modules/goals/interfaces/goals.interface";

export const GOALS_CHANGED_EVENT = "growly:goals-changed";

class GoalsService implements IGoalsService {
  private pendingList: {
    authorization: string;
    request: Promise<IApiResponse<IGoal[]>>;
  } | null = null;
  getAll(filters: IGoalFilters = {}) {
    const query = Object.fromEntries(
      Object.entries(filters).filter(([, value]) => Boolean(value)),
    );
    if (Object.keys(query).length)
      return apiService.get<IGoal[]>("/goals", { query });
    const authorization = sessionService.getHeaders().Authorization ?? "";
    if (this.pendingList?.authorization === authorization)
      return this.pendingList.request;
    const request = apiService.get<IGoal[]>("/goals").finally(() => {
      if (this.pendingList?.request === request) this.pendingList = null;
    });
    this.pendingList = { authorization, request };
    return request;
  }

  getById(id: string) {
    return apiService.get<IGoal>("/goals/" + id);
  }

  async create(payload: IGoalPayload) {
    const response = await apiService.post<IGoal, IGoalPayload>(
      "/goals",
      payload,
    );
    this.pendingList = null;
    window.dispatchEvent(new Event(GOALS_CHANGED_EVENT));
    return response;
  }

  async update(id: string, payload: Partial<IGoalPayload>) {
    const response = await apiService.patch<IGoal, Partial<IGoalPayload>>(
      "/goals/" + id,
      payload,
    );
    this.pendingList = null;
    window.dispatchEvent(new Event(GOALS_CHANGED_EVENT));
    return response;
  }

  async remove(id: string) {
    const response = await apiService.delete<IGoal>("/goals/" + id);
    this.pendingList = null;
    window.dispatchEvent(new Event(GOALS_CHANGED_EVENT));
    return response;
  }
}

export const goalsService = new GoalsService();
