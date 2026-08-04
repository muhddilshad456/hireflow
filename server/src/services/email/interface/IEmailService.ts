export interface IEmailService {
  sendEmail(to: string, otp: string, html: string): Promise<void>;
  sendOtpEmail(email: string, otp: string): Promise<void>;
  sendPassResetEmail(email: string, link: string): Promise<void>;
  sendInviteEmail(email: string, link: string, role: string): Promise<void>;
  sendEmailChangeVerification(email: string, link: string): Promise<void>;
}
