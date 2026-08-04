import { ClientSession, QueryFilter } from "mongoose";

export interface IBaseRepository<T> {
  create(data: Partial<T>, session?: ClientSession): Promise<T>;
  save(doc: T, session?: ClientSession): Promise<T>;
  createMany(data: Partial<T>[]): Promise<T[]>;
  findById(id: string, session?: ClientSession): Promise<T | null>;
  findAll(): Promise<T[]>;
  update(id: string, data: Partial<T>): Promise<T | null>;
  findOneAndUpdate(filter: any, data: any): Promise<T | null>;
  delete(id: string): Promise<T | null>;
  findOne(filter: QueryFilter<T>, session?: ClientSession): Promise<T | null>;
  addToSet(filter: any, field: keyof T, value: string): Promise<T | null>;
  pullFromArray(filter: any, field: keyof T, value: string): Promise<any>;
}
