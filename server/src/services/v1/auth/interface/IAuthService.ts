import { LoginDto } from "../../../../dtos/v1/auth/login.dto";
import { ResetPasswordDto } from "../../../../dtos/v1/auth/reset-password.dto";
import { SignupDto } from "../../../../dtos/v1/auth/signup.dto";
import { VerifyOtpDto } from "../../../../dtos/v1/auth/verify-otp.dto";
import { IUser } from "../../../../models/user.model";
import { AuthResponse } from "../../../../types/loginResponse";
import { TokenPair } from "../../../../types/tokenPair";

export interface IAuthService {
  signup(dto: SignupDto): Promise<{ email: string }>;
  login(dto: LoginDto): Promise<AuthResponse>;
  verifyOtp(dto: VerifyOtpDto): Promise<void>;
  resendOtp(email: string): Promise<void>;
  refreshToken(token: string): Promise<{ accessToken: string }>;
  logout(userId: string): Promise<void>;
  forgotPassword(email: string): Promise<void>;
  resetPassword(tdo: ResetPasswordDto): Promise<void>;
  getCurrentUser(userId: string): Promise<Partial<IUser>>;
  getGoogleAuthUrl(): Promise<string>;
  handleGoogleCallback(code: string): Promise<TokenPair>;
  acceptInvite(id: string, token: string, password: string): Promise<any>;
  changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<any>;
}
