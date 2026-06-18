import { VerificationType } from "../../../../models/company.verification.model";

export interface IAdminService {
  getAllCompanyVerificationReq(
    page: number,
    limit: number,
    search: string,
    status: string,
    type: VerificationType,
  ): Promise<any>;
  getCompanyVerificationReq(companyVerificationId: string): Promise<any>;
  approveCompany(companyVerificationId: string): Promise<any>;
  rejectCompany(companyVerificationId: string, reason: string): Promise<any>;
  getAllCompanies(
    page: number,
    limit: number,
    search: string,
    status: string,
  ): Promise<any>;
  getCompanyDetails(id: string): Promise<any>;
}
