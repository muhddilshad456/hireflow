import { IUser } from "../../models/user.model.js";

export interface IUserRepository {
  findByEmail(email: string): Promise<IUser | null>;
  create(userData: Partial<IUser>): Promise<IUser>;
  update(id: string, userData: Partial<IUser>): Promise<IUser | null>;
  findByRefreshToken(token: string): Promise<any>;
  removeRefreshToken(userId: string): Promise<any>;
  getAllUsers(): Promise<any>;
}
