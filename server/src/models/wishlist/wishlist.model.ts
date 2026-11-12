import mongoose, { Schema, Document, Types } from "mongoose";

export interface IWishlist extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  jobs: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const wishlistSchema = new Schema<IWishlist>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    jobs: {
      type: [Schema.Types.ObjectId],
      ref: "Job",
      default: [],
    },
  },
  { timestamps: true },
);

export const WishlistModel = mongoose.model<IWishlist>(
  "Wishlist",
  wishlistSchema,
);
