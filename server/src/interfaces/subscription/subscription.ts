import { SubscriptionStatus } from "../../models/company/subscription.model";

export interface CheckoutSessionResult {
  sessionId: string;
  url: string;
}

export interface SubscriptionStatusResult {
  status: SubscriptionStatus;
  isActive: boolean;
  startDate: Date | null;
  endDate: Date | null;
  daysRemaining: number;
}
