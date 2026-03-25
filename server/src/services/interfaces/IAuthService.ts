export interface IAuthService {
  signup(name: string, email: string, password: string): Promise<any>;
  login(email: string, password: string): Promise<any>;
  verifyOtp(email: string, otp: string): Promise<any>;
  resendOtp(email: string): Promise<any>;
  refreshToken(token: string): Promise<any>;
  logout(userId: string): Promise<void>;
  forgotPassword(email: string): Promise<void>;
  getUsers(): Promise<any>;
}
