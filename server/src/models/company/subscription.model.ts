import mongoose, { Schema, Document, Types } from "mongoose";

export enum SubscriptionStatus {
  NOT_SUBSCRIBED = "NOT_SUBSCRIBED",
  ACTIVE = "ACTIVE",
  EXPIRED = "EXPIRED",
}

export interface ISubscription extends Document {
  _id: Types.ObjectId;
  companyId: Types.ObjectId;

  startDate?: Date;
  endDate?: Date;

  status: SubscriptionStatus;

  stripeCustomerId?: string;
  stripeSubscriptionId?: string;

  createdAt: Date;
  updatedAt: Date;
}

const subscriptionSchema = new Schema<ISubscription>(
  {
    companyId: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      required: true,
      unique: true,
    },

    startDate: {
      type: Date,
    },

    endDate: {
      type: Date,
    },

    status: {
      type: String,
      enum: Object.values(SubscriptionStatus),
      default: SubscriptionStatus.NOT_SUBSCRIBED,
    },
    stripeCustomerId: {
      type: String,
      sparse: true,
    },

    stripeSubscriptionId: {
      type: String,
      sparse: true,
    },
  },
  {
    timestamps: true,
  },
);

export const SubscriptionModel = mongoose.model<ISubscription>(
  "Subscription",
  subscriptionSchema,
);
