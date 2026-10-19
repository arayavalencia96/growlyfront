const LOCAL_API_URL = "http://localhost:3001/api/v1";
const PRODUCTION_API_URL =
  "https://growlyback-production.up.railway.app/api/v1";
const DOLAR_API_URL = "https://dolarapi.com/v1/dolares/bolsa";

function normalizeUrl(url: string): string {
  let endIndex = url.length;

  while (endIndex > 0 && url.codePointAt(endIndex - 1) === 47) {
    endIndex -= 1;
  }

  return url.slice(0, endIndex);
}

export const environment = Object.freeze({
  apiUrl: normalizeUrl(
    import.meta.env.PROD ? PRODUCTION_API_URL : LOCAL_API_URL,
  ),
  appVersion: "2.0.0",
  dolarApiUrl: DOLAR_API_URL,
});
