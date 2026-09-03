import type { Logger } from "pino";
import { IUserRepository } from "../../../../repositories/user/interfaces/IUserRepository.js";
import { ConflictError } from "../../../../errors/conflict.error.js";
import { BadRequestError } from "../../../../errors/bad-request.error.js";
import { inject, injectable } from "inversify";
import { TYPES } from "../../../../dependency-injection/types.js";
import { generateLink } from "../../../../utils/generateLink.js";
import { generateToken } from "../../../../utils/token.util.js";
import { VALIDATION_MESSAGES } from "../../../../constants/messages/validation.js";
import { AUTH_MESSAGES } from "../../../../constants/messages/auth.js";
import { IAuthEmailService } from "../interface/IAuthEmailService.js";
import { IEmailService } from "../../../email/interface/IEmailService.js";

@injectable()
export class AuthEmailService implements IAuthEmailService {
  constructor(
    @inject(TYPES.UserRepository) private userRepository: IUserRepository,
    @inject(TYPES.EmailService) private emailService: IEmailService,
    @inject(TYPES.Logger) private logger: Logger,
  ) {}

  //* change email
  async changeEmail(userId: string, newEmail: string): Promise<any> {
    const existingUser = await this.userRepository.findOne({ email: newEmail });

    if (existingUser) {
      this.logger.warn({
        event: VALIDATION_MESSAGES.USER_ALREADY_EXIST,
      });
      throw new ConflictError(VALIDATION_MESSAGES.USER_ALREADY_EXIST);
    }

    const token = generateToken();

    const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 min

    const user = await this.userRepository.findById(userId);

    if (!user) throw new Error("User not found");

    await this.userRepository.update(userId, {
      pendingEmail: newEmail,
      emailChangeToken: token,
      emailChangeTokenExpiry: expiry,
    });

    const baseUrl = process.env.FRONTEND_URL!;

    const resetLink = generateLink(baseUrl, "CHANGE_EMAIL", user.role, token);

    this.logger.info({
      EVENT: "Reset link created..",
      Link: resetLink,
    });

    try {
      await this.emailService.sendEmailChangeVerification(newEmail, resetLink);
      this.logger.info({ newEmail }, "Email change verification sent");
    } catch (err) {
      this.logger.error({ err }, "Failed to send reset email");
    }

    console.log("Verification link:", resetLink);

    return {
      success: true,
      message: "Verification email sent",
    };
  }
  //* verify email change
  async verifyEmailChange(token: string) {
    const user = await this.userRepository.findOne({
      emailChangeToken: token,
    });

    if (!user) {
      this.logger.warn({
        token,
        event: VALIDATION_MESSAGES.INVALIED_TOKEN,
      });

      throw new BadRequestError(VALIDATION_MESSAGES.INVALIED_TOKEN);
    }

    if (
      user.emailChangeTokenExpiry &&
      user.emailChangeTokenExpiry < new Date()
    ) {
      this.logger.warn({
        userId: user._id,
        event: VALIDATION_MESSAGES.EXPIRED_TOKEN,
      });

      throw new BadRequestError(VALIDATION_MESSAGES.EXPIRED_TOKEN);
    }

    if (!user.pendingEmail) {
      this.logger.error({
        userId: user._id,
        event: AUTH_MESSAGES.INVALIED_EMAIL_CHANGE,
      });

      throw new BadRequestError(AUTH_MESSAGES.INVALIED_EMAIL_CHANGE);
    }

    await this.userRepository.update(user._id?.toString(), {
      email: user.pendingEmail,
      pendingEmail: null,
      emailChangeToken: null,
      emailChangeTokenExpiry: null,
    });

    this.logger.info({
      userId: user._id,
      newEmail: user.pendingEmail,
      event: AUTH_MESSAGES.EMAIL_CHANGE_SUCCESS,
    });

    return {
      user: {
        userId: user._id,
        role: user.role,
      },
      message: AUTH_MESSAGES.EMAIL_CHANGE_SUCCESS,
    };
  }
}
