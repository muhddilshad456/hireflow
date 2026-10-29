import bcrypt from "bcryptjs";
import { Types } from "mongoose";
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
import { UnauthorizedError } from "../../../../errors/unauthorized.error.js";
import { inject, injectable } from "inversify";
import { TYPES } from "../../../../dependency-injection/types.js";
import { IRedisService } from "../../../redis/interface/IRedisService.js";
import { SignupDto, UserRole } from "../../../../dtos/v1/auth/signup.dto.js";
import { AuthMapper } from "../../../../mapper/auth/authMapper.js";
import { LoginDto } from "../../../../dtos/v1/auth/login.dto.js";
import { VerifyOtpDto } from "../../../../dtos/v1/auth/verify-otp.dto.js";
import { IUser } from "../../../../models/user.model.js";
import { TokenPair } from "../../../../types/tokenPair.js";
import { IInvitationRepository } from "../../../../repositories/company/interface/IInvitationRepository.js";
import { InvitationStatus } from "../../../../models/recruiter.invitation.model.js";
import { INotificationService } from "../../notification/interface/INotificationService.js";
import { ICompanyRepository } from "../../../../repositories/company/interface/ICompanyRepository.js";
import { COMPANY_MESSAGES } from "../../../../constants/messages/company.js";

@injectable()
export class AuthService implements IAuthService {
  constructor(
    @inject(TYPES.UserRepository) private _userRepository: IUserRepository,
    @inject(TYPES.InvitationRepository)
    private _invitationRepository: IInvitationRepository,
    @inject(TYPES.NotificationService)
    private _notificationService: INotificationService,
    @inject(TYPES.CompanyRepository)
    private _companyRepository: ICompanyRepository,
    @inject(TYPES.EmailService) private _emailService: IEmailService,
    @inject(TYPES.RedisService) private _redisService: IRedisService,
    @inject(TYPES.Logger) private _logger: Logger,
  ) {}

