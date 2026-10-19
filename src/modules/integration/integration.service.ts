import { apiService } from "@/common/services/api.service";
import type {
  ContributionConfirmPayload,
  ContributionJobView,
  ContributionAdjustmentPayload,
  ContributionAdjustmentView,
} from "./contribution.types";
import type { LinkedAllocationState } from "./allocation.types";
import type {
  CashyContributionPreview,
  CashyContributionPreviewPayload,
} from "./contribution.types";
import type {
  AccountLinkState,
  LinkConsent,
  LinkRedirect,
} from "./integration.types";

export const integrationService = {
  adjustContribution(id: string, payload: ContributionAdjustmentPayload) {
    return apiService.post<
      ContributionAdjustmentView,
      ContributionAdjustmentPayload
    >(
      "/integration/contribution/" + encodeURIComponent(id) + "/adjust",
      payload,
    );
  },
  contributionAdjustments(id: string) {
    return apiService.get<ContributionAdjustmentView[]>(
      "/integration/contribution/" + encodeURIComponent(id) + "/adjustments",
    );
  },
  reconcileContribution(id: string) {
    return apiService.post<ContributionJobView, Record<string, never>>(
      "/integration/contribution/" + encodeURIComponent(id) + "/reconcile",
      {},
    );
  },
  cancelPendingContribution(id: string) {
    return apiService.post<ContributionJobView, Record<string, never>>(
      "/integration/contribution/" + encodeURIComponent(id) + "/cancel-pending",
      {},
    );
  },
  confirmContribution(payload: ContributionConfirmPayload) {
    return apiService.post<ContributionJobView, ContributionConfirmPayload>(
      "/integration/contribution/confirm",
      payload,
    );
  },
  contributionStatus(id: string) {
    return apiService.get<ContributionJobView>(
      "/integration/contribution/" + encodeURIComponent(id),
    );
  },
  contributions(goalId: string) {
    return apiService.get<ContributionJobView[]>("/integration/contribution", {
      query: { goalId },
    });
  },
  prepareContribution(payload: CashyContributionPreviewPayload) {
    return apiService.post<
      CashyContributionPreview,
      CashyContributionPreviewPayload
    >("/integration/contribution/preview", payload);
  },
  allocation() {
    return apiService.get<LinkedAllocationState>("/integration/allocation");
  },
  revoke(linkId: string) {
    return apiService.post<AccountLinkState, { linkId: string }>(
      "/integration/link/revoke",
      { linkId },
    );
  },
  status() {
    return apiService.get<AccountLinkState>("/integration/link");
  },
  preview(requestToken: string) {
    return apiService.post<LinkConsent, { requestToken: string }>(
      "/integration/link/preview",
      { requestToken },
    );
  },
  approve(requestToken: string, expectedUserId: string) {
    return apiService.post<
      LinkRedirect,
      { requestToken: string; expectedUserId: string }
    >("/integration/link/approve", { requestToken, expectedUserId });
  },
  deny(requestToken: string) {
    return apiService.post<LinkRedirect, { requestToken: string }>(
      "/integration/link/deny",
      { requestToken },
    );
  },
};
