import { inject } from "inversify";
import {
  GetAllCompanyVerificationReqResponse,
  IAdminService,
} from "../interface/IAdminService";
import { GetAllCompaniesResult } from "../../../../repositories/user/interfaces/IUserRepository.js";
import { ICompany } from "../../../../models/company/company.model";
import { IUserWithCompany } from "../../../../types/userWithCompany";
import { TYPES } from "../../../../dependency-injection/types";
import { ICompanyVerRepository } from "../../../../repositories/company/interface/ICompanyVerRepository";
import {
  ICompanyVerification,
  VerificationType,
} from "../../../../models/company/company.verification.model";
import { Logger } from "pino";
import { BadRequestError } from "../../../../errors/bad-request.error";
import { NotFoundError } from "../../../../errors/not-found.error";
import { VerificationStatus } from "../../../../constants/companyStatus";
import { ICompanyRepository } from "../../../../repositories/company/interface/ICompanyRepository";
import { ConflictError } from "../../../../errors/conflict.error";
import { CompanyMapper } from "../../../../mapper/company/admin/companyMapper";
import { IUserRepository } from "../../../../repositories/user/interfaces/IUserRepository";
import { InternalServerError } from "../../../../errors/internal-server.error";
import { VALIDATION_MESSAGES } from "../../../../constants/messages/validation";
import { USER_MESSAGES } from "../../../../constants/messages/user";
import {
  AdminDashboard,
  AdminProfileResponse,
} from "../../../../interfaces/admin/admin";
import { INotificationService } from "../../notification/interface/INotificationService";
import { IDashboardRepository } from "../../../../repositories/dashboard/interface/IDashboardRepository";

