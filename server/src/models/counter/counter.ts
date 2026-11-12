import { Schema, model } from "mongoose";

export interface ICounter {
  _id: string;
  sequence: number;
}

const counterSchema = new Schema<ICounter>({
  _id: {
    type: String,
    required: true,
  },

  sequence: {
    type: Number,
    required: true,
    default: 0,
    min: 0,
  },
});

export const CounterModel = model<ICounter>("Counter", counterSchema);
