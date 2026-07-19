import type { IAuthorizationHeadersProvider } from "@/common/interfaces/api.interface";

export interface ISessionTokens {
  accessToken: string;
  refreshToken: string;
}

export interface ISessionService extends IAuthorizationHeadersProvider {
  save(tokens: ISessionTokens): void;
  clear(): void;
  expire(): void;
  hasSession(): boolean;
  getRefreshToken(): string;
}
