import { NextFunction, Request, Response } from "express";
import { VerifyOtpDto } from "../dtos/auth/verify-otp.dto.js";
import { ResendOtpDto } from "../dtos/auth/resend-otp.dto.js";
import { IAuthService } from "../services/interfaces/IAuthService.js";
import { AuthRequest } from "../middlewares/auth.middleware.js";
import { injectable, inject } from "inversify";
import { TYPES } from "../dependency-injection/types.js";

@injectable()
export class AuthController {
  constructor(@inject(TYPES.AuthService) private authService: IAuthService) {}
  async signup(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, email, password } = req.body;
      const user = await this.authService.signup(name, email, password);
      res.status(201).json(user);
    } catch (error: any) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      console.log(req.body);
      const { email, password } = req.body;
      const { user, accessToken, refreshToken } = await this.authService.login(
        email,
        password,
      );
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
      res.status(200).json({
        user,
        accessToken,
      });
    } catch (error: any) {
      next(error);
    }
  }

  async verifyOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const dto: VerifyOtpDto = req.body;
      const result = await this.authService.verifyOtp(dto.email, dto.otp);
      res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error) {
      next(error);
    }
  }

  async resendOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const dto: ResendOtpDto = req.body;
      const result = await this.authService.resendOtp(dto.email);
      res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error) {
      next(error);
    }
  }

  async refreshToken(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.cookies.refreshToken;
      const result = await this.authService.refreshToken(token);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async logout(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user.userId;
      await this.authService.logout(userId);
      res.clearCookie("refreshToken");
      res.json({ message: "Logged out successfully.." });
    } catch (error) {
      next(error);
    }
  }

  async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const email = req.body.email;
      await this.authService.forgotPassword(email);
      res.json({ message: "Reset link sent to email" });
    } catch (error: unknown) {
      next(error);
    }
  }

  async listUsers(req: Request, res: Response, next: NextFunction) {
    try {
      let users = await this.authService.getUsers();
      res.json(users);
    } catch (error) {
      next(error);
    }
  }
}
