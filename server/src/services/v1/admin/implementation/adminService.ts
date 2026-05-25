import { inject } from "inversify";
import { IAdminService } from "../interface/IAdminService";
import { TYPES } from "../../../../dependency-injection/types";
import { ICompanyVerRepository } from "../../../../repositories/company/interface/ICompanyVerRepository";
import {
  ICompanyVerification,
  VerificationType,
} from "../../../../models/company.verification.model";
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

export class AdminService implements IAdminService {
  constructor(
    @inject(TYPES.CompanyVerRepository)
    private companyVerRepository: ICompanyVerRepository,
    @inject(TYPES.CompanyRepository)
    private companyRepository: ICompanyRepository,
    @inject(TYPES.UserRepository)
    private userRepository: IUserRepository,
    @inject(TYPES.Logger)
    private logger: Logger,
  ) {}
  //* get all company verification requests
  async getAllCompanyVerificationReq(
    page: number,
    limit: number,
    search: string,
    status: string,
    type: VerificationType,
  ): Promise<any> {
    const { verificationRequests, totalVerificationRequests } =
      await this.companyVerRepository.getAllVerificationReq(
        page,
        limit,
        search,
        status,
        type,
      );

    if (!type) {
      this.logger.warn({
        event: VALIDATION_MESSAGES.TYPE_REQUIRED,
      });
      throw new BadRequestError(VALIDATION_MESSAGES.TYPE_REQUIRED);
    }

    if (type != VerificationType.NEW && type != VerificationType.UPDATE) {
      this.logger.warn({
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
  async getCompanyVerificationReq(companyVerificationId: string): Promise<any> {
    if (!companyVerificationId) {
      this.logger.warn({
        event: VALIDATION_MESSAGES.ID_REQUIRED,
      });
      throw new BadRequestError(VALIDATION_MESSAGES.ID_REQUIRED);
    }
    const result = await this.companyVerRepository.findById(
      companyVerificationId,
    );
    if (!result) {
      this.logger.warn({
        event: "VERIFICATION_REQ_NOT_FOUND",
      });
      throw new NotFoundError("verification request not found");
    }
    return result;
  }
  //* approve company
  async approveCompany(companyVerificationId: string): Promise<any> {
    const request = await this.companyVerRepository.findById(
      companyVerificationId,
    );

    if (!request) {
      this.logger.warn({
        event: "VERIFICATION_REQ_NOT_FOUND",
      });
      throw new NotFoundError("verification request not found");
    }

    if (request.status !== VerificationStatus.PENDING) {
      this.logger.warn({
        event: "REQUEST_ALREADY_PROCESSED",
      });
      throw new ConflictError("Request already processed");
    }

    const companyData = CompanyMapper.toCompanyEntity(request);

    let company;

    if (request.verificationType == VerificationType.NEW) {
      company = await this.companyRepository.create(companyData);
    } else if (request.verificationType == VerificationType.UPDATE) {
      if (!request.adminId) {
        this.logger.warn({
          event: "adminId missing for update",
          companyId: request.adminId,
        });
        throw new BadRequestError("adminId missing for update");
      }
      const existingCompany = await this.companyRepository.findOne({
        adminId: request.adminId,
      });

      if (!existingCompany) {
        this.logger.warn({
          event: "Company not found for update",
          companyId: request.companyId,
        });
        throw new NotFoundError("Company not found for update");
      }
      company = await this.companyRepository.update(
        existingCompany._id.toString(),
        companyData,
      );
    }

    if (!company) {
      this.logger.error({
        event: "Failed to process company",
      });

      throw new InternalServerError("Failed to process company");
    }

    await this.userRepository.update(request.adminId.toString(), {
      company: company._id,
    });

    await this.companyVerRepository.update(companyVerificationId, {
      companyId: company._id,
      status: VerificationStatus.APPROVED,
    });
    return company;
  }
  //* reject company
  async rejectCompany(
    companyVerificationId: string,
    reason: string,
  ): Promise<any> {
    if (!companyVerificationId) {
      this.logger.warn({
        event: "COMPANY_VERIFICATION_ID_REQUIRED",
      });
      throw new BadRequestError("companyVerificationId is required");
    }

    if (!reason || reason.trim() === "") {
      this.logger.warn({
        event: "REASON_REQUIRED",
      });
      throw new BadRequestError("Rejection reason is required");
    }

    const request = await this.companyVerRepository.findById(
      companyVerificationId,
    );

    if (!request) {
      this.logger.warn({
        event: "COMPANY_VERIFICATION_REQ_NOT_FOUND",
      });
      throw new NotFoundError("Verification request not found");
    }

    if (request.status !== VerificationStatus.PENDING) {
      this.logger.warn({
        event: "REQUEST_ALREADY_PROCESSED",
      });
      throw new ConflictError("Request already processed");
    }

    const data = {
      status: VerificationStatus.REJECTED,
      adminNote: reason,
    };

    await this.companyVerRepository.update(companyVerificationId, data);

    this.logger.info({
      event: "COMPANY_VERIFICATION_REJECTED",
      companyVerificationId,
    });
  }

  async getAllCompanies(): Promise<any> {
    const result = await this.companyRepository.findAll();
    return { result };
  }
}
