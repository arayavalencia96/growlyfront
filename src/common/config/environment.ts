const DEFAULT_API_URL = "http://localhost:3000/api/v1";
const DEFAULT_DOLAR_API_URL = "https://dolarapi.com/v1/dolares/bolsa";

function normalizeUrl(url: string): string {
  return url.replace(/\/+$/, "");
}

export const environment = Object.freeze({
  apiUrl: normalizeUrl(import.meta.env.VITE_API_URL?.trim() || DEFAULT_API_URL),
  appVersion: import.meta.env.VITE_APP_VERSION?.trim() || "0.1.0",
  dolarApiUrl: normalizeUrl(
    import.meta.env.VITE_DOLAR_API_URL?.trim() || DEFAULT_DOLAR_API_URL,
  ),
});
