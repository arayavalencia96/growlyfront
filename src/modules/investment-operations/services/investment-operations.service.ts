import { apiService } from "@/common/services/api.service";
import type {
  IInvestmentOperation,
  IInvestmentOperationPayload,
  IInvestmentOperationsService,
  InvestmentOperationUpdatePayload,
} from "@/modules/investment-operations/interfaces/investment-operations.interface";

class InvestmentOperationsService implements IInvestmentOperationsService {
  getByGoal(goalId: string) {
    return apiService.get<IInvestmentOperation[]>("/investment-operations", {
      query: { goalId },
    });
  }

  create(payload: IInvestmentOperationPayload) {
    return apiService.post<IInvestmentOperation, IInvestmentOperationPayload>(
      "/investment-operations",
      payload,
    );
  }

  update(id: string, payload: InvestmentOperationUpdatePayload) {
    return apiService.patch<
      IInvestmentOperation,
      InvestmentOperationUpdatePayload
    >("/investment-operations/" + id, payload);
  }

  remove(id: string) {
    return apiService.delete<IInvestmentOperation>(
      "/investment-operations/" + id,
    );
  }
}

export const investmentOperationsService = new InvestmentOperationsService();
