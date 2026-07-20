import type { IApiResponse } from "@/common/interfaces/api.interface";
import type {
  IAuthResponse,
  IUser,
} from "@/modules/auth/interfaces/auth.interface";

export const ACCOUNT_DEACTIVATION_REASONS = [
  "no_longer_needed",
  "missing_features",
  "difficult_to_use",
  "privacy_concerns",
  "technical_issues",
  "other",
] as const;

export type AccountDeactivationReason =
  (typeof ACCOUNT_DEACTIVATION_REASONS)[number];

export const ACCOUNT_DEACTIVATION_OPTIONS: ReadonlyArray<{
  value: AccountDeactivationReason;
  label: string;
}> = [
  { value: "no_longer_needed", label: "Ya no necesito la aplicación" },
  { value: "missing_features", label: "Me faltan funcionalidades" },
  { value: "difficult_to_use", label: "Me resulta difícil de usar" },
  { value: "privacy_concerns", label: "Me preocupa la privacidad" },
  { value: "technical_issues", label: "Tuve problemas técnicos" },
  { value: "other", label: "Otro motivo" },
];

export interface IUpdatePersonalDataRequest {
  name: string;
  email?: string;
  currentPassword?: string;
}

export interface IChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface IDeactivateAccountRequest {
  reason: AccountDeactivationReason;
  comment?: string;
  currentPassword: string;
}

export interface IPersonalDataFormValues {
  name: string;
  email: string;
  currentPassword: string;
}

export interface IChangePasswordFormValues extends IChangePasswordRequest {
  confirmPassword: string;
}

export interface IDeactivateAccountFormValues extends IDeactivateAccountRequest {
  comment: string;
  confirmation: string;
}

export interface IProfileService {
  getProfile(): Promise<IApiResponse<IUser>>;
  updatePersonalData(
    payload: IUpdatePersonalDataRequest,
  ): Promise<IApiResponse<IAuthResponse>>;
  changePassword(
    payload: IChangePasswordRequest,
  ): Promise<IApiResponse<IAuthResponse>>;
  deactivate(payload: IDeactivateAccountRequest): Promise<IApiResponse<IUser>>;
}

export interface IPersonalDataFormProps {
  user: IUser;
  onUpdated(user: IUser): void;
  onEmailChangeRequested(email: string): void;
}

export interface IChangePasswordFormProps {
  onPasswordChanged(): void;
}

export interface IDeactivateAccountModalProps {
  isOpen: boolean;
  onClose(): void;
  onDeactivated(): void;
}
