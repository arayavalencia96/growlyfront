import { ApiError } from '@/common/errors/api.error'

export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message
  }

  return 'Ocurrió un error inesperado. Intenta nuevamente.'
}
