import { Router } from "express";
import { validateDto } from "../../middlewares/validate.middleware";
import { IAuthController } from "../../controllers/v1/auth/interface/IAuthController";
import { SignupDto } from "../../dtos/v1/auth/signup.dto";
import { LoginDto } from "../../dtos/v1/auth/login.dto";
import { VerifyOtpDto } from "../../dtos/v1/auth/verify-otp.dto";
import { ResendOtpDto } from "../../dtos/v1/auth/resend-otp.dto";
import { verifyAccessToken } from "../../middlewares/auth.middleware";
import { container } from "../../dependency-injection/container";
import { TYPES } from "../../dependency-injection/types";
import { ResetPasswordDto } from "../../dtos/v1/auth/reset-password.dto";
import { AcceptInviteDto } from "../../dtos/v1/company/admin/request-dtos/acceptInvitationDto";

const router = Router();

const authController = container.get<IAuthController>(TYPES.AuthController);

router.post(
  "/signup",
  validateDto(SignupDto),
  authController.signup.bind(authController),
);
router.post(
  "/login",
  validateDto(LoginDto),
  authController.login.bind(authController),
);
router.post(
  "/verify-otp",
  validateDto(VerifyOtpDto),
  authController.verifyOtp.bind(authController),
);
router.post(
  "/resend-otp",
  validateDto(ResendOtpDto),
  authController.resendOtp.bind(authController),
);
router.post("/refresh", authController.refreshToken.bind(authController));
router.post(
  "/logout",
  verifyAccessToken,
  authController.logout.bind(authController),
);
router.post(
  "/forgot-password",
  authController.forgotPassword.bind(authController),
);
router.post(
  "/reset-password",
  validateDto(ResetPasswordDto),
  authController.resetPassword.bind(authController),
);
router.get(
  "/check-token",
  verifyAccessToken,
  authController.getCurrentUser.bind(authController),
);
router.get("/google", authController.getGoogleAuthUrl.bind(authController));
router.get(
  "/google/callback",
  authController.handleGoogleCallback.bind(authController),
);
router.post(
  "/accept-invite",
  validateDto(AcceptInviteDto),
  authController.acceptInvite.bind(authController),
);
router.post(
  "/change-password",
  verifyAccessToken,
  authController.changePassword.bind(authController),
);
//* change email
router.post(
  "/change-email",
  verifyAccessToken,
  authController.changeEmail.bind(authController),
);
router.post(
  "/verify-email-change",
  verifyAccessToken,
  authController.verifyEmailChange.bind(authController),
);
export default router;
