import { injectable } from "inversify";
import { BaseRepository } from "../../base/implementation/base.repository";
import { CompanyModel, ICompany } from "../../../models/company.model";
import { ICompanyRepository } from "../interface/ICompanyRepository";

@injectable()
export class CompanyRepository
  extends BaseRepository<ICompany>
  implements ICompanyRepository
{
  constructor() {
    super(CompanyModel);
  }
}
