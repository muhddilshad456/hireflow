import { Router } from "express";
import { container } from "../../../dependency-injection/container";
import { ISubscriptionController } from "../../../controllers/v1/subscription/interface/ISubscriptionController";
import { TYPES } from "../../../dependency-injection/types";
import { verifyAccessToken } from "../../../middlewares/auth.middleware";
import { roleGuard } from "../../../middlewares/role.middleware";
import { UserRole } from "../../../constants/roles";

const router = Router();

const subscriptionController = container.get<ISubscriptionController>(
  TYPES.SubscriptionController,
);

router.post(
  "/create-checkout-session",
  verifyAccessToken,
  roleGuard([UserRole.COMPANY_ADMIN]),
  subscriptionController.createCheckoutSession.bind(subscriptionController),
);

router.get(
  "/status",
  verifyAccessToken,
  roleGuard([UserRole.COMPANY_ADMIN]),
  subscriptionController.getSubscriptionStatus.bind(subscriptionController),
);

router.get(
  "/company-subscription-status",
  verifyAccessToken,
  roleGuard([UserRole.COMPANY_RECRUITER]),
  subscriptionController.getCompanyAccess.bind(subscriptionController),
);

export default router;
