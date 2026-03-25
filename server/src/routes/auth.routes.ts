import { Router } from "express";
import { validateDto } from "../middlewares/validate.middleware.js";
import { AuthController } from "../controllers/auth.controller.js";
import { SignupDto } from "../dtos/auth/signup.dto.js";
import { LoginDto } from "../dtos/auth/login.tdo.js";
import { VerifyOtpDto } from "../dtos/auth/verify-otp.dto.js";
import { ResendOtpDto } from "../dtos/auth/resend-otp.dto.js";
import { verifyAccessToken } from "../middlewares/auth.middleware.js";
import { container } from "../dependency-injection/container.js";
import { TYPES } from "../dependency-injection/types.js";

const router = Router();

const authController = container.get<AuthController>(TYPES.AuthController);

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
router.get("/users", authController.listUsers.bind(authController));

export default router;
