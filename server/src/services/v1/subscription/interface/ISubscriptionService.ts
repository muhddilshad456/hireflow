import Stripe from "stripe";
import { CheckoutSessionResult } from "../implementation/subscriptionService";
import { SubscriptionStatusResult } from "../../../../interfaces/subscription/subscription";

export interface ISubscriptionService {
  createCheckoutSession(userId: string): Promise<CheckoutSessionResult>;
  handleStripeEvent(event: Stripe.Event): Promise<void>;
  getSubscriptionStatus(userId: string): Promise<SubscriptionStatusResult>;
  getCompanyAccess(userId: string): Promise<{ isActive: boolean }>;
}
