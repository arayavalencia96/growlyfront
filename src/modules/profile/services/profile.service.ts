import { apiService } from "@/common/services/api.service";
import type {
  IAuthResponse,
  IUser,
} from "@/modules/auth/interfaces/auth.interface";
import type {
  IChangePasswordRequest,
  IDeactivateAccountRequest,
  IProfileService,
  IUpdatePersonalDataRequest,
} from "@/modules/profile/interfaces/profile.interface";

class ProfileService implements IProfileService {
  getProfile() {
    return apiService.get<IUser>("/auth/profile");
  }

  updatePersonalData(payload: IUpdatePersonalDataRequest) {
    return apiService.patch<IAuthResponse, IUpdatePersonalDataRequest>(
      "/auth/profile",
      payload,
    );
  }

  changePassword(payload: IChangePasswordRequest) {
    return apiService.patch<IAuthResponse, IChangePasswordRequest>(
      "/auth/profile",
      payload,
    );
  }

  deactivate(payload: IDeactivateAccountRequest) {
    return apiService.delete<IUser>("/auth/profile", { body: payload });
  }
}

export const profileService = new ProfileService();