  //* signup
  async signup(dto: SignupDto): Promise<{ email: string }> {
    this._logger.info({
      event: "SIGNUP_STARTED",
      email: dto.email,
    });

    const userData = AuthMapper.toUserEntity(dto);

    const existingUser = await this._userRepository.findByEmail(userData.email);

    if (existingUser) {
      this._logger.warn({
        event: "SIGNUP_FAILED_USER_EXISTS",
        email: userData.email,
      });
      throw new ConflictError("User already eixst..");
    }

    const hashedPassword = await bcrypt.hash(userData.password, 10);

    userData.password = hashedPassword;

    // create user
    const user = await this._userRepository.create(userData);

    this._logger.info({
      event: "USER_CREATED",
      userId: user._id,
      email: user.email,
    });

    // otp
    const otp = genarateOTP();

    const hashedOtp = await bcrypt.hash(otp, 10);

    await this._redisService.set(`otp:${userData.email}`, hashedOtp, 120);

    // send email
    await this._emailService.sendOtpEmail(userData.email, otp);

    this._logger.info({
      event: "OTP_SENT",
      email: user.email,
      otp,
    });

    this._logger.info({
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
    this._logger.info({
      event: "LOGIN_STARTED",
      email: dto.email,
    });

    const { email, password } = dto;

    const user = await this._userRepository.findByEmail(email);

    if (!user || !(await bcrypt.compare(password, user.password))) {
      this._logger.warn({
        event: "LOGIN_FAILED_INVALID_CREDENTIALS",
        email,
      });
      throw new UnauthorizedError("Invalid email or password");
    }

    if (user.isBlocked) {
      this._logger.warn({
        event: "User Blocked",
        email,
      });
      throw new UnauthorizedError("Access Rescricted");
    }

    if (!user.isVerified) {
      this._logger.warn({
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

    await this._userRepository.update(user._id.toString(), {
      refreshToken,
    });

    this._logger.info({
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
        profilePicture: user.profilePicture,
      },
      accessToken,
      refreshToken,
    };
  }

  // * verify otp
  async verifyOtp(dto: VerifyOtpDto) {
    const { email, otp } = dto;

    this._logger.info({
      event: "VERIFY_OTP_STARTED",
      email,
    });

    const user = await this._userRepository.findByEmail(email);

    if (!user || user.isVerified) {
      this._logger.warn({
        event: "VERIFY_OTP_INVALID_USER_OR_ALREADY_VERIFIED",
        email,
      });
      throw new BadRequestError("Invalid or expired OTP");
    }

    const redisOtp = await this._redisService.get(`otp:${email}`);

    if (!redisOtp) {
      this._logger.warn({
        event: "VERIFY_OTP_NOT_FOUND",
        email,
      });
      throw new BadRequestError("Invalid or expired OTP");
    }

    const isMatch = await bcrypt.compare(otp, redisOtp!);

    if (!isMatch) {
      this._logger.warn({
        event: "VERIFY_OTP_MISMATCH",
        email,
      });
      throw new BadRequestError("Invalid or expired OTP");
    }

    await this._userRepository.update(user._id.toString(), {
      isVerified: true,
    });

    await this._redisService.del(`otp:${email}`);

    this._logger.info({
      event: "VERIFY_OTP_SUCCESS",
      userId: user._id,
      email,
    });
  }

  // * resend otp
  async resendOtp(email: string) {
    const user = await this._userRepository.findByEmail(email);
    if (!user) throw new NotFoundError("User not found");

    if (user.isVerified) throw new BadRequestError("User already verified");

    // genarate new otp
    const otp = genarateOTP();

    const hashedOtp = await bcrypt.hash(otp, 10);

    await this._redisService.set(`otp:${email}`, hashedOtp, 120);

    console.log(`otp : ${otp} send to ${email}`);
  }

  // * refresh token
  async refreshToken(token: string) {
    if (!token) {
      throw new NotFoundError("token is missing");
    }
    const user = await this._userRepository.findByRefreshToken(token);
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
    await this._userRepository.removeRefreshToken(userId);
  }

  // * Token check
  async getCurrentUser(userId: string): Promise<Partial<IUser>> {
    this._logger.info({
      event: "TOKEN_CHECK_STARTED",
    });

    const user = await this._userRepository.findById(userId);

    if (!user) {
      this._logger.warn({
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
    this._logger.info({
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
      this._logger.error({
        event: "GOOGLE_EMAIL_MISSING",
        message: "Google did not return email",
      });
      throw new NotFoundError("Email not provided by Google");
    }

    this._logger.info({
      event: "GOOGLE_USER_FETCHED",
      email: googleUser.email,
    });

    const existingUser = await this._userRepository.findByEmail(
      googleUser.email,
    );

    let user = existingUser;

    if (!existingUser) {
      this._logger.info({
        event: "GOOGLE_SIGNUP",
        email: googleUser.email,
      });

      const userData = AuthMapper.toUserEntity({
        name: googleUser.name,
        email: googleUser.email,
        password: "null",
        role: UserRole.USER,
      });
      user = await this._userRepository.create(userData);
    } else {
      this._logger.info({
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

    await this._userRepository.update(user!._id.toString(), { refreshToken });

    this._logger.info({
      event: "GOOGLE_LOGIN_SUCCESS",
      userId: user!._id,
    });

    return {
      accessToken,
      refreshToken,
    };
  }
  //* accept invite
  async acceptInvite(
    id: string,
    token: string,
    password: string,
  ): Promise<{ message: string; userId: Types.ObjectId }> {
    const invitation = await this._invitationRepository.findById(id);
    if (!invitation) {
      this._logger.info({
        event: "Invalid invitation",
      });
      throw new BadRequestError("Invalid invitation");
    }

    const isValidToken = await bcrypt.compare(token, invitation.token);
    if (!isValidToken) {
      this._logger.info({
        event: "Invalid Token",
      });
      throw new BadRequestError("Invalid token");
    }

    const existingUser = await this._userRepository.findByEmail(
      invitation.email,
    );
    if (existingUser) {
      this._logger.info({
        event: "User already exist",
      });
      throw new ConflictError("User already exists");
    }

    if (invitation.status == InvitationStatus.ACCEPTED) {
      this._logger.info({
        event: "Invitation already accepted",
      });
      throw new ConflictError("Invite already accepted");
    }
    if (invitation.status == InvitationStatus.CANCELLED) {
      this._logger.info({
        event: "Invitation canceled",
      });
      throw new ConflictError("Invite canceled");
    }

    if (invitation.expiresAt < new Date()) {
      this._logger.info({
        event: "Invitation expired",
      });
      throw new BadRequestError("Invite expired");
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    const userData = {
      name: invitation.name,
      email: invitation.email,
      password: hashedPassword,
      role: invitation.role,
      isVerified: true,
      company: invitation.companyId,
    };

    const user = await this._userRepository.create(userData);

    this._logger.info({
      event: "USER_CREATED",
      userId: user._id,
      email: user.email,
    });

    await this._invitationRepository.update(invitation._id.toString(), {
      status: InvitationStatus.ACCEPTED,
    });

    const company = await this._companyRepository.findById(
      invitation.companyId.toString(),
    );

    if (!company) {
      this._logger.info({
        event: COMPANY_MESSAGES.COMPANY_NOT_FOUND,
      });
      throw new BadRequestError(COMPANY_MESSAGES.COMPANY_NOT_FOUND);
    }

    await this._notificationService.notify(company?.adminId?.toString(), {
      type: "INVITATION ACCEPTED",
      title: "Invitation request accepted.",
      message: `Your invitation request accepted by ${invitation.role}`,
      link: `/dashboard`,
    });

    return {
      message: "Account created successfully",
      userId: user._id,
    };
  }
}
