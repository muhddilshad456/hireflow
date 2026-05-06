import bcrypt from "bcryptjs";
import type { Logger } from "pino";
import querystring from "querystring";
import axios from "axios";
import { IUserRepository } from "../../../../repositories/user/interfaces/IUserRepository.js";
import { ConflictError } from "../../../../errors/conflict.error.js";
import { genarateOTP } from "../../../../utils/otp.util.js";
import { NotFoundError } from "../../../../errors/not-found.error.js";
import { BadRequestError } from "../../../../errors/bad-request.error.js";
import { ForbiddenError } from "../../../../errors/forbidden.error.js";
import { IAuthService } from "../interface/IAuthService.js";
import { IEmailService } from "../../../email/interface/IEmailService.js";
import {
  genarateAccessToken,
  genarateRefreshToken,
} from "../../../../utils/jwt.util.js";
import { genarateResetToken } from "../../../../utils/token.util.js";
import { UnauthorizedError } from "../../../../errors/unauthorized.error.js";
import { inject, injectable } from "inversify";
import { TYPES } from "../../../../dependency-injection/types.js";
import { IRedisService } from "../../../redis/interface/IRedisService.js";
import { SignupDto, UserRole } from "../../../../dtos/v1/auth/signup.dto.js";
import { AuthMapper } from "../../../../mapper/auth.mapper.js";
import { LoginDto } from "../../../../dtos/v1/auth/login.dto.js";
import { VerifyOtpDto } from "../../../../dtos/v1/auth/verify-otp.dto.js";
import { ResetPasswordDto } from "../../../../dtos/v1/auth/reset-password.dto.js";
import { generateResetLink } from "../../../../utils/generateResetLink.js";
import { IUser } from "../../../../models/user.model.js";
import { TokenPair } from "../../../../types/tokenPair.js";

@injectable()
export class AuthService implements IAuthService {
  constructor(
    @inject(TYPES.UserRepository) private userRepository: IUserRepository,
    @inject(TYPES.EmailService) private emailService: IEmailService,
    @inject(TYPES.RedisService) private redisService: IRedisService,
    @inject(TYPES.Logger) private logger: Logger,
  ) {}

  // signup
  async signup(dto: SignupDto): Promise<{ email: string }> {
    this.logger.info({
      event: "SIGNUP_STARTED",
      email: dto.email,
    });

    const userData = AuthMapper.toUserEntity(dto);

    const existingUser = await this.userRepository.findByEmail(userData.email);

    if (existingUser) {
      this.logger.warn({
        event: "SIGNUP_FAILED_USER_EXISTS",
        email: userData.email,
      });
      throw new ConflictError("User already eixst..");
    }

    const hashedPassword = await bcrypt.hash(userData.password, 10);

    userData.password = hashedPassword;

    // create user
    const user = await this.userRepository.create(userData);

    this.logger.info({
      event: "USER_CREATED",
      userId: user._id,
      email: user.email,
    });

    // otp
    const otp = genarateOTP();

    const hashedOtp = await bcrypt.hash(otp, 10);

    await this.redisService.set(`otp:${userData.email}`, hashedOtp, 120);

    // send email
    await this.emailService.sendOtpEmail(userData.email, otp);

    this.logger.info({
      event: "OTP_SENT",
      email: user.email,
      otp,
    });

    this.logger.info({
      event: "SIGNUP_COMPLETED",
      userId: user._id,
      email: user.email,
    });

    return {
      email: user.email,
    };
  }

  // * login
  async login(dto: LoginDto) {
    this.logger.info({
      event: "LOGIN_STARTED",
      email: dto.email,
    });

    const { email, password } = dto;

    const user = await this.userRepository.findByEmail(email);

    if (!user || !(await bcrypt.compare(password, user.password))) {
      this.logger.warn({
        event: "LOGIN_FAILED_INVALID_CREDENTIALS",
        email,
      });
      throw new UnauthorizedError("Invalid email or password");
    }

    if (user.isBlocked) {
      this.logger.warn({
        event: "User Blocked",
        email,
      });
      throw new UnauthorizedError("Access Rescricted");
    }

    if (!user.isVerified) {
      this.logger.warn({
        event: "LOGIN_FAILED_NOT_VERIFIED",
        email,
      });
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

    this.logger.info({
      event: "LOGIN_SUCCESS",
      userId: user._id,
      email,
    });

    return {
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      accessToken,
      refreshToken,
    };
  }

  // * verify otp
  async verifyOtp(dto: VerifyOtpDto) {
    const { email, otp } = dto;

    this.logger.info({
      event: "VERIFY_OTP_STARTED",
      email,
    });

    const user = await this.userRepository.findByEmail(email);

    if (!user || user.isVerified) {
      this.logger.warn({
        event: "VERIFY_OTP_INVALID_USER_OR_ALREADY_VERIFIED",
        email,
      });
      throw new BadRequestError("Invalid or expired OTP");
    }

    const redisOtp = await this.redisService.get(`otp:${email}`);

    if (!redisOtp) {
      this.logger.warn({
        event: "VERIFY_OTP_NOT_FOUND",
        email,
      });
      throw new BadRequestError("Invalid or expired OTP");
    }

    const isMatch = await bcrypt.compare(otp, redisOtp!);

    if (!isMatch) {
      this.logger.warn({
        event: "VERIFY_OTP_MISMATCH",
        email,
      });
      throw new BadRequestError("Invalid or expired OTP");
    }

    await this.userRepository.update(user._id.toString(), {
      isVerified: true,
    });

    await this.redisService.del(`otp:${email}`);

    this.logger.info({
      event: "VERIFY_OTP_SUCCESS",
      userId: user._id,
      email,
    });
  }

  // * resend otp
  async resendOtp(email: string) {
    const user = await this.userRepository.findByEmail(email);
    if (!user) throw new NotFoundError("User not found");

    if (user.isVerified) throw new BadRequestError("User already verified");

    // genarate new otp
    const otp = genarateOTP();

    const hashedOtp = await bcrypt.hash(otp, 10);

    await this.redisService.set(`otp:${email}`, hashedOtp, 120);

    console.log(`otp : ${otp} send to ${email}`);
  }

  // * refresh token
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

  // * logout
  async logout(userId: string): Promise<void> {
    await this.userRepository.removeRefreshToken(userId);
  }

  // * forgot password
  async forgotPassword(email: string): Promise<void> {
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      this.logger.warn({ email }, "Forgot password: user not found");
      return;
    }

    this.logger.info({ email }, "Processing forgot password");

    const resetToken = genarateResetToken();

    const expiry = new Date(Date.now() + 15 * 60 * 1000);

    await this.userRepository.update(user._id.toString(), {
      emailLinkToken: resetToken,
      emailLinkTokenExpiry: expiry,
    });

    const baseUrl = process.env.FRONTEND_URL!;

    const resetLink = generateResetLink(baseUrl, user.role, resetToken);

    this.logger.info({
      EVENT: "Reset link created..",
      Link: resetLink,
    });

    try {
      await this.emailService.sendPassResetEmail(email, resetLink);
      this.logger.info({ email }, "Reset email sent");
    } catch (err) {
      this.logger.error({ err }, "Failed to send reset email");
    }
  }

