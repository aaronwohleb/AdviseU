import Logic from "logic-solver";
import { LogicEncoder } from "../../application/use-cases/LogicEncoder";
import { ICourseRepository } from "../../domain/repositories/ICourseRepository";
import { IMajorRepository } from "../../domain/repositories/IMajorRepository";
import {PlanRequestPayload} from "../../dtos/PlanRequest.dto";
import { MongoMajorRepository } from "../../infrastructure/persistence/repositories/MongoMajorRepository";
import { CourseMinimizer } from "../../application/use-cases/CourseMinimizer";
import { Course } from "../../domain/Course";
import { CourseScheduler } from "../../application/use-cases/CourseScheduler";
export default class Controller {
    
    constructor(private majorRepository: IMajorRepository, private courseRepository: ICourseRepository) {}

    async generatePlan(data: PlanRequestPayload): Promise<any> {
        // Simulate an async calculation (e.g., DB lookup or API call)
        const majors = [];
        const completed = [];

        for (const majorName of data.majors) {
            const major = await this.majorRepository.findByName(majorName);
            if (major) {
                majors.push(major);
            }
        }

        for (const course of data.completedCourses) {
            const courseData = await this.courseRepository.findByCourseCode(course);
            if (courseData) {
                completed.push(courseData);
            }
        }

        const solver = new Logic.Solver();
        const encoder = new LogicEncoder(solver, this.courseRepository);
        const minimizer = new CourseMinimizer(majors, completed, this.courseRepository);
        const minimalCourses = await minimizer.findMinimalCourses();

        const scheduleCourses = await Promise.all(minimalCourses.map(code => this.courseRepository.findByCourseCode(code)));
        const scheduler = await CourseScheduler.create(scheduleCourses.filter(c => c !== null) as Course[], 18, this.courseRepository);
        const sched = await scheduler.buildSchedule();

        return sched;
    }

}