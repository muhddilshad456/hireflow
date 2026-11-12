import { Router } from "express";
import { container } from "../../../dependency-injection/container";
import { IWishlistController } from "../../../controllers/v1/wishlist/interface/IWishlistController";
import { TYPES } from "../../../dependency-injection/types";
import { verifyAccessToken } from "../../../middlewares/auth.middleware";

const router = Router();

const wishlistController = container.get<IWishlistController>(
  TYPES.WishlistController,
);

router.post(
  "/:jobId",
  verifyAccessToken,
  wishlistController.addToWishlist.bind(wishlistController),
);

router.get(
  "/",
  verifyAccessToken,
  wishlistController.getWishlist.bind(wishlistController),
);

router.delete(
  "/:jobId",
  verifyAccessToken,
  wishlistController.removeFromWishlist.bind(wishlistController),
);

export default router;
