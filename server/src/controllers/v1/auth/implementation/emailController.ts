import { NextFunction, Request, Response } from "express";
import { AuthRequest } from "../../../../middlewares/auth.middleware.js";
import { injectable, inject } from "inversify";
import { TYPES } from "../../../../dependency-injection/types.js";
import { ResponseHandler } from "../../../../utils/responseHandler";
import { AUTH_MESSAGES } from "../../../../constants/messages/auth.js";
import { IEmailController } from "../interface/IEmailController.js";
import { IAuthEmailService } from "../../../../services/v1/auth/interface/IAuthEmailService.js";

@injectable()
export class EmailController implements IEmailController {
  constructor(
    @inject(TYPES.AuthEmailService) private authEmailService: IAuthEmailService,
  ) {}
  //* change email
  async changeEmail(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { newEmail } = req.body;
      console.log(req.user);
      const userId = req.user?.userId;
      const result = await this.authEmailService.changeEmail(userId, newEmail);
      ResponseHandler.success(
        res,
        AUTH_MESSAGES.EMAIL_VERIFICATION_SENT,
        result,
      );
    } catch (error) {
      next(error);
    }
  }
  //* verify change email
  async verifyEmailChange(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { token } = req.body;
      const result = await this.authEmailService.verifyEmailChange(token);
      ResponseHandler.success(res, AUTH_MESSAGES.EMAIL_CHANGE_SUCCESS, result);
    } catch (error) {
      next(error);
    }
  }
}