export class AdminService implements IAdminService {
  constructor(
    @inject(TYPES.CompanyVerRepository)
    private _companyVerRepository: ICompanyVerRepository,
    @inject(TYPES.CompanyRepository)
    private _companyRepository: ICompanyRepository,
    @inject(TYPES.UserRepository)
    private _userRepository: IUserRepository,
    @inject(TYPES.NotificationService)
    private _notificationService: INotificationService,
    @inject(TYPES.DashboardRepository)
    private _dashboardRepository: IDashboardRepository,
    @inject(TYPES.Logger)
    private _logger: Logger,
  ) {}
  //* get all company verification requests
  async getAllCompanyVerificationReq(
    page: number,
    limit: number,
    search: string,
    status: string,
    type: VerificationType,
  ): Promise<GetAllCompanyVerificationReqResponse> {
    const { verificationRequests, totalVerificationRequests } =
      await this._companyVerRepository.getAllVerificationReq(
        page,
        limit,
        search,
        status,
        type,
      );

    if (!type) {
      this._logger.warn({
        event: VALIDATION_MESSAGES.TYPE_REQUIRED,
      });
      throw new BadRequestError(VALIDATION_MESSAGES.TYPE_REQUIRED);
    }

    if (type != VerificationType.NEW && type != VerificationType.UPDATE) {
      this._logger.warn({
        event: VALIDATION_MESSAGES.INVALID_TYPE,
      });
      throw new BadRequestError(VALIDATION_MESSAGES.INVALID_TYPE);
    }

    const totalPages = Math.ceil(totalVerificationRequests / limit);

    const formattedVerificationRequests = verificationRequests.map(
      (verReq: ICompanyVerification) => ({
        id: verReq._id?.toString(),
        name: verReq.companyName,
        email: verReq.email,
        status: verReq.status,
      }),
    );

    return {
      verificationRequests: formattedVerificationRequests,
      totalVerificationRequests,
      totalPages,
      currentPage: page,
    };
  }
  //* get verification req
  async getCompanyVerificationReq(
    companyVerificationId: string,
  ): Promise<ICompanyVerification> {
    if (!companyVerificationId) {
      this._logger.warn({
        event: VALIDATION_MESSAGES.ID_REQUIRED,
      });
      throw new BadRequestError(VALIDATION_MESSAGES.ID_REQUIRED);
    }
    const result = await this._companyVerRepository.findById(
      companyVerificationId,
    );
    if (!result) {
      this._logger.warn({
        event: "VERIFICATION_REQ_NOT_FOUND",
      });
      throw new NotFoundError("verification request not found");
    }
    return result;
  }
  //* approve company
  async approveCompany(companyVerificationId: string): Promise<ICompany> {
    const request = await this._companyVerRepository.findById(
      companyVerificationId,
    );

    if (!request) {
      this._logger.warn({
        event: "VERIFICATION_REQ_NOT_FOUND",
      });
      throw new NotFoundError("verification request not found");
    }

    if (request.status !== VerificationStatus.PENDING) {
      this._logger.warn({
        event: "REQUEST_ALREADY_PROCESSED",
      });
      throw new ConflictError("Request already processed");
    }

    const companyData = CompanyMapper.toCompanyEntity(request);

    let company;

    if (request.verificationType == VerificationType.NEW) {
      company = await this._companyRepository.create(companyData);
    } else if (request.verificationType == VerificationType.UPDATE) {
      if (!request.adminId) {
        this._logger.warn({
          event: "adminId missing for update",
          companyId: request.adminId,
        });
        throw new BadRequestError("adminId missing for update");
      }
      const existingCompany = await this._companyRepository.findOne({
        adminId: request.adminId,
      });

      if (!existingCompany) {
        this._logger.warn({
          event: "Company not found for update",
          companyId: request.companyId,
        });
        throw new NotFoundError("Company not found for update");
      }
      company = await this._companyRepository.update(
        existingCompany._id.toString(),
        companyData,
      );
    }

    if (!company) {
      this._logger.error({
        event: "Failed to process company",
      });

      throw new InternalServerError("Failed to process company");
    }

    await this._userRepository.update(request.adminId.toString(), {
      company: company._id,
    });

    await this._companyVerRepository.update(companyVerificationId, {
      companyId: company._id,
      status: VerificationStatus.APPROVED,
    });

    await this._notificationService.notify(company?.adminId?.toString(), {
      type: "COMPANY APPROVAL",
      title: "Verification Approved.",
      message: "Your verificaitn request approved.",
      link: `/dashboard`,
    });

    return company;
  }
  //* reject company
  async rejectCompany(
    companyVerificationId: string,
    reason: string,
  ): Promise<void> {
    if (!companyVerificationId) {
      this._logger.warn({
        event: "COMPANY_VERIFICATION_ID_REQUIRED",
      });
      throw new BadRequestError("companyVerificationId is required");
    }

    if (!reason || reason.trim() === "") {
      this._logger.warn({
        event: "REASON_REQUIRED",
      });
      throw new BadRequestError("Rejection reason is required");
    }

    const request = await this._companyVerRepository.findById(
      companyVerificationId,
    );

    if (!request) {
      this._logger.warn({
        event: "COMPANY_VERIFICATION_REQ_NOT_FOUND",
      });
      throw new NotFoundError("Verification request not found");
    }

    if (request.status !== VerificationStatus.PENDING) {
      this._logger.warn({
        event: "REQUEST_ALREADY_PROCESSED",
      });
      throw new ConflictError("Request already processed");
    }

    const data = {
      status: VerificationStatus.REJECTED,
      adminNote: reason,
    };

    await this._companyVerRepository.update(companyVerificationId, data);

    await this._notificationService.notify(request?.adminId?.toString(), {
      type: "COMPANY REJECTION",
      title: "Verification rejected.",
      message: "Your verificaitn request rejected.",
      link: `/dashboard`,
    });

    this._logger.info({
      event: "COMPANY_VERIFICATION_REJECTED",
      companyVerificationId,
    });
  }
  //* get all companies
  async getAllCompanies(
    page: number,
    limit: number,
    search: string,
    status: string,
  ): Promise<{ result: GetAllCompaniesResult }> {
    const result = await this._userRepository.getAllCompanies(
      page,
      limit,
      search,
      status,
    );
    return { result };
  }
  //* get a company details
  async getCompanyDetails(id: string): Promise<IUserWithCompany | null> {
    const result = await this._userRepository.findByIdWithCompany(id);
    return result;
  }
  //* get profile
  async getAdminProfile(userId: string): Promise<AdminProfileResponse> {
    const user = await this._userRepository.findByIdWithCompany(userId);

    if (!user) {
      this._logger.warn({
        event: USER_MESSAGES.USER_NOT_FOUND,
        userId,
      });
      throw new NotFoundError(USER_MESSAGES.USER_NOT_FOUND);
    }

    return {
      userId: user._id.toString(),
      name: user.name,
      email: user.email,
      profilePicture: user.profilePicture ?? null,
    };
  }
  //* get dashboard
  async getDashboard(): Promise<AdminDashboard> {
    const [stats, pending] = await Promise.all([
      this._dashboardRepository.getPlatformCounts(new Date()),
      this._dashboardRepository.getPendingVerifications(5),
    ]);

    return {
      stats,
      pendingVerificationRequests: pending.map((r) => ({
        _id: r._id,
        companyName: r.companyName,
        verificationType: r.verificationType,
        email: r.email,
        createdAt: r.createdAt.toISOString(),
      })),
    };
  }
}
