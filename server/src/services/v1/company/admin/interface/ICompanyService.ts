import { UserRole } from "../../../../../constants/roles";
import { VerifyReqDto } from "../../../../../dtos/v1/company/admin/request-dtos/verifyReqDto";
import { ProfileResponseDto } from "../../../../../dtos/v1/company/admin/response-dto/companyProfileDto";
import {
  GetAllCompanyMembersResult,
  GetAllInvitationsResult,
} from "../../../../../interfaces/company/admin/company";
import { CompanyAdminDashboard } from "../../../../../interfaces/company/admin/dashboard";
import {
  ICompanyVerification,
  VerificationType,
} from "../../../../../models/company/company.verification.model";
import { IInvitation } from "../../../../../models/recruiter.invitation.model";

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
  ): Promise<void>;
  getCompanyProfile(companyAdminId: string): Promise<ProfileResponseDto>;
  getDashboard(userId: string): Promise<CompanyAdminDashboard>;
  getAllInvitations(
    page: number,
    limit: number,
    search: string,
    status: string,
    role: UserRole,
    userId: string,
  ): Promise<GetAllInvitationsResult>;
  getRecruiters(
    page: number,
    limit: number,
    search: string,
    status: string,
    userId: string,
  ): Promise<GetAllCompanyMembersResult>;
  getInterviewers(
    page: number,
    limit: number,
    search: string,
    status: string,
    userId: string,
  ): Promise<GetAllCompanyMembersResult>;
  cancelInvitation(invitationId: string, userId: string): Promise<IInvitation>;
}
