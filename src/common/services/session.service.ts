import type {
  ISessionService,
  ISessionTokens,
} from "@/common/interfaces/session.interface";

const ACCESS_TOKEN_KEY = "growly.accessToken";
const REFRESH_TOKEN_KEY = "growly.refreshToken";
export const BALANCE_VISIBILITY_KEY = "growly.balanceVisibility";
export const THEME_STORAGE_KEY = "growly.theme";
export const SESSION_EXPIRED_EVENT = "growly:session-expired";

class BrowserSessionService implements ISessionService {
  constructor() {
    this.migrateSessionStorage();
  }

  save(tokens: ISessionTokens): void {
    const hadSession = this.hasSession();
    if (!hadSession) localStorage.removeItem(BALANCE_VISIBILITY_KEY);
    localStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
    sessionStorage.removeItem(ACCESS_TOKEN_KEY);
    sessionStorage.removeItem(REFRESH_TOKEN_KEY);
  }

  clear(): void {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    sessionStorage.removeItem(ACCESS_TOKEN_KEY);
    sessionStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(BALANCE_VISIBILITY_KEY);
  }

  expire(): void {
    this.clear();
    window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
  }

  hasSession(): boolean {
    return Boolean(this.getToken(ACCESS_TOKEN_KEY));
  }

  getRefreshToken(): string {
    return this.getToken(REFRESH_TOKEN_KEY) || "";
  }

  getHeaders(): Readonly<Record<string, string>> {
    const accessToken = this.getToken(ACCESS_TOKEN_KEY);

    return accessToken ? { Authorization: "Bearer " + accessToken } : {};
  }

  private getToken(key: string): string | null {
    return localStorage.getItem(key) || sessionStorage.getItem(key);
  }

  private migrateSessionStorage(): void {
    for (const key of [ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY]) {
      const token = sessionStorage.getItem(key);
      if (!localStorage.getItem(key) && token) localStorage.setItem(key, token);
      sessionStorage.removeItem(key);
    }
  }
}

export const sessionService = new BrowserSessionService();
