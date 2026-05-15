import { UserRole } from "../../../../constants/roles";
import { VerifyReqDto } from "../../../../dtos/v1/company/verifyReqDto";
import { ICompanyVerification } from "../../../../models/company.verification.model";

export interface ICompanyService {
  createVerifyRequest(
    userId: string,
    dto: VerifyReqDto,
    file: Express.Multer.File,
  ): Promise<ICompanyVerification>;
  getVerificationStatus(userId: string): Promise<Partial<ICompanyVerification>>;
  invite(
    name: string,
    email: string,
    role: UserRole,
    companyId: string,
  ): Promise<any>;
}
