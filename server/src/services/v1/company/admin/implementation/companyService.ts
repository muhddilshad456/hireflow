import { inject, injectable } from "inversify";
import { ICompanyService } from "../interface/ICompanyService";
import { TYPES } from "../../../../../dependency-injection/types";
import { ICompanyVerRepository } from "../../../../../repositories/company/interface/ICompanyVerRepository";
import { VerifyReqDto } from "../../../../../dtos/v1/company/admin/request-dtos/verifyReqDto";
import { ICloudinaryService } from "../../../../cloudinary/interface/ICloudinaryService";
import { NotFoundError } from "../../../../../errors/not-found.error";
import { VerificationStatus } from "../../../../../constants/companyStatus";
import {
  ICompanyVerification,
  VerificationType,
} from "../../../../../models/company/company.verification.model";
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
import { ICompanyRepository } from "../../../../../repositories/company/interface/ICompanyRepository";
import { CompanyAdminDashboard } from "../../../../../interfaces/company/admin/dashboard";
import { IJobRepository } from "../../../../../repositories/job/interface/IJobRepository";
import { SubscriptionStatus } from "../../../../../models/company/subscription.model";
import { UnauthorizedError } from "../../../../../errors/unauthorized.error";
import { VALIDATION_MESSAGES } from "../../../../../constants/messages/validation";
import { DASHBOARD_MESSAGES } from "../../../../../constants/messages/dashboard/dashboard";
import { ForbiddenError } from "../../../../../errors/forbidden.error";
import { IDashboardRepository } from "../../../../../repositories/dashboard/interface/IDashboardRepository";
import {
  IInvitation,
  InvitationStatus,
} from "../../../../../models/recruiter.invitation.model";
import {
  GetAllCompanyMembersResult,
  GetAllInvitationsResult,
} from "../../../../../interfaces/company/admin/company";
import { INotificationService } from "../../../notification/interface/INotificationService";

