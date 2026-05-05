import { LoginDto } from "../../../../dtos/v1/auth/login.dto";
import { ResetPasswordDto } from "../../../../dtos/v1/auth/reset-password.dto";
import { SignupDto } from "../../../../dtos/v1/auth/signup.dto";
import { VerifyOtpDto } from "../../../../dtos/v1/auth/verify-otp.dto";
import { IUser } from "../../../../models/user.model";

export interface IAuthService {
  signup(dto: SignupDto): Promise<any>;
  login(dto: LoginDto): Promise<any>;
  verifyOtp(dto: VerifyOtpDto): Promise<any>;
  resendOtp(email: string): Promise<any>;
  refreshToken(token: string): Promise<any>;
  logout(userId: string): Promise<void>;
  forgotPassword(email: string): Promise<void>;
  resetPassword(tdo: ResetPasswordDto): Promise<void>;
  getCurrentUser(userId: string): Promise<Partial<IUser>>;
  getGoogleAuthUrl(): Promise<string>;
  handleGoogleCallback(code: string): Promise<any>;
}
