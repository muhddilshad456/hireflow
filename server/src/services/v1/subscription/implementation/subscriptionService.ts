import { inject, injectable } from "inversify";
import type Stripe from "stripe";
import { TYPES } from "../../../../dependency-injection/types";
import { IUserRepository } from "../../../../repositories/user/interfaces/IUserRepository";
import { ICompanyRepository } from "../../../../repositories/company/interface/ICompanyRepository";
import { ISubscriptionRepository } from "../../../../repositories/subscription/interface/ISubscriptionRepository";
import { Logger } from "pino";
import { UnauthorizedError } from "../../../../errors/unauthorized.error";
import { VALIDATION_MESSAGES } from "../../../../constants/messages/validation";
import { NotFoundError } from "../../../../errors/not-found.error";
import { SUBSCRIPTION_MESSAGES } from "../../../../constants/messages/subscription";
import { ForbiddenError } from "../../../../errors/forbidden.error";
import { BadRequestError } from "../../../../errors/bad-request.error";
import {
  CHECKOUT_CANCEL_URL,
  CHECKOUT_SUCCESS_URL,
  stripe,
  STRIPE_PRICE_ID,
} from "../../../../config/stripe";
import {
  ISubscription,
  SubscriptionStatus,
} from "../../../../models/company/subscription.model";
import { ISubscriptionService } from "../interface/ISubscriptionService";
import { SubscriptionStatusResult } from "../../../../interfaces/subscription/subscription";

export interface CheckoutSessionResult {
  sessionId: string;
  url: string;
}

@injectable()
export class SubscriptionService implements ISubscriptionService {
  constructor(
    @inject(TYPES.UserRepository) private _userRepository: IUserRepository,
    @inject(TYPES.CompanyRepository)
    private _companyRepository: ICompanyRepository,
    @inject(TYPES.SubscriptionRepository)
    private _subscriptionRepository: ISubscriptionRepository,
    @inject(TYPES.Logger) private _logger: Logger,
  ) {}

  private async getAdminCompany(userId: string) {
    if (!userId) {
      throw new UnauthorizedError(VALIDATION_MESSAGES.USER_ID_REQUIRED);
    }

    const user = await this._userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError(SUBSCRIPTION_MESSAGES.USER_NOT_FOUND);
    }
    if (user.isBlocked) {
      throw new ForbiddenError(SUBSCRIPTION_MESSAGES.USER_BLOCKED);
    }
    if (!user.company) {
      throw new BadRequestError(SUBSCRIPTION_MESSAGES.NO_COMPANY);
    }

    const company = await this._companyRepository.findById(
      user.company.toString(),
    );
    if (!company) {
      throw new NotFoundError(SUBSCRIPTION_MESSAGES.COMPANY_NOT_FOUND);
    }

    if (company.adminId.toString() !== userId.toString()) {
      this._logger.warn({
        event: SUBSCRIPTION_MESSAGES.NOT_COMPANY_ADMIN,
        userId,
        companyId: company._id.toString(),
      });
      throw new ForbiddenError(SUBSCRIPTION_MESSAGES.NOT_COMPANY_ADMIN);
    }

