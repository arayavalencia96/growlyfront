import type {
  ISessionService,
  ISessionTokens,
} from "@/common/interfaces/session.interface";

const ACCESS_TOKEN_KEY = "growly.accessToken";
const REFRESH_TOKEN_KEY = "growly.refreshToken";
export const BALANCE_VISIBILITY_KEY = "growly.balanceVisibility";
export const SESSION_EXPIRED_EVENT = "growly:session-expired";

class BrowserSessionService implements ISessionService {
  save(tokens: ISessionTokens): void {
    const hadSession = Boolean(
      sessionStorage.getItem(ACCESS_TOKEN_KEY) ||
      sessionStorage.getItem(REFRESH_TOKEN_KEY),
    );
    if (!hadSession) localStorage.removeItem(BALANCE_VISIBILITY_KEY);
    sessionStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken);
    sessionStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
  }

  clear(): void {
    sessionStorage.removeItem(ACCESS_TOKEN_KEY);
    sessionStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(BALANCE_VISIBILITY_KEY);
  }

  expire(): void {
    this.clear();
    window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
  }

  hasSession(): boolean {
    return Boolean(sessionStorage.getItem(ACCESS_TOKEN_KEY));
  }

  getRefreshToken(): string {
    return sessionStorage.getItem(REFRESH_TOKEN_KEY) || "";
  }

  getHeaders(): Readonly<Record<string, string>> {
    const accessToken = sessionStorage.getItem(ACCESS_TOKEN_KEY);

    return accessToken ? { Authorization: "Bearer " + accessToken } : {};
  }
}

export const sessionService = new BrowserSessionService();
