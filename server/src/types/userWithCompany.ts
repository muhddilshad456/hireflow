import { IUser } from "../models/user.model";
import { ICompany } from "../models/company.model";

export interface IUserWithCompany extends Omit<IUser, "company"> {
  company?: ICompany;
}
