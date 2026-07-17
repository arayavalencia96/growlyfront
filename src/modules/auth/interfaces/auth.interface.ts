import type {
  ComponentPropsWithRef,
  ReactNode,
} from 'react'
import type { IApiResponse } from '@/common/interfaces/api.interface'

export interface IUser {
  id: string
  name: string
  email: string
  isValidated: boolean
  isDisabled: boolean
  isBlocked: boolean
  passwordChangeRequired: boolean
  createdAt: string
  updatedAt: string
}

export interface IAuthResponse {
  user: IUser
  accessToken?: string
  refreshToken?: string
  passwordChangeToken?: string
  verificationCode?: string
}

export interface IRegisterRequest {
  name: string
  email: string
  password: string
}

export interface IRegisterForm extends IRegisterRequest {
  confirmPassword: string
}

export interface ILoginRequest {
  email: string
  password: string
}

export interface IVerificationCodeRequest {
  email: string
  code: string
}

export interface IRequestVerificationCode {
  email: string
}

export interface IChangeBlockedPasswordRequest {
  passwordChangeToken: string
  newPassword: string
}

export interface IForgotPasswordRequest {
  email: string
}

export interface IResetPasswordRequest {
  resetToken: string
  newPassword: string
}

export interface IChangeBlockedPasswordForm {
  newPassword: string
  confirmPassword: string
}

export interface IAuthService {
  register(data: IRegisterRequest): Promise<IApiResponse<IAuthResponse>>
  login(data: ILoginRequest): Promise<IApiResponse<IAuthResponse>>
  requestVerificationCode(
    data: IRequestVerificationCode,
  ): Promise<IApiResponse<IAuthResponse>>
  verifyCode(
    data: IVerificationCodeRequest,
  ): Promise<IApiResponse<IAuthResponse>>
  changeBlockedPassword(
    data: IChangeBlockedPasswordRequest,
  ): Promise<IApiResponse<IAuthResponse>>
  forgotPassword(
    data: IForgotPasswordRequest,
  ): Promise<IApiResponse<null>>
  resetPassword(
    data: IResetPasswordRequest,
  ): Promise<IApiResponse<IAuthResponse>>
}

export interface IAuthLayoutProps {
  children: ReactNode
  eyebrow: string
  title: string
  description: string
  step: string
}

export interface IFormFieldProps
  extends Omit<ComponentPropsWithRef<'input'>, 'size'> {
  label: string
  error?: string
  hint?: string
  icon?: ReactNode
}

export interface IPasswordFieldProps
  extends Omit<IFormFieldProps, 'type'> {
  type?: never
}

export interface IAuthAlertProps {
  message: string
  variant?: 'error' | 'success' | 'info'
}

export interface ISubmitButtonProps {
  children: ReactNode
  isLoading: boolean
  loadingText: string
  disabled?: boolean
}

export interface IAuthNavigationState {
  message?: string
  alertVariant?: IAuthAlertProps['variant']
  passwordChangeToken?: string
}

export interface INewPasswordFormProps {
  hasToken: boolean
  onSave(newPassword: string): Promise<void>
  submitText: string
  loadingText: string
}
