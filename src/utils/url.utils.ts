import type { QueryValue } from "@/common/interfaces/api.interface";

type QueryParams = Readonly<Record<string, QueryValue | readonly QueryValue[]>>;

export function buildUrl(
  baseUrl: string,
  path: string,
  query?: QueryParams,
): string {
  const normalizedPath = path.replace(/^\/+/, "");
  const url = new URL(baseUrl + "/" + normalizedPath);

  if (!query) {
    return url.toString();
  }

  Object.entries(query).forEach(([key, value]) => {
    const values = Array.isArray(value) ? value : [value];
    values.forEach((item) => url.searchParams.append(key, String(item)));
  });

  return url.toString();
}
