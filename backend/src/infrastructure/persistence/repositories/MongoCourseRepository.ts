// Uses the Course.model to fetch data, then uses mapper to return clean domain objects.
import { ICourseRepository } from "../../../domain/repositories/ICourseRepository";
import { Course } from "../../../domain/Course";
import { CourseModel } from "../models/Course.model";
import { CourseMapper } from "../mappers/CourseMapper";

export class MongoCourseRepository implements ICourseRepository {
  async findByCourseCode(id: string): Promise<Course | null> {
    const doc = await CourseModel.findById(id);
    if (!doc) return null;
    return CourseMapper.toDomain(doc);
  }

  async findAll(): Promise<Course[]> {
    const docs = await CourseModel.find();
    return docs.map((doc) => CourseMapper.toDomain(doc));
  }

  async addCourse(): Promise<void> {}
}
