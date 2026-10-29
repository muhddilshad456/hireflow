import {
  ClientSession,
  QueryFilter,
  UpdateQuery,
  UpdateWriteOpResult,
} from "mongoose";

export interface IBaseRepository<T> {
  create(data: Partial<T>, session?: ClientSession): Promise<T>;
  save(doc: T, session?: ClientSession): Promise<T>;
  createMany(data: Partial<T>[]): Promise<T[]>;
  findById(id: string, session?: ClientSession): Promise<T | null>;
  findAll(): Promise<T[]>;
  update(id: string, data: Partial<T>): Promise<T | null>;
  findOneAndUpdate(
    filter: QueryFilter<T>,
    data: UpdateQuery<T> | Record<string, unknown>,
    session?: ClientSession,
  ): Promise<T | null>;
  delete(id: string): Promise<T | null>;
  findOne(filter: QueryFilter<T>, session?: ClientSession): Promise<T | null>;
  addToSet(
    filter: QueryFilter<T>,
    field: keyof T,
    value: string,
  ): Promise<T | null>;
  pullFromArray(
    filter: QueryFilter<T>,
    field: keyof T,
    value: string,
  ): Promise<UpdateWriteOpResult>;
  deleteMany(
    filter: QueryFilter<T>,
    session?: ClientSession,
  ): Promise<{ deletedCount: number }>;
  find(data: QueryFilter<T>): Promise<T[]>;
}
