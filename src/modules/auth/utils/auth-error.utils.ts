import { ApiError } from '@/common/errors/api.error'
import type { IAuthResponse } from '@/modules/auth/interfaces/auth.interface'

const ERROR_TRANSLATIONS: Readonly<Record<string, string>> = {
  'Email is already registered': 'Este correo ya se encuentra registrado.',
  'Invalid credentials': 'El correo o la contraseña son incorrectos.',
  'Email is not validated': 'Debes validar tu correo antes de ingresar.',
  'User is blocked':
    'Tu cuenta está bloqueada. Ingresa el código que enviamos a tu correo.',
  'User was blocked after three failed attempts':
    'Bloqueamos tu cuenta por seguridad. Revisa tu correo para continuar.',
  'Password change is required':
    'Debes cambiar tu contraseña desde el enlace que enviamos a tu correo.',
  'Verification code is invalid or expired':
    'El código es incorrecto o ya venció.',
  'Verification code cannot be requested':
    'No pudimos generar un código para este correo.',
  'User is already validated': 'Este correo ya se encuentra validado.',
  'Invalid password change token':
    'El enlace para cambiar la contraseña es inválido o venció.',
  'Invalid password reset token':
    'El enlace para recuperar la contraseña es inválido, venció o ya fue utilizado.',
}

export function getAuthErrorMessage(error: unknown): string {
  if (!(error instanceof ApiError)) {
    return 'Ocurrió un error inesperado. Intenta nuevamente.'
  }

  return ERROR_TRANSLATIONS[error.message] || error.message
}

export function isAuthError(error: unknown, message: string): boolean {
  return error instanceof ApiError && error.message === message
}

export function getSessionTokens(response: IAuthResponse) {
  if (!response.accessToken || !response.refreshToken) {
    throw new ApiError({
      message: 'La sesión recibida no es válida',
      description: 'La API no devolvió ambos tokens de sesión',
      statusCode: 500,
      details: response,
    })
  }

  return {
    accessToken: response.accessToken,
    refreshToken: response.refreshToken,
  }
}
