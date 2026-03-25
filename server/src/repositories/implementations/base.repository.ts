import { Model, Document } from "mongoose";
import { IBaseRepository } from "../interfaces/IBaseRepository.js";

export class BaseRepository<T extends Document> implements IBaseRepository<T> {
  constructor(private model: Model<T>) {}
  async create(data: Partial<T>): Promise<T> {
    return this.model.create(data);
  }
  async findById(id: string): Promise<T | null> {
    return this.model.findById(id);
  }
  async findAll(): Promise<T[]> {
    return this.model.find();
  }
  async update(id: string, data: Partial<T>): Promise<T | null> {
    return this.model.findByIdAndUpdate(id, data, { new: true });
  }
  async delete(id: string): Promise<T | null> {
    return this.model.findByIdAndDelete(id);
  }
}
