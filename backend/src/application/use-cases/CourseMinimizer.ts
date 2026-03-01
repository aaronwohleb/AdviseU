import { Major } from "../../domain/Major";
import Logic, { Solution, Solver } from "logic-solver";
import { Course } from "../../domain/Course";
import { Prerequisite } from "../../domain/Prerequisite";
import { LogicEncoder } from "./LogicEncoder";

export class CourseMinimizer {
    solver: Solver;
    encoder: LogicEncoder;
    majors: Major[];
    completed: Course[];

    constructor(majors: Major[], completed: Course[]) {
        this.solver = new Logic.Solver();
        this.encoder = new LogicEncoder(this.solver);
        this.majors = majors;
        this.completed = completed;
    }

    findMinimalCourses() {
        // 1. Encode all majors and their requirements
        this.majors.forEach(major => this.encoder.encodeMajor(major, this.solver));
        // 2. Encode completed courses
        this.completed.forEach(course => {
            this.solver.require(course.coursecode); // Mark completed courses as true
        });
        // 3. Solve for a valid solution
        const solution = this.solver.solve();
        // 4. Minimize
        const minSolution = this.solver.minimizeWeightedSum(solution, Array.from(this.encoder.searchSpace, x => x), 1); // Weight of 1 for all courses
        // 5. Extract course codes from the solution
        return this.extractCoursesFromSolution(minSolution);
    }

    extractCoursesFromSolution(solution: Solution): string[] {
        const trueVars = solution.getTrueVars();
        // Filter to only include course codes (assuming all course codes are in the search space)
        
        return trueVars.filter(varName => this.encoder.searchSpace.has(varName));
    }
    
}
