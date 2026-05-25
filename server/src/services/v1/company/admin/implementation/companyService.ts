import { inject, injectable } from "inversify";
import { ICompanyService } from "../interface/ICompanyService";
import { TYPES } from "../../../../../dependency-injection/types";
import { ICompanyVerRepository } from "../../../../../repositories/company/interface/ICompanyVerRepository";
import { VerifyReqDto } from "../../../../../dtos/v1/company/admin/request-dtos/verifyReqDto";
import { ICloudinaryService } from "../../../../cloudinary/interface/ICloudinaryService";
import { NotFoundError } from "../../../../../errors/not-found.error";
import { VerificationStatus } from "../../../../../constants/companyStatus";
import mongoose from "mongoose";
import {
  ICompanyVerification,
  VerificationType,
} from "../../../../../models/company.verification.model";
import { Logger } from "pino";
import { BadRequestError } from "../../../../../errors/bad-request.error";
import { IUserRepository } from "../../../../../repositories/user/interfaces/IUserRepository";
import { ConflictError } from "../../../../../errors/conflict.error";
import { generateToken } from "../../../../../utils/token.util";
import bcrypt from "bcryptjs";
import { IInvitationRepository } from "../../../../../repositories/company/interface/IInvitationRepository";
import { UserRole } from "../../../../../constants/roles";
import { generateLink } from "../../../../../utils/generateLink";
import { IEmailService } from "../../../../email/interface/IEmailService";
import { InternalServerError } from "../../../../../errors/internal-server.error";
import { CompanyMapper } from "../../../../../mapper/company/admin/companyMapper";
import { USER_MESSAGES } from "../../../../../constants/messages/user";
import { ProfileResponseDto } from "../../../../../dtos/v1/company/admin/response-dto/companyProfileDto";
import { CompanyVerificationMapper } from "../../../../../mapper/company/admin/verificationMapper";

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
    @inject(TYPES.CompanyRepository)
    private companyRepository: ICompanyVerRepository,
    @inject(TYPES.EmailService) private emailService: IEmailService,
    @inject(TYPES.Logger) private logger: Logger,
  ) {}
  //* create verify request
  async createVerifyRequest(
    userId: string,
    dto: VerifyReqDto,
    files: {
      document?: Express.Multer.File[];
      profilePicture?: Express.Multer.File[];
    },
  ): Promise<ICompanyVerification> {
    const documentFile = files.document?.[0];
    const profileFile = files.profilePicture?.[0];

    if (!documentFile) {
      throw new NotFoundError("Document is required");
    }

    const documentUrl = await this.cloudinaryService.uploadFile(documentFile);

    let profilePictureUrl: string | null = null;

    if (profileFile) {
      profilePictureUrl = await this.cloudinaryService.uploadFile(profileFile);
    }

    const data = CompanyVerificationMapper.toVerificationEntity(
      dto,
      userId,
      documentUrl,
      profilePictureUrl,
    );

    const result = await this.companyVerRepository.create(data);

    if (!result) {
      this.logger.warn({
        event: "Failed to create verification request",
      });
      throw new InternalServerError("Failed to create verification request");
    }

    return result;
  }
  //* get verification status
  async getVerificationStatus(
    userId: string,
    type: VerificationType,
  ): Promise<Partial<ICompanyVerification>> {
    if (!userId) {
      this.logger.warn({
        event: "USERID_MISSING",
        userId,
      });

      throw new BadRequestError("userId missing");
    }

    if (!type) {
      this.logger.warn({
        event: "TYPE_MISSING",
        userId,
      });

      throw new BadRequestError("type missing");
    }

    const result = await this.companyVerRepository.findLatestVerificationReq(
      userId,
      type,
    );

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
    companyAdminId: string,
  ): Promise<any> {
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      this.logger.warn({
        event: "USER_ALREADY_EXISTS",
      });
      throw new ConflictError("User already exists");
    }

    const company = await this.companyRepository.findOne({
      adminId: companyAdminId,
    });

    if (!company) {
      this.logger.warn({
        event: "COMPANY_NOT_FOUND",
      });
      throw new NotFoundError("Company not found");
    }

    const token = generateToken();

    const hashedToken = await bcrypt.hash(token, 10);

    const result = await this.invitationRepository.create({
      name,
      email,
      companyId: company._id,
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
  //* get company profile
  async getCompanyProfile(companyAdminId: string): Promise<ProfileResponseDto> {
    if (!companyAdminId) {
      this.logger.error({
        level: "error",
        message: "Company admin ID is required",
        userId: companyAdminId,
      });
      throw new BadRequestError("Company admin ID is required");
    }

    this.logger.info({
      level: "info",
      message: "Fetching company profile",
      userId: companyAdminId,
    });

    const companyAdmin =
      await this.userRepository.findByIdWithCompany(companyAdminId);

    if (!companyAdmin) {
      this.logger.warn({
        level: "warn",
        message: USER_MESSAGES.USER_NOT_FOUND,
        userId: companyAdminId,
      });

      throw new NotFoundError(USER_MESSAGES.USER_NOT_FOUND);
    }

    if (!companyAdmin.company) {
      this.logger.warn({
        level: "info",
        message: "User has no company linked",
        userId: companyAdminId,
      });
    }
    const data = CompanyMapper.toProfileResponse(
      companyAdmin,
      companyAdmin?.company,
    );

    this.logger.info({
      level: "info",
      message: "Profile response created successfully",
      userId: companyAdminId,
      data: data,
    });

    return data;
  }
}
