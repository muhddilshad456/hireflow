import {
  Model,
  Document,
  UpdateQuery,
  ClientSession,
  UpdateWriteOpResult,
  QueryFilter,
} from "mongoose";
import { IBaseRepository } from "../interface/IBaseRepository.js";

export class BaseRepository<T extends Document> implements IBaseRepository<T> {
  constructor(private _model: Model<T>) {}
  async create(data: Partial<T>, session?: ClientSession): Promise<T> {
    const docs = (await this._model.create([data as never], { session })) as unknown as T[];
    return docs[0];
  }
  async save(doc: T, session?: ClientSession): Promise<T> {
    return await doc.save({ session });
  }
  async createMany(data: Partial<T>[]): Promise<T[]> {
    return this._model.insertMany(data) as unknown as Promise<T[]>;
  }
  async findById(id: string, session?: ClientSession): Promise<T | null> {
    return this._model.findById(id).session(session ?? null);
  }
  async find(data: QueryFilter<T>): Promise<T[]> {
    return this._model.find(data);
  }
  async findAll(): Promise<T[]> {
    return this._model.find();
  }
  async update(id: string, data: UpdateQuery<T>): Promise<T | null> {
    return this._model.findByIdAndUpdate(id, data, { new: true });
  }
  async findOneAndUpdate(
    filter: QueryFilter<T>,
    data: UpdateQuery<T> | Record<string, unknown>,
    session?: ClientSession,
  ): Promise<T | null> {
    return this._model.findOneAndUpdate(filter, data as UpdateQuery<T>, {
      new: true,
      session,
    });
  }
  async delete(id: string): Promise<T | null> {
    return this._model.findByIdAndDelete(id);
  }
  async findOne(
    filter: QueryFilter<T>,
    session?: ClientSession,
  ): Promise<T | null> {
    return this._model.findOne(filter).session(session ?? null);
  }
  async addToSet(
    filter: QueryFilter<T>,
    field: keyof T,
    value: string,
  ): Promise<T | null> {
    return this._model.findOneAndUpdate(
      filter,
      { $addToSet: { [field]: value } } as unknown as UpdateQuery<T>,
      {
        new: true,
      },
    );
  }
  async pullFromArray(
    filter: QueryFilter<T>,
    field: keyof T,
    value: string,
  ): Promise<UpdateWriteOpResult> {
    const update = {
      $pull: {
        [field]: value,
      },
    } as unknown as UpdateQuery<T>;

    return this._model.updateOne(filter, update);
  }
  async deleteMany(
    filter: QueryFilter<T>,
    session?: ClientSession,
  ): Promise<{ deletedCount: number }> {
    const result = await this._model.deleteMany(filter, { session });
    return { deletedCount: result.deletedCount ?? 0 };
  }
}
