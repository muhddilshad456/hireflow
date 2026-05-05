import { injectable } from "inversify";
import {
  CompanyVerificationModel,
  ICompanyVerification,
} from "../../../models/company.verification.model";
import { BaseRepository } from "../../user/implementations/base.repository";
import { ICompanyRepository } from "../interface/ICompanyRepository";

@injectable()
export class CompanyRepository
  extends BaseRepository<ICompanyVerification>
  implements ICompanyRepository
{
  constructor() {
    super(CompanyVerificationModel);
  }
}
