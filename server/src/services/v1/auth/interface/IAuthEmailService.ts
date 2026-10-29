import { Types } from "mongoose";

export interface ChangeEmailResponse {
  success: boolean;
  message: string;
}

export interface VerifyEmailChangeResponse {
  user: {
    userId: Types.ObjectId;
    role: string;
  };
  message: string;
}

export interface IAuthEmailService {
  changeEmail(userId: string, newEmail: string): Promise<ChangeEmailResponse>;
  verifyEmailChange(token: string): Promise<VerifyEmailChangeResponse>;
}
