import type {
  ISessionService,
  ISessionTokens,
} from '@/common/interfaces/session.interface'

const ACCESS_TOKEN_KEY = 'growly.accessToken'
const REFRESH_TOKEN_KEY = 'growly.refreshToken'

class BrowserSessionService implements ISessionService {
  save(tokens: ISessionTokens): void {
    sessionStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken)
    sessionStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken)
  }

  clear(): void {
    sessionStorage.removeItem(ACCESS_TOKEN_KEY)
    sessionStorage.removeItem(REFRESH_TOKEN_KEY)
  }

  hasSession(): boolean {
    return Boolean(sessionStorage.getItem(ACCESS_TOKEN_KEY))
  }

  getRefreshToken(): string {
    return sessionStorage.getItem(REFRESH_TOKEN_KEY) || ''
  }

  getHeaders(): Readonly<Record<string, string>> {
    const accessToken = sessionStorage.getItem(ACCESS_TOKEN_KEY)

    return accessToken ? { Authorization: 'Bearer ' + accessToken } : {}
  }
}

export const sessionService = new BrowserSessionService()
