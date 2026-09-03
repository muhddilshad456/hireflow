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
import { IEmailController } from "../../controllers/v1/auth/interface/IEmailController";
import { IPasswordController } from "../../controllers/v1/auth/interface/IPasswordController";

const router = Router();

const authController = container.get<IAuthController>(TYPES.AuthController);
const emailController = container.get<IEmailController>(TYPES.EmailController);
const passwordController = container.get<IPasswordController>(
  TYPES.PasswordController,
);

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
router.post("/refresh-token", authController.refreshToken.bind(authController));
router.post(
  "/logout",
  verifyAccessToken,
  authController.logout.bind(authController),
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
//* password
router.post(
  "/change-password",
  verifyAccessToken,
  passwordController.changePassword.bind(passwordController),
);
router.post(
  "/forgot-password",
  passwordController.forgotPassword.bind(passwordController),
);
router.post(
  "/reset-password",
  validateDto(ResetPasswordDto),
  passwordController.resetPassword.bind(passwordController),
);
//* email
router.post(
  "/change-email",
  verifyAccessToken,
  emailController.changeEmail.bind(emailController),
);
router.post(
  "/verify-email-change",
  verifyAccessToken,
  emailController.verifyEmailChange.bind(emailController),
);
export default router;