    return { user, company };
  }

  private async resolveEffectiveStatus(
    subscription: ISubscription,
  ): Promise<SubscriptionStatus> {
    if (
      subscription.status === SubscriptionStatus.ACTIVE &&
      (!subscription.endDate || subscription.endDate <= new Date())
    ) {
      await this._subscriptionRepository.findOneAndUpdate(
        { _id: subscription._id.toString() },
        { status: SubscriptionStatus.EXPIRED },
      );
      return SubscriptionStatus.EXPIRED;
    }
    return subscription.status;
  }

  private async getMemberCompanyId(userId: string): Promise<string> {
    if (!userId) {
      throw new UnauthorizedError(VALIDATION_MESSAGES.USER_ID_REQUIRED);
    }

    const user = await this._userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError(SUBSCRIPTION_MESSAGES.USER_NOT_FOUND);
    }
    if (user.isBlocked) {
      throw new ForbiddenError(SUBSCRIPTION_MESSAGES.USER_BLOCKED);
    }
    if (!user.company) {
      throw new BadRequestError(SUBSCRIPTION_MESSAGES.NO_COMPANY);
    }

    return user.company.toString();
  }

  private async handleCheckoutCompleted(
    session: Stripe.Checkout.Session,
  ): Promise<void> {
    if (session.mode !== "subscription") return;

    if (session.payment_status !== "paid") {
      this._logger.warn({
        event: "STRIPE_CHECKOUT_NOT_PAID",
        sessionId: session.id,
        paymentStatus: session.payment_status,
      });
      return;
    }

    // Set when the checkout session was created
    const companyId =
      session.client_reference_id ?? session.metadata?.companyId;
    if (!companyId) {
      this._logger.error({
        event: "STRIPE_WEBHOOK_NO_COMPANY_ID",
        sessionId: session.id,
      });
      return;
    }

    const company = await this._companyRepository.findById(companyId);
    if (!company) {
      this._logger.error({
        event: "STRIPE_WEBHOOK_COMPANY_NOT_FOUND",
        companyId,
        sessionId: session.id,
      });
      return;
    }

    const stripeSubscriptionId =
      typeof session.subscription === "string"
        ? session.subscription
        : session.subscription?.id;
    const stripeCustomerId =
      typeof session.customer === "string"
        ? session.customer
        : session.customer?.id;

    if (!stripeSubscriptionId) {
      this._logger.error({
        event: "STRIPE_WEBHOOK_NO_SUBSCRIPTION_ID",
        sessionId: session.id,
      });
      return;
    }

    const subscription =
      await stripe.subscriptions.retrieve(stripeSubscriptionId);
    const item = subscription.items.data[0] as any;
    const periodStart: number | undefined =
      item?.current_period_start ?? (subscription as any).current_period_start;
    const periodEnd: number | undefined =
      item?.current_period_end ?? (subscription as any).current_period_end;

    if (!periodStart || !periodEnd) {
      throw new Error("Stripe subscription has no billing period"); // 500 -> Stripe retries
    }

    await this._subscriptionRepository.upsertByCompanyId(companyId, {
      status: SubscriptionStatus.ACTIVE,
      startDate: new Date(periodStart * 1000),
      endDate: new Date(periodEnd * 1000),
      stripeCustomerId,
      stripeSubscriptionId,
    });

    this._logger.info({
      event: "SUBSCRIPTION_ACTIVATED",
      companyId,
      stripeSubscriptionId,
    });
  }

  //* create checkout session
  async createCheckoutSession(userId: string): Promise<CheckoutSessionResult> {
    if (!userId) {
      throw new UnauthorizedError(VALIDATION_MESSAGES.USER_ID_REQUIRED);
    }

    // 1. User -> company
    const user = await this._userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError(SUBSCRIPTION_MESSAGES.USER_NOT_FOUND);
    }
    if (user.isBlocked) {
      throw new ForbiddenError(SUBSCRIPTION_MESSAGES.USER_BLOCKED);
    }
    if (!user.company) {
      throw new BadRequestError(SUBSCRIPTION_MESSAGES.NO_COMPANY);
    }

    const company = await this._companyRepository.findById(
      user.company.toString(),
    );
    if (!company) {
      throw new NotFoundError(SUBSCRIPTION_MESSAGES.COMPANY_NOT_FOUND);
    }

    // 2. Only the company admin can buy; company must be active
    if (company.adminId.toString() !== userId.toString()) {
      this._logger.warn({
        event: SUBSCRIPTION_MESSAGES.NOT_COMPANY_ADMIN,
        userId,
        companyId: company._id.toString(),
      });
      throw new ForbiddenError(SUBSCRIPTION_MESSAGES.NOT_COMPANY_ADMIN);
    }
    if (!company.isActive) {
      throw new ForbiddenError(SUBSCRIPTION_MESSAGES.COMPANY_INACTIVE);
    }

    // 3. Already subscribed / expired plan
    const companyId = company._id.toString();
    const existing = await this._subscriptionRepository.findOne({ companyId });

    if (existing?.status === SubscriptionStatus.ACTIVE) {
      const stillValid = !!existing.endDate && existing.endDate > new Date();

      if (stillValid) {
        this._logger.warn({
          event: SUBSCRIPTION_MESSAGES.ALREADY_SUBSCRIBED,
          companyId,
        });
        throw new BadRequestError(SUBSCRIPTION_MESSAGES.ALREADY_SUBSCRIBED);
      }

      await this._subscriptionRepository.findOneAndUpdate(
        { _id: existing._id },
        { status: SubscriptionStatus.EXPIRED },
      );
    }

    try {
      const session = await stripe.checkout.sessions.create({
        mode: "subscription",
        line_items: [{ price: STRIPE_PRICE_ID, quantity: 1 }],
        customer_email: user.email,
        // Used by the webhook later to know which company paid
        client_reference_id: companyId,
        metadata: { companyId, userId },
        subscription_data: { metadata: { companyId, userId } },
        success_url: CHECKOUT_SUCCESS_URL,
        cancel_url: CHECKOUT_CANCEL_URL,
      });

      if (!session.url) {
        throw new Error("Stripe did not return a checkout URL");
      }

      return { sessionId: session.id, url: session.url };
    } catch (error) {
      this._logger.error({
        event: "STRIPE_CHECKOUT_FAILED",
        companyId,
        error: error instanceof Error ? error.message : error,
      });
      throw new Error(SUBSCRIPTION_MESSAGES.CHECKOUT_FAILED);
    }
  }
  //* handle stipe event
  async handleStripeEvent(event: Stripe.Event): Promise<void> {
    switch (event.type) {
      case "checkout.session.completed":
        await this.handleCheckoutCompleted(
          event.data.object as Stripe.Checkout.Session,
        );
        break;
      default:
        this._logger.info({ event: "STRIPE_EVENT_IGNORED", type: event.type });
    }
  }

  //* get subscription status
  async getSubscriptionStatus(
    userId: string,
  ): Promise<SubscriptionStatusResult> {
    const { company } = await this.getAdminCompany(userId);

    const subscription = await this._subscriptionRepository.findOne({
      companyId: company._id.toString(),
    });

    if (!subscription) {
      return {
        status: SubscriptionStatus.NOT_SUBSCRIBED,
        isActive: false,
        startDate: null,
        endDate: null,
        daysRemaining: 0,
      };
    }

    const now = new Date();
    let status = subscription.status;

    if (
      status === SubscriptionStatus.ACTIVE &&
      (!subscription.endDate || subscription.endDate <= now)
    ) {
      await this._subscriptionRepository.findOneAndUpdate(
        { _id: subscription._id.toString() },
        { status: SubscriptionStatus.EXPIRED },
      );
      status = SubscriptionStatus.EXPIRED;
    }

    const isActive = status === SubscriptionStatus.ACTIVE;
    const daysRemaining =
      isActive && subscription.endDate
        ? Math.ceil(
            (subscription.endDate.getTime() - now.getTime()) / 86_400_000,
          )
        : 0;

    return {
      status,
      isActive,
      startDate: subscription.startDate ?? null,
      endDate: subscription.endDate ?? null,
      daysRemaining,
    };
  }
  //* get company subscription status
  async getCompanyAccess(userId: string): Promise<{ isActive: boolean }> {
    const companyId = await this.getMemberCompanyId(userId);
    return { isActive: await this.isCompanyActive(companyId) };
  }

  /** ACTIVE and not past its end date */
  async isCompanyActive(companyId: string): Promise<boolean> {
    const subscription = await this._subscriptionRepository.findOne({
      companyId,
    });
    if (!subscription) return false;

    const status = await this.resolveEffectiveStatus(subscription);
    return status === SubscriptionStatus.ACTIVE;
  }
}
