import {
  ICompanyVerification,
  VerificationType,
} from "../../../models/company.verification.model";
import { IBaseRepository } from "../../base/interface/IBaseRepository";

export interface ICompanyVerRepository extends IBaseRepository<ICompanyVerification> {
  findLatestVerificationReq(
    userId: string,
    type: VerificationType,
  ): Promise<ICompanyVerification | null>;
  getAllVerificationReq(
    page: number,
    limit: number,
    search: string,
    status: string,
    type: VerificationType,
  ): Promise<any>;
}
