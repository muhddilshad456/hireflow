import type { Request, Response } from "express";
import { inject, injectable } from "inversify";
import type Stripe from "stripe";
import { TYPES } from "../../../../dependency-injection/types";
import { stripe, STRIPE_WEBHOOK_SECRET } from "../../../../config/stripe";
import { Logger } from "pino";
import { ISubscriptionwebhookController } from "../interface/ISubscriptionwebhookController";
import { ISubscriptionService } from "../../../../services/v1/subscription/interface/ISubscriptionService";

@injectable()
export class SubscriptionwebhookController implements ISubscriptionwebhookController {
  constructor(
    @inject(TYPES.SubscriptionService)
    private subscriptionService: ISubscriptionService,
    @inject(TYPES.Logger) private logger: Logger,
  ) {}

  async handleStripeWebhook(req: Request, res: Response): Promise<void> {
    const signature = req.headers["stripe-signature"];

    if (!signature || Array.isArray(signature)) {
      res.status(400).send("Missing stripe-signature header");
      return;
    }

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        signature,
        STRIPE_WEBHOOK_SECRET,
      );
    } catch (error) {
      this.logger.warn({
        event: "STRIPE_WEBHOOK_SIGNATURE_INVALID",
        error: error instanceof Error ? error.message : error,
      });
      res.status(400).send("Webhook signature verification failed");
      return;
    }

    // 2. Process it. A 500 makes Stripe retry later; a 200 tells it we're done.
    try {
      await this.subscriptionService.handleStripeEvent(event);
      res.status(200).json({ received: true });
    } catch (error) {
      this.logger.error({
        event: "STRIPE_WEBHOOK_PROCESSING_FAILED",
        type: event.type,
        eventId: event.id,
        error: error instanceof Error ? error.message : error,
      });
      res.status(500).json({ received: false });
    }
  }
}
