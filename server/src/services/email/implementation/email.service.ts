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

  async sendInviteEmail(
    email: string,
    link: string,
    role: string,
  ): Promise<void> {
    const subject = `You're invited to join as a ${role}`;

    const html = `
    <h2>You're Invited!</h2>
    <p>You have been invited to join our platform as a <strong>${role}</strong>.</p>
    <p>Click the link below to set your password and activate your account:</p>
    <a href="${link}">Accept Invitation</a>
    <p>This link will expire in 24 hours.</p>
  `;

    await this.sendEmail(email, subject, html);
  }

  async sendEmailChangeVerification(
    email: string,
    link: string,
  ): Promise<void> {
    const subject = "Confirm Your New Email";

    const html = `
    <h2>Confirm Email Change</h2>
    <p>Click the link below to verify your new email address:</p>
    <a href="${link}">Verify Email</a>
    <p>This link will expire in 10 minutes.</p>
  `;

    await this.sendEmail(email, subject, html);
  }
}
