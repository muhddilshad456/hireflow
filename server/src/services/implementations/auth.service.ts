import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { IUserRepository } from "../../repositories/interfaces/IUserRepository.js";
import { ConflictError } from "../../errors/conflict.error.js";
import { genarateOTP } from "../../utils/otp.util.js";
import { NotFoundError } from "../../errors/not-found.error.js";
import { BadRequestError } from "../../errors/bad-request.error.js";
import { ForbiddenError } from "../../errors/forbidden.error.js";
import { IAuthService } from "../interfaces/IAuthService.js";
import { IEmailService } from "../interfaces/IEmailService.js";
import {
  genarateAccessToken,
  genarateRefreshToken,
} from "../../utils/jwt.util.js";
import { genarateResetToken } from "../../utils/token.util.js";
import { UnauthorizedError } from "../../errors/unauthorized.error.js";
import { injectable, inject } from "inversify";
import { TYPES } from "../../dependency-injection/types.js";

@injectable()
export class AuthService implements IAuthService {
  constructor(
    @inject(TYPES.UserRepository) private userRepository: IUserRepository,
    @inject(TYPES.EmailService) private emailService: IEmailService,
  ) {}

  async signup(name: string, email: string, password: string) {
    const existingUser = await this.userRepository.findByEmail(email);

    if (existingUser) throw new ConflictError("User already exist..");

    const hashedPassword = await bcrypt.hash(password, 10);

    // otp
    const otp = genarateOTP();
    const hashedOtp = await bcrypt.hash(otp, 10);
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    // create user
    const user = await this.userRepository.create({
      name,
      email,
      password: hashedPassword,
      emailOtp: hashedOtp,
      otpLastSentAt: new Date(),
      emailOtpExpiry: otpExpiry,
    });

    // send email
    await this.emailService.sendOtpEmail(email, otp);

    console.log(`otp : ${otp} send to ${email}`);

    return { message: "Otp send to email successfully..." };
  }

  async login(email: string, password: string) {
    const user = await this.userRepository.findByEmail(email);

    let newName = "dkda";

    if (!user) {
      throw new Error("Invalied credentials..");
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      throw new UnauthorizedError("Invalid credentials");
    }

    if (!user.isVerified) {
      throw new ForbiddenError("Please verify your email");
    }

    const accessToken = genarateAccessToken({
      userId: user._id,
      role: user.role,
    });
    const refreshToken = genarateRefreshToken({
      userId: user._id,
    });

    await this.userRepository.update(user._id.toString(), {
      refreshToken,
    });
    return { user, accessToken, refreshToken };
  }

  async verifyOtp(email: string, otp: string) {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new NotFoundError("User not found");
    }
    if (user.isVerified) {
      throw new BadRequestError("User already verified");
    }
    if (!user.emailOtpExpiry || user.emailOtpExpiry < new Date()) {
      throw new BadRequestError("OTP expired");
    }
    const isMatch = await bcrypt.compare(otp, user.emailOtp!);
    if (!isMatch) {
      throw new BadRequestError("Invalid OTP");
    }
    await this.userRepository.update(user._id.toString(), {
      isVerified: true,
      emailOtp: null,
      emailOtpExpiry: null,
    });

    return { message: "Email verified successfully..." };
  }

  async resendOtp(email: string) {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new NotFoundError("User not found");
    }
    if (user.isVerified) {
      throw new BadRequestError("User already verified");
    }
    if (
      user.otpLastSentAt &&
      Date.now() - new Date(user.otpLastSentAt).getTime() < 60 * 1000
    ) {
      throw new BadRequestError("Please wait before requesting another OTP");
    }
    if ((user.otpResendCount ?? 0) >= 5) {
      throw new BadRequestError("OTP resend limit reached.");
    }
    // genarate new otp
    const otp = genarateOTP();
    const hashedOtp = await bcrypt.hash(otp, 10);
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    await this.userRepository.update(user._id.toString(), {
      emailOtp: hashedOtp,
      emailOtpExpiry: otpExpiry,
      otpResendCount: (user.otpResendCount ?? 0) + 1,
      otpLastSentAt: new Date(),
    });

    await this.emailService.sendOtpEmail(email, otp);

    console.log(`otp : ${otp} send to ${email}`);

    return { message: "Otp resend successfully." };
  }

  async refreshToken(token: string) {
    if (!token) {
      throw new NotFoundError("token is missing");
    }
    const user = await this.userRepository.findByRefreshToken(token);
    if (!user) {
      throw new ForbiddenError("invalied refresh token ..!");
    }
    const accessToken = genarateAccessToken({
      userId: user._id,
      role: user.role,
    });
    return { accessToken };
  }

  async logout(userId: string): Promise<void> {
    await this.userRepository.removeRefreshToken(userId);
  }

  async forgotPassword(email: string): Promise<void> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new NotFoundError("User not found");
    }
    const resetToken = genarateResetToken();
    const expiry = new Date(Date.now() + 15 * 60 * 1000);
    await this.userRepository.update(user._id.toString(), {
      emailLinkToken: resetToken,
      emailLinkTokenExpiry: expiry,
    });
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    await this.emailService.sendPassResetEmail(email, resetLink);
  }

  async getUsers(): Promise<any> {
    const users = await this.userRepository.getAllUsers();
    return users;
  }
}
