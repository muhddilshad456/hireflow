import { NextFunction, Request, Response } from "express";
import { IAuthService } from "../../../../services/v1/auth/interface/IAuthService.js";
import { AuthRequest } from "../../../../middlewares/auth.middleware.js";
import { injectable, inject } from "inversify";
import { TYPES } from "../../../../dependency-injection/types.js";
import { ResponseHandler } from "../../../../utils/responseHandler";
import { AUTH_MESSAGES } from "../../../../constants/messages/auth.js";
import { IPasswordController } from "../interface/IPasswordController.js";
import { IPasswordService } from "../../../../services/v1/auth/interface/IPasswordService.js";

@injectable()
export class PasswordController implements IPasswordController {
  constructor(
    @inject(TYPES.PasswordService) private passwordService: IPasswordService,
  ) {}
  //* forgott password
  async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const email = req.body.email;
      await this.passwordService.forgotPassword(email);
      res.json({ message: "Reset link sent to email" });
    } catch (error: unknown) {
      next(error);
    }
  }
  //* reset password
  async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const tdo = req.body;
      const result = await this.passwordService.resetPassword(tdo);
      ResponseHandler.success(res, "Password changed successfully..", result);
    } catch (error) {
      next(error);
    }
  }

  //* change password
  async changePassword(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { currentPassword, newPassword } = req.body;
      console.log("cur : ", currentPassword);
      console.log("new pass : ", newPassword);
      const userId = req.user?.userId;
      const result = await this.passwordService.changePassword(
        userId,
        currentPassword,
        newPassword,
      );
      ResponseHandler.success(
        res,
        AUTH_MESSAGES.PASSWORD_CHANGE_SUCCESS,
        result,
      );
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
}
