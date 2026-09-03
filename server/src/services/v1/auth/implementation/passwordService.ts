import bcrypt from "bcryptjs";
import type { Logger } from "pino";
import { IUserRepository } from "../../../../repositories/user/interfaces/IUserRepository.js";
import { BadRequestError } from "../../../../errors/bad-request.error.js";
import { IEmailService } from "../../../email/interface/IEmailService.js";
import { UnauthorizedError } from "../../../../errors/unauthorized.error.js";
import { inject, injectable } from "inversify";
import { TYPES } from "../../../../dependency-injection/types.js";
import { ResetPasswordDto } from "../../../../dtos/v1/auth/reset-password.dto.js";
import { generateLink } from "../../../../utils/generateLink.js";
import { generateToken } from "../../../../utils/token.util.js";
import { VALIDATION_MESSAGES } from "../../../../constants/messages/validation.js";
import { IPasswordService } from "../interface/IPasswordService.js";

@injectable()
export class PasswordService implements IPasswordService {
  constructor(
    @inject(TYPES.UserRepository) private userRepository: IUserRepository,
    @inject(TYPES.EmailService)
    private emailService: IEmailService,
    @inject(TYPES.Logger) private logger: Logger,
  ) {}

  // * forgot password
  async forgotPassword(email: string): Promise<void> {
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      this.logger.warn({ email }, "Forgot password: user not found");
      return;
    }

    this.logger.info({ email }, "Processing forgot password");

    const resetToken = generateToken();

    const expiry = new Date(Date.now() + 15 * 60 * 1000);

    await this.userRepository.update(user._id.toString(), {
      emailLinkToken: resetToken,
      emailLinkTokenExpiry: expiry,
    });

    const baseUrl = process.env.FRONTEND_URL!;

    const resetLink = generateLink(
      baseUrl,
      "RESET_PASSWORD",
      user.role,
      resetToken,
    );

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

  //* change password
  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<any> {
    console.log("userId : ", userId);
    console.log(currentPassword, newPassword);
    if (!userId) {
      this.logger.warn({
        event: VALIDATION_MESSAGES.ID_REQUIRED,
      });
      throw new UnauthorizedError(VALIDATION_MESSAGES.ID_REQUIRED);
    }

    const user = await this.userRepository.findById(userId);

    if (!user || !(await bcrypt.compare(currentPassword, user.password))) {
      this.logger.warn({
        event: VALIDATION_MESSAGES.INVALID_CURRENT_PASSWORD,
      });
      throw new BadRequestError(VALIDATION_MESSAGES.INVALID_CURRENT_PASSWORD);
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await this.userRepository.update(userId, { password: hashedPassword });
  }
}