@injectable()
export class CompanyService implements ICompanyService {
  constructor(
    @inject(TYPES.CompanyVerRepository)
    private _companyVerRepository: ICompanyVerRepository,
    @inject(TYPES.CloudinaryService)
    private _cloudinaryService: ICloudinaryService,
    @inject(TYPES.UserRepository) private _userRepository: IUserRepository,
    @inject(TYPES.InvitationRepository)
    private _invitationRepository: IInvitationRepository,
    @inject(TYPES.CompanyRepository)
    private _companyRepository: ICompanyRepository,
    @inject(TYPES.JobRepository)
    private _jobRepository: IJobRepository,
    @inject(TYPES.DashboardRepository)
    private _dashboardRepository: IDashboardRepository,
    @inject(TYPES.NotificationService)
    private _notificationService: INotificationService,
    @inject(TYPES.EmailService) private _emailService: IEmailService,
    @inject(TYPES.Logger) private _logger: Logger,
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

    const documentUrl = await this._cloudinaryService.uploadFile(
      documentFile,
      "company-documents",
    );

    let profilePictureUrl: string | null = null;

    if (profileFile) {
      profilePictureUrl = await this._cloudinaryService.uploadFile(
        profileFile,
        "company-profile-picture",
      );
    }

    const data = CompanyVerificationMapper.toVerificationEntity(
      dto,
      userId,
      documentUrl,
      profilePictureUrl,
    );

    const result = await this._companyVerRepository.create(data);

    if (!result) {
      this._logger.warn({
        event: "Failed to create verification request",
      });
      throw new InternalServerError("Failed to create verification request");
    }

    const admin = await this._userRepository.findOne({ role: "admin" });

    if (!admin) {
      this._logger.warn({
        event: USER_MESSAGES.USER_NOT_FOUND,
      });
      throw new InternalServerError(USER_MESSAGES.USER_NOT_FOUND);
    }

    await this._notificationService.notify(admin?._id.toString(), {
      type: "VERIFICATION REQUEST",
      title: "New Verification Request",
      message: `${dto.verificationType} Verification request.`,
      link: `/companies-verify-requests`,
    });

    return result;
  }
  //* get verification status
  async getVerificationStatus(
    userId: string,
    type: VerificationType,
  ): Promise<Partial<ICompanyVerification>> {
    if (!userId) {
      this._logger.warn({
        event: "USERID_MISSING",
        userId,
      });

      throw new BadRequestError("userId missing");
    }

    if (!type) {
      this._logger.warn({
        event: "TYPE_MISSING",
        userId,
      });

      throw new BadRequestError("type missing");
    }

    const result = await this._companyVerRepository.findLatestVerificationReq(
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
    const existingUser = await this._userRepository.findByEmail(email);
    if (existingUser) {
      this._logger.warn({
        event: "USER_ALREADY_EXISTS",
      });
      throw new ConflictError("User already exists");
    }

    const company = await this._companyRepository.findOne({
      adminId: companyAdminId,
    });

    if (!company) {
      this._logger.warn({
        event: "COMPANY_NOT_FOUND",
      });
      throw new NotFoundError("Company not found");
    }

    const token = generateToken();

    const hashedToken = await bcrypt.hash(token, 10);

    const result = await this._invitationRepository.create({
      name,
      email,
      companyId: company._id,
      role,
      token: hashedToken,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });

    if (!result) {
      this._logger.warn({
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

    this._logger.info({
      EVENT: "Invitation link created..",
      Link: inviteLink,
    });

    try {
      await this._emailService.sendInviteEmail(email, inviteLink, role);
      this._logger.info({ email }, "Invite email sent");
    } catch (err) {
      this._logger.error({ err }, "Failed to send invite email");
    }
  }
  //* get company profile
  async getCompanyProfile(companyAdminId: string): Promise<ProfileResponseDto> {
    if (!companyAdminId) {
      this._logger.error({
        level: "error",
        message: "Company admin ID is required",
        userId: companyAdminId,
      });
      throw new BadRequestError("Company admin ID is required");
    }

    this._logger.info({
      level: "info",
      message: "Fetching company profile",
      userId: companyAdminId,
    });

    const companyAdmin =
      await this._userRepository.findByIdWithCompany(companyAdminId);

    if (!companyAdmin) {
      this._logger.warn({
        level: "warn",
        message: USER_MESSAGES.USER_NOT_FOUND,
        userId: companyAdminId,
      });

      throw new NotFoundError(USER_MESSAGES.USER_NOT_FOUND);
    }

    if (!companyAdmin.company) {
      this._logger.warn({
        level: "info",
        message: "User has no company linked",
        userId: companyAdminId,
      });
    }
    const data = CompanyMapper.toProfileResponse(
      companyAdmin,
      companyAdmin?.company,
    );

    this._logger.info({
      level: "info",
      message: "Profile response created successfully",
      userId: companyAdminId,
      data: data,
    });

    return data;
  }
  //* get dashboard details
  async getDashboard(userId: string): Promise<CompanyAdminDashboard> {
    const companyId = await this.getAdminCompanyId(userId);

    // Every job of the company, newest first
    const jobs = await this._dashboardRepository.getJobs(companyId);
    const jobIds = jobs.map((j) => j._id);
    const latest = jobs.slice(0, 5);

    const [
      byStatus,
      applicantCounts,
      recruiters,
      interviewers,
      subscriptionRecord,
    ] = await Promise.all([
      this._dashboardRepository.getApplicationsByStatus(jobIds),
      this._dashboardRepository.countApplicantsPerJob(latest.map((j) => j._id)),
      // ⚠️ use your real role values
      this._dashboardRepository.countTeamMembers(
        companyId,
        UserRole.COMPANY_RECRUITER,
      ),
      this._dashboardRepository.countTeamMembers(
        companyId,
        UserRole.COMPANY_INTERVIEWER,
      ),
      this._dashboardRepository.getSubscriptionByCompanyId(companyId),
    ]);

    const totalApplications = byStatus.reduce((sum, r) => sum + r.count, 0);
    const selected = byStatus.find((r) => r.status === "SELECTED")?.count ?? 0;

    // Active only if marked ACTIVE AND the end date hasn't passed
    // (the stored status can lag behind until something marks it EXPIRED)
    const now = new Date();
    const endDate = subscriptionRecord?.endDate ?? null;
    const isSubscriptionActive =
      subscriptionRecord?.status === SubscriptionStatus.ACTIVE &&
      !!endDate &&
      endDate > now;
    const daysRemaining =
      isSubscriptionActive && endDate
        ? Math.ceil((endDate.getTime() - now.getTime()) / 86_400_000)
        : 0;

    return {
      stats: {
        openJobs: jobs.filter((j) => j.status === "OPEN").length,
        totalJobs: jobs.length,
        totalApplications,
        selected,
        recruiters,
        interviewers,
      },
      subscription: {
        isActive: isSubscriptionActive,
        endDate: endDate ? endDate.toISOString() : null,
        daysRemaining,
      },
      applicationsByStatus: byStatus,
      latestJobs: latest.map((j) => ({
        _id: j._id.toString(),
        title: j.title,
        status: j.status,
        applicantsCount: applicantCounts.get(j._id.toString()) ?? 0,
        createdAt: j.createdAt.toISOString(),
      })),
    };
  }

  /** Same rule as the subscription APIs: the caller must be their company's admin */
  private async getAdminCompanyId(userId: string): Promise<string> {
    if (!userId) {
      throw new UnauthorizedError(VALIDATION_MESSAGES.USER_ID_REQUIRED);
    }

    const user = await this._userRepository.findById(userId);
    if (!user) throw new NotFoundError(DASHBOARD_MESSAGES.USER_NOT_FOUND);
    if (user.isBlocked)
      throw new ForbiddenError(DASHBOARD_MESSAGES.USER_BLOCKED);
    if (!user.company) throw new BadRequestError(DASHBOARD_MESSAGES.NO_COMPANY);

    const company = await this._companyRepository.findById(
      user.company.toString(),
    );
    if (!company) throw new NotFoundError(DASHBOARD_MESSAGES.COMPANY_NOT_FOUND);

    if (company.adminId.toString() !== userId.toString()) {
      throw new ForbiddenError(DASHBOARD_MESSAGES.NOT_COMPANY_ADMIN);
    }

    return company._id.toString();
  }
  //* get all invitations
  async getAllInvitations(
    page: number,
    limit: number,
    search: string,
    status: string,
    role: UserRole,
    userId: string,
  ): Promise<GetAllInvitationsResult> {
    if (!userId) {
      this._logger.error({
        level: "error",
        message: "User ID is required",
        userId,
      });

      throw new BadRequestError("User ID is required");
    }

    this._logger.info({
      level: "info",
      message: "Fetching company invitations",
      userId,
      page,
      limit,
      search,
      status,
      role,
    });

    const companyAdmin = await this._userRepository.findById(userId);

    if (!companyAdmin) {
      throw new NotFoundError(USER_MESSAGES.USER_NOT_FOUND);
    }

    if (!companyAdmin.company) {
      throw new BadRequestError("User has no company linked");
    }

    const result = await this._invitationRepository.getAllInvitations(
      page,
      limit,
      search,
      status,
      role,
      companyAdmin?.company?.toString(),
    );

    this._logger.info({
      level: "info",
      message: "Company invitations fetched successfully",
      userId,
      totalInvitations: result.totalInvitations,
    });

    return result;
  }
  //* get all recruiters
  async getRecruiters(
    page: number,
    limit: number,
    search: string,
    status: string,
    userId: string,
  ): Promise<GetAllCompanyMembersResult> {
    this._logger.info({
      level: "info",
      message: "Fetching company recruiters",
      userId,
      page,
      limit,
      search,
      status,
    });

    const companyAdmin = await this._userRepository.findById(userId);

    if (!companyAdmin) {
      throw new NotFoundError(USER_MESSAGES.USER_NOT_FOUND);
    }

    if (!companyAdmin.company) {
      throw new BadRequestError("User has no company linked");
    }

    const result = await this._userRepository.getAllCompanyMembers(
      page,
      limit,
      search,
      status,
      UserRole.COMPANY_RECRUITER,
      companyAdmin?.company?.toString(),
    );

    this._logger.info({
      level: "info",
      message: "Company recruiters fetched successfully",
      userId,
      totalRecruiters: result.totalCount,
    });

    return result;
  }
  //* get interviewers
  async getInterviewers(
    page: number,
    limit: number,
    search: string,
    status: string,
    userId: string,
  ): Promise<GetAllCompanyMembersResult> {
    this._logger.info({
      level: "info",
      message: "Fetching company interviewers",
      userId,
      page,
      limit,
      search,
      status,
    });

    const companyAdmin = await this._userRepository.findById(userId);

    if (!companyAdmin) {
      throw new NotFoundError(USER_MESSAGES.USER_NOT_FOUND);
    }

    const companyId = companyAdmin?.company;

    if (!companyId) {
      throw new BadRequestError("User has no company linked");
    }

    const result = await this._userRepository.getAllCompanyMembers(
      page,
      limit,
      search,
      status,
      UserRole.COMPANY_INTERVIEWER,
      companyId?.toString(),
    );

    this._logger.info({
      level: "info",
      message: "Company interviewers fetched successfully",
      userId,
      totalInterviewers: result.totalCount,
    });

    return result;
  }
  //* cancel invitation
  async cancelInvitation(
    invitationId: string,
    userId: string,
  ): Promise<IInvitation> {
    if (!userId || !invitationId) {
      this._logger.error({
        level: "error",
        message: "User ID and invitation ID are required",
        userId,
        invitationId,
      });

      throw new BadRequestError("User ID and invitation ID are required");
    }

    this._logger.info({
      level: "info",
      message: "Cancelling invitation",
      userId,
      invitationId,
    });

    const companyAdmin = await this._userRepository.findByIdWithCompany(userId);

    if (!companyAdmin) {
      throw new NotFoundError(USER_MESSAGES.USER_NOT_FOUND);
    }

    if (!companyAdmin.company) {
      throw new BadRequestError("User has no company linked");
    }

    const invitation = await this._invitationRepository.findOneAndUpdate(
      { _id: invitationId, companyId: companyAdmin.company._id.toString() },
      { status: InvitationStatus.CANCELLED },
    );

    if (!invitation) {
      this._logger.warn({
        level: "warn",
        message:
          "Invitation not found, does not belong to the company, or cannot be cancelled",
        userId,
        invitationId,
      });

      throw new BadRequestError("Invitation not found or cannot be cancelled");
    }

    this._logger.info({
      level: "info",
      message: "Invitation cancelled successfully",
      userId,
      invitationId,
    });

    return invitation;
  }
}
