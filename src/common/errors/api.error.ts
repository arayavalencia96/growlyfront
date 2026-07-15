import type {
  IApiErrorOptions,
  IApiErrorPayload,
} from '@/common/interfaces/api.interface'

const DEFAULT_ERROR_MESSAGE = 'No se pudo completar la solicitud'

function isApiErrorPayload(value: unknown): value is IApiErrorPayload {
  return typeof value === 'object' && value !== null
}

function getMessage(payload: IApiErrorPayload): string {
  if (Array.isArray(payload.message)) {
    return payload.message.join('. ')
  }

  return payload.message || payload.error || DEFAULT_ERROR_MESSAGE
}

export class ApiError extends Error {
  readonly description: string
  readonly statusCode: number
  readonly details?: unknown

  constructor(options: IApiErrorOptions) {
    super(options.message)
    this.name = 'ApiError'
    this.description = options.description
    this.statusCode = options.statusCode
    this.details = options.details
  }

  static fromResponse(statusCode: number, payload: unknown): ApiError {
    if (!isApiErrorPayload(payload)) {
      return new ApiError({
        message: DEFAULT_ERROR_MESSAGE,
        description: 'El servidor devolvió una respuesta no válida',
        statusCode,
        details: payload,
      })
    }

    return new ApiError({
      message: getMessage(payload),
      description: payload.description || 'La API rechazó la solicitud',
      statusCode: payload.statusCode ?? payload.statuscode ?? statusCode,
      details: payload,
    })
  }
}
