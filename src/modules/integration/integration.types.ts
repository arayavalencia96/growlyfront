export type IntegrationPermission =
  | "allocations:read"
  | "contributions:write"
  | "contributions:read"
  | "portfolio:read";

export interface AccountLinkView {
  id: string;
  cashyEmail: string;
  growlyEmail: string;
  linkedAt: string;
  permissions: IntegrationPermission[];
}

export type AccountLinkState =
  | { status: "not-linked"; enabled: boolean; peerFrontendUrl: string }
  | {
      status: "active";
      enabled: boolean;
      peerFrontendUrl: string;
      link: AccountLinkView;
      detailsFresh: boolean;
      accessAvailable: boolean;
    }
  | {
      status: "revocation-pending";
      enabled: boolean;
      peerFrontendUrl: string;
      link: AccountLinkView;
      requestedAt: string;
    };

export interface LinkConsent {
  cashyEmail: string;
  growlyUserId: string;
  growlyEmail: string;
  expiresAt: string;
  permissions: IntegrationPermission[];
}

export interface LinkRedirect {
  redirectUrl: string;
}
