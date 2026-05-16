import { inject, injectable } from "inversify";
import { ICompanyService } from "../interface/ICompanyService";
import { TYPES } from "../../../../dependency-injection/types";
import { ICompanyVerRepository } from "../../../../repositories/company/interface/ICompanyVerRepository";
import { VerifyReqDto } from "../../../../dtos/v1/company/verifyReqDto";
import { ICloudinaryService } from "../../../cloudinary/interface/ICloudinaryService";
import { NotFoundError } from "../../../../errors/not-found.error";
import { VerificationStatus } from "../../../../constants/companyStatus";
import mongoose from "mongoose";
import { ICompanyVerification } from "../../../../models/company.verification.model";
import { Logger } from "pino";
import { BadRequestError } from "../../../../errors/bad-request.error";
import { IUserRepository } from "../../../../repositories/user/interfaces/IUserRepository";
import { ConflictError } from "../../../../errors/conflict.error";
import { generateToken } from "../../../../utils/token.util";
import bcrypt from "bcryptjs";
import { IInvitationRepository } from "../../../../repositories/company/interface/IInvitationRepository";
import { UserRole } from "../../../../constants/roles";
import { generateLink } from "../../../../utils/generateLink";
import { IEmailService } from "../../../email/interface/IEmailService";
import { InternalServerError } from "../../../../errors/internal-server.error";

@injectable()
export class CompanyService implements ICompanyService {
  constructor(
    @inject(TYPES.CompanyVerRepository)
    private companyVerRepository: ICompanyVerRepository,
    @inject(TYPES.CloudinaryService)
    private cloudinaryService: ICloudinaryService,
    @inject(TYPES.UserRepository) private userRepository: IUserRepository,
    @inject(TYPES.InvitationRepository)
    private invitationRepository: IInvitationRepository,
    @inject(TYPES.EmailService) private emailService: IEmailService,
    @inject(TYPES.Logger) private logger: Logger,
  ) {}

  async createVerifyRequest(
    userId: string,
    dto: VerifyReqDto,
    file: Express.Multer.File,
  ): Promise<ICompanyVerification> {
    if (!file) throw new NotFoundError("Document is required");

    const documentUrl = await this.cloudinaryService.uploadFile(file);

    const userObjectId = new mongoose.Types.ObjectId(userId);

    const data = {
      userId: userObjectId,
      ...dto,
      document: documentUrl,
      status: VerificationStatus.PENDING,
    };

    const result = await this.companyVerRepository.create(data);

    return result;
  }

  async getVerificationStatus(
    userId: string,
  ): Promise<Partial<ICompanyVerification>> {
    if (!userId) {
      this.logger.warn({
        event: "USERID_MISSING",
        userId,
      });

      throw new BadRequestError("userId missing");
    }

    const result =
      await this.companyVerRepository.findLatestVerificationReq(userId);

    if (!result) {
      return {
        status: VerificationStatus.NOT_SUBMITTED,
      };
    }

    return {
      status: result.status,
      adminNote: result.adminNote,
    };
  }
  //* Invitation
  async invite(
    name: string,
    email: string,
    role: UserRole,
    companyId: string,
  ): Promise<any> {
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      this.logger.warn({
        event: "USER_ALREADY_EXISTS",
      });
      throw new ConflictError("User already exists");
    }

    const token = generateToken();

    const hashedToken = await bcrypt.hash(token, 10);

    console.log(
      `name : ${name} , email : ${email} ,role : ${role} , companyId : ${companyId}`,
    );

    const result = await this.invitationRepository.create({
      name,
      email,
      companyId: new mongoose.Types.ObjectId(companyId),
      role,
      token: hashedToken,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });

    if (!result) {
      this.logger.warn({
        event: "RESULT_MISSING",
      });
      throw new InternalServerError("Failed to create invitation");
    }

    const baseUrl = process.env.FRONTEND_URL!;

    const inviteLink = generateLink(
      baseUrl,
      "INVITE",
      role,
      token,
      result._id.toString(),
    );

    this.logger.info({
      EVENT: "Invitation link created..",
      Link: inviteLink,
    });

    try {
      await this.emailService.sendInviteEmail(email, inviteLink, role);
      this.logger.info({ email }, "Invite email sent");
    } catch (err) {
      this.logger.error({ err }, "Failed to send invite email");
    }
  }
}
