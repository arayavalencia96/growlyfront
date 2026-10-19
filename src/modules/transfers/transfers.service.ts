import { apiService } from "@/common/services/api.service";
import type {
  TransferContext,
  TransferInput,
  TransferPreview,
  TransferRecord,
  TransferSetup,
} from "./transfer.types";

export const transfersService = {
  byGoal: (goalId: string, limit = 50) =>
    apiService.get<TransferRecord[]>("/transfers", {
      query: { goalId, limit },
    }),
  setup: () => apiService.get<TransferSetup>("/transfers/status"),
  context: (goalId: string) =>
    apiService.get<TransferContext>("/transfers/form-context", {
      query: { goalId },
    }),
  preview: (input: TransferInput) =>
    apiService.post<TransferPreview, TransferInput>(
      "/transfers/preview",
      input,
    ),
  submit: (input: TransferInput) =>
    apiService.post<TransferRecord, TransferInput>("/transfers", input),
  byKey: (key: string) =>
    apiService.get<TransferRecord>(
      "/transfers/by-key/" + encodeURIComponent(key),
    ),
  retry: (id: string) =>
    apiService.post<TransferRecord, Record<string, never>>(
      "/transfers/" + encodeURIComponent(id) + "/retry",
      {},
    ),
};
