import { UserRole } from "../constants/roles";

export type AuthUser = {
  userId: string;
  role: UserRole;
};
