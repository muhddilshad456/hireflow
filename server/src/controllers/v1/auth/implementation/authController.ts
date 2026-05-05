import { NextFunction, Request, Response } from "express";
import { ResendOtpDto } from "../../../../dtos/v1/auth/resend-otp.dto.js";
import { IAuthService } from "../../../../services/v1/auth/interface/IAuthService.js";
import { AuthRequest } from "../../../../middlewares/auth.middleware.js";
import { injectable, inject } from "inversify";
import { TYPES } from "../../../../dependency-injection/types.js";
import { ResponseHandler } from "../../../../utils/responseHandler";

@injectable()
export class AuthController {
  constructor(@inject(TYPES.AuthService) private authService: IAuthService) {}
  async signup(req: Request, res: Response, next: NextFunction) {
    try {
      const dto = req.body;
      const result = await this.authService.signup(dto);
      return ResponseHandler.success(res, result.message, {
        email: result.email,
      });
    } catch (error: any) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const dto = req.body;
      const { user, accessToken, refreshToken } =
        await this.authService.login(dto);
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
      const dto = req.body;
      const result = await this.authService.verifyOtp(dto);
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

  async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const tdo = req.body;
      const result = await this.authService.resetPassword(tdo);
      return ResponseHandler.success(res, "Password changed successfully..");
    } catch (error) {
      next(error);
    }
  }

  async getCurrentUser(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      console.log(userId);
      const result = await this.authService.getCurrentUser(userId);
      return ResponseHandler.success(res, "Token Check successfull..", result);
    } catch (error) {
      next(error);
    }
  }

  async getGoogleAuthUrl(req: Request, res: Response, next: NextFunction) {
    try {
      const url = await this.authService.getGoogleAuthUrl();
      return res.redirect(url);
    } catch (error) {
      next(error);
    }
  }

  async handleGoogleCallback(req: Request, res: Response, next: NextFunction) {
    try {
      const code = req.query.code as string;

      if (!code) {
        return res.status(400).json({ message: "No code provided" });
      }

      const result = await this.authService.handleGoogleCallback(code);

      res.cookie("refreshToken", result.data.refreshToken, {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return res.redirect(
        `http://localhost:5173/google-success?token=${result.data.accessToken}`,
      );
    } catch (error) {
      next(error);
    }
  }
}
