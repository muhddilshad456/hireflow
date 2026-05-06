import { inject, injectable } from "inversify";
import { ICompanyService } from "../interface/ICompanyService";
import { TYPES } from "../../../../dependency-injection/types";
import { ICompanyRepository } from "../../../../repositories/company/interface/ICompanyRepository";
import { VerifyReqDto } from "../../../../dtos/v1/company/verifyReqDto";
import { ICloudinaryService } from "../../../cloudinary/interface/ICloudinaryService";
import { NotFoundError } from "../../../../errors/not-found.error";
import { VerificationStatus } from "../../../../constants/companyStatus";
import mongoose from "mongoose";
import { ICompanyVerification } from "../../../../models/company.verification.model";

@injectable()
export class CompanyService implements ICompanyService {
  constructor(
    @inject(TYPES.CompanyRepository)
    private companyRepository: ICompanyRepository,
    @inject(TYPES.CloudinaryService)
    private cloudinaryService: ICloudinaryService,
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

    const result = await this.companyRepository.create(data);

    return result;
  }
}
