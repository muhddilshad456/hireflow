import { SUBSCRIPTION_ACTIONS } from "../../../../constents/actions/subscriptionActions";
import { SUBSCRIPTION_BASE_ROUTE } from "../../../../constents/routes/apiRoutes";
import api from "../../../../services/api";

export type SubscriptionStatus = "NOT_SUBSCRIBED" | "ACTIVE" | "EXPIRED";

export interface SubscriptionStatusData {
  status: SubscriptionStatus;
  isActive: boolean;
  startDate: string | null;
  endDate: string | null;
  daysRemaining: number;
}

export interface CheckoutSessionData {
  sessionId: string;
  url: string;
}

interface ApiResponse<T> {
  message: string;
  data: T;
}

//* create a Stripe Checkout session
export const createCheckoutSession = () => {
  return api
    .post<
      ApiResponse<CheckoutSessionData>
    >(`/${SUBSCRIPTION_BASE_ROUTE}/${SUBSCRIPTION_ACTIONS.CHECKOUT}`)
    .then((res) => res.data);
};

//* current subscription status of the company
export const getSubscriptionStatus = () => {
  return api
    .get(`/${SUBSCRIPTION_BASE_ROUTE}/${SUBSCRIPTION_ACTIONS.STATUS}`)
    .then((res) => res.data);
};
//* get subscription status of the company for rec
export const getCompanyAccess = () => {
  return api
    .get(`/${SUBSCRIPTION_BASE_ROUTE}/${SUBSCRIPTION_ACTIONS.COMAPANY_ACCESS}`)
    .then((res) => res.data);
};
