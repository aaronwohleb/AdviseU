//import { IMajorRepository } from "./IMajorRepository";
import { Major } from "../../../domain/Major";
import { MajorModel } from "../models/Major.model";
import { MajorMapper } from "../mappers/MajorMapper";

/** Deep populate to resolve Course documents nested inside requirements */
const DEEP_POPULATE = [
  { path: "reqs.courses" },
  { path: "tracks.reqs.courses" },
];

export class MongoMajorRepository /* implements IMajorRepository */ {
  async findById(id: string): Promise<Major | null> {
    const doc = await MajorModel.findById(id).populate(DEEP_POPULATE).lean();
    if (!doc) return null;
    return MajorMapper.toDomain(doc);
  }

  async findAll(): Promise<Major[]> {
    const docs = await MajorModel.find().populate(DEEP_POPULATE).lean();
    return docs.map((doc) => MajorMapper.toDomain(doc));
  }

  async findByName(name: string): Promise<Major | null> {
    const doc = await MajorModel.findOne({ name })
      .populate(DEEP_POPULATE)
      .lean();
    if (!doc) return null;
    return MajorMapper.toDomain(doc);
  }

  async save(major: Major): Promise<Major> {
    const data = MajorMapper.toPersistence(major);
    const created = await MajorModel.create(data);
    await created.populate(DEEP_POPULATE);
    return MajorMapper.toDomain(created.toObject());
  }

  async deleteById(id: string): Promise<boolean> {
    const result = await MajorModel.findByIdAndDelete(id);
    return result !== null;
  }
}
