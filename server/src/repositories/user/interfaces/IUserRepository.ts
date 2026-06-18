import { IUser } from "../../../models/user.model.js";
import { GetUsersResponse } from "../../../types/userRepo.js";
import { IUserWithCompany } from "../../../types/userWithCompany.js";
import { IBaseRepository } from "../../base/interface/IBaseRepository.js";

export interface IUserRepository extends IBaseRepository<IUser> {
  findByEmail(email: string): Promise<IUser | null>;
  create(userData: Partial<IUser>): Promise<IUser>;
  findByRefreshToken(token: string): Promise<IUser | null>;
  removeRefreshToken(userId: string): Promise<void>;
  findByResetToken(token: string): Promise<IUser | null>;
  getAllUsers(
    page: number,
    limit: number,
    search: string,
    status: string,
  ): Promise<GetUsersResponse>;
  getAllCompanies(
    page: number,
    limit: number,
    search: string,
    status: string,
  ): Promise<any>;
  findByIdWithCompany(userId: string): Promise<IUserWithCompany | null>;
}
