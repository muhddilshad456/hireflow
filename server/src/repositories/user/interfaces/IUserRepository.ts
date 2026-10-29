import { UserRole } from "../../../constants/roles.js";
import { GetAllCompanyMembersResult } from "../../../interfaces/company/admin/company.js";
import { UserBasicInfo } from "../../../interfaces/interview/interview.js";
import { IUser } from "../../../models/user.model.js";
import { GetUsersResponse } from "../../../types/userRepo.js";
import { IUserWithCompany } from "../../../types/userWithCompany.js";
import { IBaseRepository } from "../../base/interface/IBaseRepository.js";

export interface GetAllCompaniesResult {
  companies: IUser[];
  totalCompanies: number;
  totalPages: number;
}

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
  ): Promise<GetAllCompaniesResult>;
  findByIdWithCompany(userId: string): Promise<IUserWithCompany | null>;
  findByIdSelect(id: string, fields: string): Promise<UserBasicInfo | null>;
  getAllCompanyMembers(
    page: number,
    limit: number,
    search: string,
    status: string,
    role: UserRole,
    companyId: string,
  ): Promise<GetAllCompanyMembersResult>;
}
