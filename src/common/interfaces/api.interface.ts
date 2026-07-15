export type QueryValue = string | number | boolean

export interface IApiResponse<T> {
  result: T
  message: string
  description: string
  statuscode: number
  ok: boolean
}

export interface IHttpRequestOptions<TBody = unknown> {
  body?: TBody
  headers?: Readonly<Record<string, string>>
  query?: Readonly<Record<string, QueryValue | readonly QueryValue[]>>
  signal?: AbortSignal
}

export interface IHttpClient {
  get<TResult>(
    path: string,
    options?: IHttpRequestOptions,
  ): Promise<IApiResponse<TResult>>
  post<TResult, TBody>(
    path: string,
    body: TBody,
    options?: IHttpRequestOptions<TBody>,
  ): Promise<IApiResponse<TResult>>
  patch<TResult, TBody>(
    path: string,
    body: TBody,
    options?: IHttpRequestOptions<TBody>,
  ): Promise<IApiResponse<TResult>>
  put<TResult, TBody>(
    path: string,
    body: TBody,
    options?: IHttpRequestOptions<TBody>,
  ): Promise<IApiResponse<TResult>>
  delete<TResult>(
    path: string,
    options?: IHttpRequestOptions,
  ): Promise<IApiResponse<TResult>>
}

export interface IAuthorizationHeadersProvider {
  getHeaders(): Readonly<Record<string, string>>
}

export interface IApiErrorPayload {
  message?: string | string[]
  description?: string
  error?: string
  statusCode?: number
  statuscode?: number
}

export interface IApiErrorOptions {
  message: string
  description: string
  statusCode: number
  details?: unknown
}
