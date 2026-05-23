import { UserRole } from "../../../../../constants/roles";
import { VerifyReqDto } from "../../../../../dtos/v1/company/admin/request-dtos/verifyReqDto";
import { ProfileResponseDto } from "../../../../../dtos/v1/company/admin/response-dto/companyProfileDto";
import {
  ICompanyVerification,
  VerificationType,
} from "../../../../../models/company.verification.model";

export interface ICompanyService {
  createVerifyRequest(
    userId: string,
    dto: VerifyReqDto,
    files: {
      document?: Express.Multer.File[];
      profilePicture?: Express.Multer.File[];
    },
  ): Promise<ICompanyVerification>;
  getVerificationStatus(
    userId: string,
    type: VerificationType,
  ): Promise<Partial<ICompanyVerification>>;
  invite(
    name: string,
    email: string,
    role: UserRole,
    companyAdminId: string,
  ): Promise<any>;
  getCompanyProfile(companyAdminId: string): Promise<ProfileResponseDto>;
}
