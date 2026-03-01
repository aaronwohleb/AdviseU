import { Course } from "../../domain/Course";
import { Major } from "../../domain/Major";
import { Prerequisite } from "../../domain/Prerequisite";
import { ICourseRepository } from "../../domain/repositories/ICourseRepository";
import { Requirement } from "../../domain/Requirement";
import { Track } from "../../domain/Track";
import Logic, { Solver } from "logic-solver";

export class LogicEncoder {

    private sub_req_counter = 0; // For generating unique IDs for sub-requirements
    solver: Solver;
    searchSpace: Set<string> = new Set(); // Track all variables created
    courseRepository: ICourseRepository;

    constructor(solver: Solver = new Logic.Solver(), courseRepository: ICourseRepository) {
        this.solver = solver;
        this.courseRepository = courseRepository;
    }

    encodeMajor(major: Major, solver: Solver = this.solver) {
        // 1. TRACKS: One track is required (OR)
        if (major.tracks.length > 0) {
            const trackVars = major.tracks.map((t: Track) => this.encodeTrack(solver, t));
            solver.require(Logic.or(...trackVars));
        }


        // 2. MAJOR REQUIREMENTS: All must be met (AND)
        if (major.reqs.length > 0) {
            major.reqs.forEach((req: Requirement) => {
                this.encodeRequirement(solver, req);
            });
        }
    }

    private encodeTrack(solver: Solver, track: Track) {
        const trackVar = `Track_${track.name}`;
        // All requirements in a track must be met IF the track is chosen
        track.reqs.forEach((req: Requirement) => {
            const reqSatisfiedVar = this.encodeRequirement(solver, req, true); // Create a sub-variable
            solver.require(Logic.implies(trackVar, reqSatisfiedVar));
        });
        return trackVar;
    }

    private encodeRequirement(solver: Solver, req: Requirement, returnVar = false) {
        // Use "Shadow Variables" for ACE/Specific slots if needed, 
        // but here we use course codes directly.
        const courseCodes = req.courses.map((c: Course) => c.coursecode);
        this.encodePrereqs(solver, req.courses); // Encode any prerequisites for these courses
        courseCodes.forEach(code => this.searchSpace.add(code)); // Add courses to search space
        
        if (returnVar) {
            const reqId = `Req_${this.sub_req_counter++}`; // Unique ID for this requirement
            // Logic: reqId is true IF at least 'num' courses are true
            solver.require(Logic.equiv(reqId, Logic.greaterThanOrEqual(Logic.sum(courseCodes), Logic.constantBits(req.num))));
            return reqId;
        } else {
            // Standard mandatory requirement
            solver.require(Logic.greaterThanOrEqual(Logic.sum(courseCodes), Logic.constantBits(req.num)));
        }
    }

    private encodePrereqs(solver: Solver, allCourses: Course[]) {
        allCourses.forEach(course => {
            course.prereqs.forEach((prereq: Prerequisite) => {
                const prereqCourses = prereq.courses.map((code: string) => this.courseRepository.findByCourseCode(code));
                const options = prereq.courses;
                this.encodePrereqs(solver, prereqCourses); // Recursively encode nested prereqs
                options.forEach(opt => this.searchSpace.add(opt));

                if (options.length == 1) {
                    // Logic: Course => PrereqCourse
                    solver.require(Logic.implies(course.coursecode, options[0]));
                } else {
                    // Logic: CourseCode => (Option1 OR Option2 OR Option3)
                    solver.require(Logic.implies(course.coursecode,Logic.or(...options)));
                }
            });
        });
    }

}