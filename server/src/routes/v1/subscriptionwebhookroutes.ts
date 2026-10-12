import express, { Router } from "express";
import { container } from "../../dependency-injection/container";
import { TYPES } from "../../dependency-injection/types";
import { SubscriptionwebhookController } from "../../controllers/v1/stripe/implementation/subscriptionwebhookController";

const router = Router();

const webhookController = container.get<SubscriptionwebhookController>(
  TYPES.SubscriptionwebhookController,
);

router.post(
  "/",
  express.raw({ type: "application/json" }),
  webhookController.handleStripeWebhook.bind(webhookController),
);

export default router;
