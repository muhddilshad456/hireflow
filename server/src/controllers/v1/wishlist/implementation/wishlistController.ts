import { inject, injectable } from "inversify";
import { TYPES } from "../../../../dependency-injection/types";
import { IWishlistService } from "../../../../services/v1/wishlist/interface/IWishlistService";
import { IWishlistController } from "../interface/IWishlistController";
import { Response, NextFunction } from "express";
import { AuthRequest } from "../../../../middlewares/auth.middleware";
import { ResponseHandler } from "../../../../utils/responseHandler";
import { WISHLIST_MESSAGES } from "../../../../constants/messages/wishlist/wishlist";

@injectable()
export class WishlistController implements IWishlistController {
  constructor(
    @inject(TYPES.WishlistService) private _wishlistService: IWishlistService,
  ) {}
  //* add to wishlist
  async addToWishlist(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = req.user?.userId as string;
      const jobId = req?.params?.jobId;
      const result = await this._wishlistService.addToWishlist(
        userId,
        jobId as string,
      );

      ResponseHandler.success(res, WISHLIST_MESSAGES.ADD_SUCCESS, result);
    } catch (error) {
      next(error);
    }
  }
  //* get wishlist
  async getWishlist(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = req.user?.userId as string;
      const result = await this._wishlistService.getWishlist(userId);

      ResponseHandler.success(res, WISHLIST_MESSAGES.FETCH_SUCCESS, result);
    } catch (error) {
      next(error);
    }
  }
  //* delete from wishlist
  async removeFromWishlist(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = req.user?.userId as string;
      const jobId = req?.params?.jobId;
      const result = await this._wishlistService.removeFromWishlist(
        userId,
        jobId as string,
      );

      ResponseHandler.success(res, WISHLIST_MESSAGES.REMOVE_SUCCESS, result);
    } catch (error) {
      next(error);
    }
  }
}
