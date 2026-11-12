import { IJobWithApplication } from "../../../../constants/application/application";
import { IWishlist } from "../../../../models/wishlist/wishlist.model";

export interface IWishlistService {
  addToWishlist(userId: string, jobId: string): Promise<IWishlist>;
  getWishlist(userId: string): Promise<IJobWithApplication[]>;
  removeFromWishlist(userId: string, jobId: string): Promise<IWishlist>;
}
