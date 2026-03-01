import { Course } from "../Course";

export interface ICourseRepository {
  findByCourseCode(code: string): Promise<Course | null>;
  addCourse(course: Course): Promise<void>;
}
