import { ClientSession } from "mongoose";

export interface ICounterRepository {
  getNextSequence(
    entity: string,
    year: number,
    session?: ClientSession,
  ): Promise<number>;
}
