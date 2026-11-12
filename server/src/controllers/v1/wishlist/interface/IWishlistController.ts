import { Response, NextFunction } from "express";
import { AuthRequest } from "../../../../middlewares/auth.middleware";

export interface IWishlistController {
  addToWishlist(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void>;
  getWishlist(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void>;
  removeFromWishlist(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void>;
}
