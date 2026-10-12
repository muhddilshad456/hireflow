import { Types } from "mongoose";
import { IUser } from "../../models/user.model";

export interface IUserWithCompany extends Omit<IUser, "company"> {
  company?: { _id: Types.ObjectId; name: string };
}
