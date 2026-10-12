export const SUBSCRIPTION_MESSAGES = {
  CHECKOUT_SESSION_CREATED: "Checkout session created successfully",
  USER_NOT_FOUND: "User not found",
  USER_BLOCKED: "Your account is blocked",
  NO_COMPANY: "No company is linked to this account",
  COMPANY_NOT_FOUND: "Company not found",
  NOT_COMPANY_ADMIN: "Only the company admin can manage the subscription",
  COMPANY_INACTIVE: "Your company is not active",
  ALREADY_SUBSCRIBED: "Your company already has an active subscription",
  CHECKOUT_FAILED: "Unable to start checkout. Please try again.",
  SUBSCRIPTION_FETCHED: "Subscription details fetched successfully",
  NOT_SUBSCRIBED:
    "Company dont have a active subscription for access this feature.",
} as const;
