import { inject, injectable } from "inversify";
import { ISubscriptionController } from "../interface/ISubscriptionController";
import { TYPES } from "../../../../dependency-injection/types";
import { SUBSCRIPTION_MESSAGES } from "../../../../constants/messages/subscription";
import { ResponseHandler } from "../../../../utils/responseHandler";
import { AuthRequest } from "../../../../middlewares/auth.middleware";
import { Response, NextFunction } from "express";
import { ISubscriptionService } from "../../../../services/v1/subscription/interface/ISubscriptionService";

@injectable()
export class SubscriptionController implements ISubscriptionController {
  constructor(
    @inject(TYPES.SubscriptionService)
    private subscriptionService: ISubscriptionService,
  ) {}
  //* create-checkout-session
  async createCheckoutSession(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = req.user?.userId;
      const result = await this.subscriptionService.createCheckoutSession(
        userId as string,
      );

      ResponseHandler.success(
        res,
        SUBSCRIPTION_MESSAGES.CHECKOUT_SESSION_CREATED,
        result,
      );
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
  //* get subscription status
  async getSubscriptionStatus(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = req.user?.userId;

      const result = await this.subscriptionService.getSubscriptionStatus(
        userId as string,
      );

      ResponseHandler.success(
        res,
        SUBSCRIPTION_MESSAGES.SUBSCRIPTION_FETCHED,
        result,
      );
    } catch (error) {
      next(error);
    }
  }
  //* get company subscription status
  async getCompanyAccess(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = req.user?.userId;

      const result = await this.subscriptionService.getCompanyAccess(
        userId as string,
      );

      ResponseHandler.success(
        res,
        SUBSCRIPTION_MESSAGES.SUBSCRIPTION_FETCHED,
        result,
      );
    } catch (error) {
      next(error);
    }
  }
}
