import { ClientSession } from "mongoose";

export interface ICounterService {
  generateNumber(
    prefix: string,
    entity: string,
    session?: ClientSession,
  ): Promise<string>;
}
