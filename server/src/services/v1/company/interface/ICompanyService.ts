import { VerifyReqDto } from "../../../../dtos/v1/company/verifyReqDto";

export interface ICompanyService {
  createVerifyRequest(
    userId: string,
    dto: VerifyReqDto,
    file: Express.Multer.File,
  ): Promise<any>;
}
