import { ApiError } from '@/common/errors/api.error'
import type {
  IApiResponse,
  IAuthorizationHeadersProvider,
  IHttpClient,
  IHttpRequestOptions,
} from '@/common/interfaces/api.interface'
import { AnonymousAuthorizationHeadersProvider } from '@/common/services/authorization-headers.service'
import { buildUrl } from '@/utils/url.utils'

type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE'

function isApiResponse<T>(value: unknown): value is IApiResponse<T> {
  if (typeof value !== 'object' || value === null) {
    return false
  }

  const response = value as Record<string, unknown>

  return (
    'result' in response &&
    typeof response.message === 'string' &&
    typeof response.description === 'string' &&
    typeof response.statuscode === 'number' &&
    typeof response.ok === 'boolean'
  )
}

async function readResponse(response: Response): Promise<unknown> {
  const contentType = response.headers.get('content-type')

  if (!contentType?.includes('application/json')) {
    return response.text()
  }

  return response.json()
}

export class HttpService implements IHttpClient {
  private readonly baseUrl: string
  private readonly authorizationHeadersProvider: IAuthorizationHeadersProvider

  constructor(
    baseUrl: string,
    authorizationHeadersProvider: IAuthorizationHeadersProvider =
      new AnonymousAuthorizationHeadersProvider(),
  ) {
    this.baseUrl = baseUrl
    this.authorizationHeadersProvider = authorizationHeadersProvider
  }

  get<TResult>(
    path: string,
    options?: IHttpRequestOptions,
  ): Promise<IApiResponse<TResult>> {
    return this.request<TResult>('GET', path, options)
  }

  post<TResult, TBody>(
    path: string,
    body: TBody,
    options?: IHttpRequestOptions<TBody>,
  ): Promise<IApiResponse<TResult>> {
    return this.request<TResult, TBody>('POST', path, { ...options, body })
  }

  patch<TResult, TBody>(
    path: string,
    body: TBody,
    options?: IHttpRequestOptions<TBody>,
  ): Promise<IApiResponse<TResult>> {
    return this.request<TResult, TBody>('PATCH', path, { ...options, body })
  }

  put<TResult, TBody>(
    path: string,
    body: TBody,
    options?: IHttpRequestOptions<TBody>,
  ): Promise<IApiResponse<TResult>> {
    return this.request<TResult, TBody>('PUT', path, { ...options, body })
  }

  delete<TResult>(
    path: string,
    options?: IHttpRequestOptions,
  ): Promise<IApiResponse<TResult>> {
    return this.request<TResult>('DELETE', path, options)
  }

  private async request<TResult, TBody = unknown>(
    method: HttpMethod,
    path: string,
    options?: IHttpRequestOptions<TBody>,
  ): Promise<IApiResponse<TResult>> {
    try {
      const hasBody = options?.body !== undefined
      const headers = {
        Accept: 'application/json',
        ...(hasBody ? { 'Content-Type': 'application/json' } : {}),
        ...this.authorizationHeadersProvider.getHeaders(),
        ...options?.headers,
      }
      const response = await fetch(buildUrl(this.baseUrl, path, options?.query), {
        method,
        headers,
        body: hasBody ? JSON.stringify(options.body) : undefined,
        signal: options?.signal,
      })
      const payload = await readResponse(response)

      if (!response.ok) {
        throw ApiError.fromResponse(response.status, payload)
      }

      if (!isApiResponse<TResult>(payload)) {
        throw new ApiError({
          message: 'La respuesta de la API no cumple el contrato esperado',
          description: 'Se esperaba una respuesta IApiResponse<T>',
          statusCode: response.status,
          details: payload,
        })
      }

      return payload
    } catch (error: unknown) {
      if (error instanceof ApiError) {
        throw error
      }

      const wasAborted =
        error instanceof DOMException && error.name === 'AbortError'

      throw new ApiError({
        message: wasAborted
          ? 'La solicitud fue cancelada'
          : 'No se pudo conectar con el servidor',
        description: wasAborted
          ? 'La operación se interrumpió antes de completarse'
          : 'Verifica tu conexión e intenta nuevamente',
        statusCode: 0,
        details: error,
      })
    }
  }
}
