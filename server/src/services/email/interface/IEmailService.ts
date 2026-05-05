export interface IEmailService {
  sendEmail(to: string, otp: string, html: string): Promise<void>;
  sendOtpEmail(email: string, otp: string): Promise<void>;
  sendPassResetEmail(email: string, link: string): Promise<void>;
}
