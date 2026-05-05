import { IUser } from "../../../models/user.model.js";
import { IBaseRepository } from "./IBaseRepository.js";

export interface IUserRepository extends IBaseRepository<IUser> {
  findByEmail(email: string): Promise<IUser | null>;
  create(userData: Partial<IUser>): Promise<IUser>;
  findByRefreshToken(token: string): Promise<any>;
  removeRefreshToken(userId: string): Promise<any>;
  findByResetToken(token: string): Promise<IUser | null>;
  getAllUsers(
    page: number,
    limit: number,
    search: string,
    status: string,
  ): Promise<any>;
}
