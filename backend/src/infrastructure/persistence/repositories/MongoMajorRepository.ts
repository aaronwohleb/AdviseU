//import { IMajorRepository } from "./IMajorRepository";
import { Major } from "../../../domain/Major";
import { MajorModel } from "../models/Major.model";
import { MajorMapper } from "../mappers/MajorMapper";

export class MongoMajorRepository /* implements IMajorRepository */ {
  async findById(id: string): Promise<Major | null> {
    const doc = await MajorModel.findById(id);
    if (!doc) return null;
    return MajorMapper.toDomain(doc);
  }

  async findAll(): Promise<Major[]> {
    const docs = await MajorModel.find();
    return docs.map((doc) => MajorMapper.toDomain(doc));
  }

  async findByName(name: string): Promise<Major | null> {
    const doc = await MajorModel.findOne({ name });
    if (!doc) return null;
    return MajorMapper.toDomain(doc);
  }
}
