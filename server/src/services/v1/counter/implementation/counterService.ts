import { inject, injectable } from "inversify";
import { ICounterService } from "../interface/ICounterService";
import { TYPES } from "../../../../dependency-injection/types";
import { ICounterRepository } from "../../../../repositories/counter/interface/ICounterRepository";
import { ClientSession } from "mongoose";

@injectable()
export class CounterService implements ICounterService {
  constructor(
    @inject(TYPES.CounterRepository)
    private _counterRepository: ICounterRepository,
  ) {}
  async generateNumber(
    prefix: string,
    entity: string,
    session?: ClientSession,
  ): Promise<string> {
    const year = new Date().getFullYear();

    const sequence = await this._counterRepository.getNextSequence(
      entity,
      year,
      session,
    );

    return `${prefix}-${year}-${String(sequence).padStart(6, "0")}`;
  }
}
