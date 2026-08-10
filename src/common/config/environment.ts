const DEFAULT_API_URL = "http://localhost:3000/api/v1";
const DEFAULT_DOLAR_API_URL = "https://dolarapi.com/v1/dolares/bolsa";

function normalizeUrl(url: string): string {
  let endIndex = url.length;

  while (endIndex > 0 && url.codePointAt(endIndex - 1) === 47) {
    endIndex -= 1;
  }

  return url.slice(0, endIndex);
}

export const environment = Object.freeze({
  apiUrl: normalizeUrl(import.meta.env.VITE_API_URL?.trim() || DEFAULT_API_URL),
  appVersion: "1.0.0",
  dolarApiUrl: normalizeUrl(
    import.meta.env.VITE_DOLAR_API_URL?.trim() || DEFAULT_DOLAR_API_URL,
  ),
});
