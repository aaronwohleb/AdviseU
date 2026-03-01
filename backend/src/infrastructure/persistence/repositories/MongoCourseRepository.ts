// Uses the Course.model to fetch data, then uses mapper to return clean domain objects.
import { ICourseRepository } from "../../../domain/repositories/ICourseRepository";
import { Course } from "../../../domain/Course";
import { CourseModel } from "../models/Course.model";
import { CourseMapper } from "../mappers/CourseMapper";

/** Populate options required to fully resolve nested prereq Course documents */
const PREREQ_POPULATE = {
  path: "prereqs",
  populate: { path: "prereqs" }, // one level of nested prereqs
};

export class MongoCourseRepository implements ICourseRepository {
  async findById(id: string): Promise<Course | null> {
    const doc = await CourseModel.findById(id).populate(PREREQ_POPULATE).lean();
    if (!doc) return null;
    return CourseMapper.toDomain(doc);
  }

  async findAll(): Promise<Course[]> {
    const docs = await CourseModel.find().populate(PREREQ_POPULATE).lean();
    return docs.map((doc) => CourseMapper.toDomain(doc));
  }

  async findByCourseCode(coursecode: string): Promise<Course | null> {
    const doc = await CourseModel.findOne({ coursecode })
      .populate(PREREQ_POPULATE)
      .lean();
    if (!doc) return null;
    return CourseMapper.toDomain(doc);
  }
}
