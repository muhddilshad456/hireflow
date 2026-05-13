import { inject } from "inversify";
import { IAdminService } from "../interface/IAdminService";
import { TYPES } from "../../../../dependency-injection/types";
import { ICompanyVerRepository } from "../../../../repositories/company/interface/ICompanyVerRepository";
import { ICompanyVerification } from "../../../../models/company.verification.model";
import { Logger } from "pino";
import { BadRequestError } from "../../../../errors/bad-request.error";
import { NotFoundError } from "../../../../errors/not-found.error";
import { VerificationStatus } from "../../../../constants/companyStatus";
import { ICompanyRepository } from "../../../../repositories/company/interface/ICompanyRepository";
import { ConflictError } from "../../../../errors/conflict.error";

export class AdminService implements IAdminService {
  constructor(
    @inject(TYPES.CompanyVerRepository)
    private companyVerRepository: ICompanyVerRepository,
    @inject(TYPES.CompanyRepository)
    private companyRepository: ICompanyRepository,
    @inject(TYPES.Logger)
    private logger: Logger,
  ) {}
  async getAllCompanyVerificationReq(
    page: number,
    limit: number,
    search: string,
    status: string,
  ): Promise<any> {
    const { verificationRequests, totalVerificationRequests } =
      await this.companyVerRepository.getAllVerificationReq(
        page,
        limit,
        search,
        status,
      );

    console.log("status : ", status);

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
  async getCompanyVerificationReq(companyVerificationId: string): Promise<any> {
    if (!companyVerificationId) {
      this.logger.warn({
        event: "VERIFICATION_ID_NOT_FOUND",
      });
      throw new BadRequestError("companyVerificationId not found");
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

    const existingCompany = await this.companyRepository.findOne({
      userId: request.userId,
    });

    if (existingCompany) {
      this.logger.warn({
        event: "COMPANY_ALREADY_VERIFIED",
      });
      throw new ConflictError("Company already verified");
    }

    const companyData = {
      userId: request.userId,
      companyName: request.companyName,
      regNumber: request.regNumber,
      email: request.email,
      phone: request.phone,
      website: request.website,
      description: request.description,
      address: request.address,
      country: request.country,
      state: request.state,
      city: request.city,
      zip: request.zip,
      document: request.document,
    };

    const company = await this.companyRepository.create(companyData);

    await this.companyVerRepository.update(companyVerificationId, {
      status: VerificationStatus.APPROVED,
    });
    return company;
  }
}
