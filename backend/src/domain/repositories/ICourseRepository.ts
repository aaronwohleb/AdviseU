import { Course } from "../Course";

export interface ICourseRepository {
    findByCourseCode(code: string): Course;
}