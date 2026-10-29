import {
  AdminDashboard,
  AdminProfileResponse,
} from "../../../../interfaces/admin/admin";
import { VerificationStatus } from "../../../../constants/companyStatus";
import {
  ICompanyVerification,
  VerificationType,
} from "../../../../models/company/company.verification.model";
import { ICompany } from "../../../../models/company/company.model";
import { IUserWithCompany } from "../../../../types/userWithCompany";
import { GetAllCompaniesResult } from "../../../../repositories/user/interfaces/IUserRepository.js";

export interface VerificationRequestListItem {
  id: string;
  name: string;
  email: string;
  status: VerificationStatus;
}

export interface GetAllCompanyVerificationReqResponse {
  verificationRequests: VerificationRequestListItem[];
  totalVerificationRequests: number;
  totalPages: number;
  currentPage: number;
}

export interface IAdminService {
  getAllCompanyVerificationReq(
    page: number,
    limit: number,
    search: string,
    status: string,
    type: VerificationType,
  ): Promise<GetAllCompanyVerificationReqResponse>;
  getCompanyVerificationReq(
    companyVerificationId: string,
  ): Promise<ICompanyVerification>;
  approveCompany(companyVerificationId: string): Promise<ICompany>;
  rejectCompany(companyVerificationId: string, reason: string): Promise<void>;
  getAllCompanies(
    page: number,
    limit: number,
    search: string,
    status: string,
  ): Promise<{ result: GetAllCompaniesResult }>;
  getCompanyDetails(id: string): Promise<IUserWithCompany | null>;
  getAdminProfile(userId: string): Promise<AdminProfileResponse>;
  getDashboard(): Promise<AdminDashboard>;
}
