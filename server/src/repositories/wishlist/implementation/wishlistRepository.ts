import { BaseRepository } from "../../base/implementation/base.repository.js";
import { injectable } from "inversify";
import {
  IWishlist,
  WishlistModel,
} from "../../../models/wishlist/wishlist.model.js";
import { IWishlistRepository } from "../interface/IWishlistRepository.js";

@injectable()
export class WishlistRepository
  extends BaseRepository<IWishlist>
  implements IWishlistRepository
{
  constructor() {
    super(WishlistModel);
  }
}
