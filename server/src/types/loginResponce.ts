import { IUser } from "../models/user.model";

export interface AuthResponse {
  user: Partial<IUser>;
  accessToken: string;
  refreshToken: string;
}
