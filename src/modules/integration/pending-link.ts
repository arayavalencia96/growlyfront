const PENDING_KEY = "growly.cashy.pendingLink";
const tokenPattern = /^[A-Za-z0-9_-]{43}$/;

interface PendingRequest {
  requestToken: string;
  capturedAt: number;
}

export function clearPendingLink(): void {
  sessionStorage.removeItem(PENDING_KEY);
}

function storedRequest(): PendingRequest | undefined {
  try {
    const value: unknown = JSON.parse(
      sessionStorage.getItem(PENDING_KEY) ?? "{}",
    );
    if (
      !value ||
      typeof value !== "object" ||
      !("requestToken" in value) ||
      typeof value.requestToken !== "string" ||
      !tokenPattern.test(value.requestToken) ||
      !("capturedAt" in value) ||
      typeof value.capturedAt !== "number" ||
      Date.now() - value.capturedAt > 10 * 60 * 1000
    ) {
      clearPendingLink();
      return undefined;
    }
    return { requestToken: value.requestToken, capturedAt: value.capturedAt };
  } catch {
    clearPendingLink();
    return undefined;
  }
}

export function capturePendingLink(): string {
  const fragment = window.location.hash;
  if (fragment) {
    const requestToken =
      new URLSearchParams(fragment.slice(1)).get("requestToken") ?? "";
    window.history.replaceState(
      window.history.state,
      "",
      window.location.pathname,
    );
    if (!tokenPattern.test(requestToken)) {
      clearPendingLink();
      return "";
    }
    sessionStorage.setItem(
      PENDING_KEY,
      JSON.stringify({
        requestToken,
        capturedAt: Date.now(),
      } satisfies PendingRequest),
    );
  }
  return storedRequest()?.requestToken ?? "";
}

export function postLoginDestination(): string {
  return storedRequest() ? "/integrations/connect" : "/home";
}
