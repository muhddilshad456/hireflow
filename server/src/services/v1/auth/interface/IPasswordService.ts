import { ResetPasswordDto } from "../../../../dtos/v1/auth/reset-password.dto";

export interface IPasswordService {
  forgotPassword(email: string): Promise<void>;
  resetPassword(tdo: ResetPasswordDto): Promise<void>;
  changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<any>;
}
