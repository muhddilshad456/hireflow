export interface IAdminService {
  getAllCompanyVerificationReq(
    page: number,
    limit: number,
    search: string,
    status: string,
  ): Promise<any>;
  getCompanyVerificationReq(companyVerificationId: string): Promise<any>;
  approveCompany(companyVerificationId: string): Promise<any>;
}
