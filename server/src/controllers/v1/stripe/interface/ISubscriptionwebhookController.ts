import type { Request, Response } from "express";
export interface ISubscriptionwebhookController {
  handleStripeWebhook(req: Request, res: Response): Promise<void>;
}
