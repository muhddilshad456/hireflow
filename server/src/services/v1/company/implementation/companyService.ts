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

@injectable()
export class CompanyService implements ICompanyService {
  constructor(
    @inject(TYPES.CompanyVerRepository)
    private companyVerRepository: ICompanyVerRepository,
    @inject(TYPES.CloudinaryService)
    private cloudinaryService: ICloudinaryService,
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
}
