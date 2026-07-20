import { apiService } from "@/common/services/api.service";

import type { IHttpClient } from "@/common/interfaces/api.interface";
import type {
  IAuthResponse,
  IAuthService,
  IChangeBlockedPasswordRequest,
  IForgotPasswordRequest,
  ILoginRequest,
  IRegisterRequest,
  IRequestVerificationCode,
  IResetPasswordRequest,
  IVerificationCodeRequest,
} from "@/modules/auth/interfaces/auth.interface";

class AuthService implements IAuthService {
  private readonly httpClient: IHttpClient;

  constructor(httpClient: IHttpClient) {
    this.httpClient = httpClient;
  }

  register(data: IRegisterRequest) {
    return this.httpClient.post<IAuthResponse, IRegisterRequest>(
      "/auth/register",
      data,
    );
  }

  login(data: ILoginRequest) {
    return this.httpClient.post<IAuthResponse, ILoginRequest>(
      "/auth/login",
      data,
    );
  }

  requestVerificationCode(data: IRequestVerificationCode) {
    return this.httpClient.post<IAuthResponse, IRequestVerificationCode>(
      "/auth/verification-code",
      data,
    );
  }

  verifyCode(data: IVerificationCodeRequest) {
    return this.httpClient.post<IAuthResponse, IVerificationCodeRequest>(
      "/auth/verify-code",
      data,
    );
  }

  changeBlockedPassword(data: IChangeBlockedPasswordRequest) {
    return this.httpClient.post<IAuthResponse, IChangeBlockedPasswordRequest>(
      "/auth/change-blocked-password",
      data,
    );
  }

  forgotPassword(data: IForgotPasswordRequest) {
    return this.httpClient.post<null, IForgotPasswordRequest>(
      "/auth/forgot-password",
      data,
    );
  }

  resetPassword(data: IResetPasswordRequest) {
    return this.httpClient.post<IAuthResponse, IResetPasswordRequest>(
      "/auth/reset-password",
      data,
    );
  }
}

export const authService = new AuthService(apiService);
