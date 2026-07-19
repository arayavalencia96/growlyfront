import type { IAuthorizationHeadersProvider } from "@/common/interfaces/api.interface";

export class AnonymousAuthorizationHeadersProvider implements IAuthorizationHeadersProvider {
  getHeaders(): Readonly<Record<string, string>> {
    return {};
  }
}
