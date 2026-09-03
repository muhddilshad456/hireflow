export interface IAuthEmailService {
  changeEmail(userId: string, newEmail: string): Promise<any>;
  verifyEmailChange(token: string): Promise<any>;
}
