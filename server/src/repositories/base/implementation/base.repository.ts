import { Model, Document, UpdateQuery, ClientSession, AnyKeys } from "mongoose";
import { IBaseRepository } from "../interface/IBaseRepository.js";
import { QueryFilter } from "mongoose";

export class BaseRepository<T extends Document> implements IBaseRepository<T> {
  constructor(private model: Model<T>) {}
  async create(data: any, session?: ClientSession): Promise<T> {
    const [doc] = await this.model.create([data], { session });
    return doc;
  }
  async save(doc: T, session?: ClientSession): Promise<T> {
    return await doc.save({ session });
  }
  async createMany(data: Partial<T>[]): Promise<T[]> {
    return this.model.insertMany(data) as unknown as Promise<T[]>;
  }
  async findById(id: string, session?: ClientSession): Promise<T | null> {
    return this.model.findById(id).session(session ?? null);
  }
  async findAll(): Promise<T[]> {
    return this.model.find();
  }
  async update(id: string, data: UpdateQuery<T>): Promise<T | null> {
    return this.model.findByIdAndUpdate(id, data, { new: true });
  }
  async findOneAndUpdate(filter: any, data: any): Promise<T | null> {
    return this.model.findOneAndUpdate(filter, data, {
      new: true,
    });
  }
  async delete(id: string): Promise<T | null> {
    return this.model.findByIdAndDelete(id);
  }
  async findOne(
    filter: QueryFilter<T>,
    session?: ClientSession,
  ): Promise<T | null> {
    return this.model.findOne(filter).session(session ?? null);
  }
  async addToSet(
    filter: any,
    field: keyof T,
    value: string,
  ): Promise<T | null> {
    return this.model.findOneAndUpdate(
      filter,
      { $addToSet: { [field]: value } as any },
      {
        new: true,
      },
    );
  }
  async pullFromArray(
    filter: any,
    field: keyof T,
    value: string,
  ): Promise<any> {
    const update = {
      $pull: {
        [field]: value,
      },
    } as any;

    return this.model.updateOne(filter, update);
  }
}
