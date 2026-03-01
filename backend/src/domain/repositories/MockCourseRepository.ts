import { Course } from "../Course";
import { ICourseRepository } from "./ICourseRepository";

export class MockCourseRepository implements ICourseRepository {
    private courses: Map<string, Course>;
    
    constructor() {
        this.courses = new Map<string, Course>();
    }

    async findByCourseCode(code: string): Promise<Course | null> {
        return this.courses.get(code) || null;
    }

    async addCourse(course: Course): Promise<void> {
        this.courses.set(course.coursecode, course);
    }
}