  // * reset password
  async resetPassword(tdo: ResetPasswordDto): Promise<void> {
    const { password, token } = tdo;
    this.logger.info({
      event: "RESET_PASSWORD_STARTED",
    });

    const user = await this.userRepository.findByResetToken(token);

    if (!user) {
      this.logger.warn({
        event: "RESET_PASSWORD_INVALID_TOKEN",
      });
      throw new BadRequestError("Invalid or expired token");
    }

    if (!user.emailLinkTokenExpiry || user.emailLinkTokenExpiry < new Date()) {
      this.logger.warn({
        event: "RESET_PASSWORD_TOKEN_EXPIRED",
        userId: user._id,
      });
      throw new BadRequestError("Token expired");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await this.userRepository.update(user._id.toString(), {
      password: hashedPassword,
      emailLinkToken: null,
      emailLinkTokenExpiry: null,
    });

    this.logger.info({
      event: "RESET_PASSWORD_SUCCESS",
      userId: user._id,
    });
  }

  // * Token check
  async getCurrentUser(userId: string): Promise<Partial<IUser>> {
    this.logger.info({
      event: "TOKEN_CHECK_STARTED",
    });

    const user = await this.userRepository.findById(userId);

    if (!user) {
      this.logger.warn({
        event: "EXPIRED_INVALID_TOKEN",
      });
      throw new BadRequestError("Invalid or expired token");
    }

    return {
      _id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
    };
  }

  // * get google url
  async getGoogleAuthUrl(): Promise<string> {
    const baseUrl = "https://accounts.google.com/o/oauth2/v2/auth";

    const options = {
      client_id: process.env.GOOGLE_CLIENT_ID,
      redirect_uri: process.env.GOOGLE_REDIRECT_URI,
      response_type: "code",
      scope: [
        "https://www.googleapis.com/auth/userinfo.profile",
        "https://www.googleapis.com/auth/userinfo.email",
      ].join(" "),
      access_type: "offline",
      prompt: "consent",
    };

    const url = `${baseUrl}?${querystring.stringify(options)}`;

    return url;
  }

  // * handle google callback
  async handleGoogleCallback(code: string): Promise<TokenPair> {
    this.logger.info({
      event: "GOOGLE_LOGIN_STARTED",
      message: "Google login process started",
    });

    const tokenResponse = await axios.post(
      "https://oauth2.googleapis.com/token",

      new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: process.env.GOOGLE_REDIRECT_URI!,
        grant_type: "authorization_code",
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      },
    );

    const { access_token } = tokenResponse.data;

    const userResponse = await axios.get(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      },
    );

    const googleUser = userResponse.data;

    if (!googleUser.email) {
      this.logger.error({
        event: "GOOGLE_EMAIL_MISSING",
        message: "Google did not return email",
      });
      throw new NotFoundError("Email not provided by Google");
    }

    this.logger.info({
      event: "GOOGLE_USER_FETCHED",
      email: googleUser.email,
    });

    const existingUser = await this.userRepository.findByEmail(
      googleUser.email,
    );

    let user = existingUser;

    if (!existingUser) {
      this.logger.info({
        event: "GOOGLE_SIGNUP",
        email: googleUser.email,
      });

      const userData = AuthMapper.toUserEntity({
        name: googleUser.name,
        email: googleUser.email,
        password: "null",
        role: UserRole.USER,
      });
      user = await this.userRepository.create(userData);
    } else {
      this.logger.info({
        event: "GOOGLE_LOGIN",
        email: googleUser.email,
      });
    }

    const accessToken = genarateAccessToken({
      userId: user!._id!,
      role: user!.role!,
    });

    const refreshToken = genarateRefreshToken({
      userId: user!._id,
    });

    await this.userRepository.update(user!._id.toString(), { refreshToken });

    this.logger.info({
      event: "GOOGLE_LOGIN_SUCCESS",
      userId: user!._id,
    });

    return {
      accessToken,
      refreshToken,
    };
  }
}
