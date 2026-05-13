import { ICompanyVerification } from "../../../models/company.verification.model";
import { IBaseRepository } from "../../base/interface/IBaseRepository";

export interface ICompanyVerRepository extends IBaseRepository<ICompanyVerification> {
  findLatestVerificationReq(
    userId: string,
  ): Promise<ICompanyVerification | null>;
  getAllVerificationReq(
    page: number,
    limit: number,
    search: string,
    status: string,
  ): Promise<any>;
}
