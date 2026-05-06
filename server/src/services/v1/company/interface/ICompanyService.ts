import { VerifyReqDto } from "../../../../dtos/v1/company/verifyReqDto";
import { ICompanyVerification } from "../../../../models/company.verification.model";

export interface ICompanyService {
  createVerifyRequest(
    userId: string,
    dto: VerifyReqDto,
    file: Express.Multer.File,
  ): Promise<ICompanyVerification>;
}
