import { ApiError } from '@/common/errors/api.error'

export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.message.startsWith('Insufficient position for ')) {
      const position = error.message
        .replace('Insufficient position for ', '')
        .replace(' on ', ' en ')
      return 'No tienes posición suficiente de ' + position + ' para realizar esta venta.'
    }

    if (error.message === 'Fees cannot exceed the gross sale amount') {
      return 'Las comisiones no pueden superar el monto bruto de la venta.'
    }

    return error.message
  }

  return 'Ocurrió un error inesperado. Intenta nuevamente.'
}
