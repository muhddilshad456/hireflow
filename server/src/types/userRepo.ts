import { IUser } from "../models/user.model";

export interface GetUsersResponse {
  users: IUser[];
  totalUsers: number;
}
