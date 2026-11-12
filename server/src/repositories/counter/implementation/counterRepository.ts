import { injectable } from "inversify";
import { ICounterRepository } from "../interface/ICounterRepository";
import { CounterModel } from "../../../models/counter/counter";
import { ClientSession } from "mongoose";

@injectable()
export class CounterRepository implements ICounterRepository {
  async getNextSequence(
    entity: string,
    year: number,
    session?: ClientSession,
  ): Promise<number> {
    const counter = await CounterModel.findByIdAndUpdate(
      `${entity}-${year}`,
      { $inc: { sequence: 1 } },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
        session,
      },
    );

    if (!counter) {
      throw new Error("Failed to generate sequence number");
    }

    return counter.sequence;
  }
}
