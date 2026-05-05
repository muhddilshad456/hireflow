import nodemailer from "nodemailer";
import { IEmailService } from "../interface/IEmailService";

export class EmailService implements IEmailService {
  async sendEmail(to: string, subject: string, html: string) {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
    await transporter.sendMail({
      to,
      subject,
      html,
    });
  }

  async sendOtpEmail(email: string, otp: string): Promise<void> {
    const sub = "Your otp code";
    const html = `
      <h2>Your OTP is ${otp}</h2>
      <p>This code expires in 5 minutes</p>
    `;
    await this.sendEmail(email, sub, html);
  }

  async sendPassResetEmail(email: string, link: string): Promise<void> {
    const subject = "Reset Your Password";
    const html = `
      <p>Click the link below to reset your password</p>
      <a href="${link}">Reset Password</a>
    `;
    await this.sendEmail(email, subject, html);
  }
}
