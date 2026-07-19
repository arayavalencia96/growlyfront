import { apiService } from "@/common/services/api.service";
import type {
  IGoalMovement,
  IGoalMovementPayload,
  IGoalMovementsService,
} from "@/modules/goal-movements/interfaces/goal-movements.interface";

class GoalMovementsService implements IGoalMovementsService {
  getByGoal(goalId: string) {
    return apiService.get<IGoalMovement[]>("/goals-movements", {
      query: { goalId },
    });
  }

  create(payload: IGoalMovementPayload) {
    return apiService.post<IGoalMovement, IGoalMovementPayload>(
      "/goals-movements",
      payload,
    );
  }

  update(id: string, payload: Omit<IGoalMovementPayload, "goalId">) {
    return apiService.patch<
      IGoalMovement,
      Omit<IGoalMovementPayload, "goalId">
    >("/goals-movements/" + id, payload);
  }

  remove(id: string) {
    return apiService.delete<IGoalMovement>("/goals-movements/" + id);
  }
}

export const goalMovementsService = new GoalMovementsService();
