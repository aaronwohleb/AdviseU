import { Course } from "../../domain/Course";
import { Major } from "../../domain/Major";
import { Prerequisite } from "../../domain/Prerequisite";
import { ICourseRepository } from "../../domain/repositories/ICourseRepository";
import { Requirement } from "../../domain/Requirement";
import { Track } from "../../domain/Track";
import Logic, { Solver } from "logic-solver";

export class LogicEncoder {
    private sub_req_counter = 0;
    private processedPrereqs: Set<string> = new Set(); // Prevent infinite recursion
    solver: Solver;
    searchSpace: Set<string> = new Set();
    courseRepository: ICourseRepository;

    constructor(solver: Solver = new Logic.Solver(), courseRepository: ICourseRepository) {
        this.solver = solver;
        this.courseRepository = courseRepository;
    }

    async encodeMajor(major: Major, solver: Solver = this.solver) {
        // 1. TRACKS
        if (major.tracks.length > 0) {
            const trackVarPromises = major.tracks.map(t => this.encodeTrack(solver, t));
            const trackVars = await Promise.all(trackVarPromises);
            solver.require(Logic.or(...trackVars));
        }

        // 2. MAJOR REQUIREMENTS
        // Changed to for...of to respect async
        for (const req of major.reqs) {
            await this.encodeRequirement(solver, req);
        }
    }

    private async encodeTrack(solver: Solver, track: Track) {
        const trackVar = `Track_${track.name}`;
        for (const req of track.reqs) {
            const reqSatisfiedVar = await this.encodeRequirement(solver, req, true);
            solver.require(Logic.implies(trackVar, reqSatisfiedVar));
        }
        return trackVar;
    }

    private async encodeRequirement(solver: Solver, req: Requirement, returnVar = false) {
        const courseCodes = req.courses.map((c: Course) => c.coursecode);
        
        // Ensure prereqs are encoded for all courses in this requirement
        await this.encodePrereqs(solver, req.courses);

        courseCodes.forEach(code => this.searchSpace.add(code));
        
        const sumConstraint = Logic.greaterThanOrEqual(
            Logic.sum(courseCodes), 
            Logic.constantBits(req.num)
        );

        if (returnVar) {
            const reqId = `Req_${this.sub_req_counter++}`;
            solver.require(Logic.equiv(reqId, sumConstraint));
            return reqId;
        } else {
            solver.require(sumConstraint);
        }
    }

    private async encodePrereqs(solver: Solver, courses: Course[]) {
        for (const course of courses) {
            // Skip if we've already defined rules for this course to avoid cycles/redundancy
            if (this.processedPrereqs.has(course.coursecode)) continue;
            this.processedPrereqs.add(course.coursecode);

            for (const prereq of course.prereqs) {
                const options = prereq.courses; // array of strings (course codes)
                
                // 1. Resolve course objects for recursion
                const resolvedPromises = options.map(code => this.courseRepository.findByCourseCode(code));
                const resolvedCourses = await Promise.all(resolvedPromises);

                if (resolvedCourses.some(c => c === null)) {
                    throw new Error(`Prerequisite course for ${course.coursecode} not found.`);
                }

                // 2. Add to search space
                options.forEach(opt => this.searchSpace.add(opt));

                // 3. Recursively encode the prerequisites of these options
                // (Cast to Course[] safe because of the null check above)
                await this.encodePrereqs(solver, resolvedCourses as Course[]);

                // 4. Require the logic: Course -> (Prereq1 OR Prereq2)
                if (options.length === 1) {
                    solver.require(Logic.implies(course.coursecode, options[0]));
                } else {
                    solver.require(Logic.implies(course.coursecode, Logic.or(...options)));
                }
            }
        }
    }
}