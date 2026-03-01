import { Course } from "../../domain/Course";
import { Major } from "../../domain/Major";
import { Prerequisite } from "../../domain/Prerequisite";
import { Requirement } from "../../domain/Requirement";
import { Track } from "../../domain/Track";
import Logic, { Solver } from "logic-solver";

export class LogicEncoder {

    private sub_req_counter = 0; // For generating unique IDs for sub-requirements
    solver: Solver;

    constructor(solver: Solver = new Logic.Solver()) {
        this.solver = solver;
    }

    encodeMajor(major: Major, solver: Solver = this.solver) {
        // 1. TRACKS: One track is required (OR)
        const trackVars = major.tracks.map((t: Track) => this.encodeTrack(solver, t));
        solver.require(Logic.or(...trackVars));

        // 2. MAJOR REQUIREMENTS: All must be met (AND)
        major.reqs.forEach((req: Requirement) => {
            this.encodeRequirement(solver, req);
        });
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
        
        if (returnVar) {
            const reqId = `Req_${this.sub_req_counter++}`; // Unique ID for this requirement
            // Logic: reqId is true IF at least 'num' courses are true
            solver.require(Logic.equivalent(reqId, Logic.atLeast(req.num, ...courseCodes)));
            return reqId;
        } else {
            // Standard mandatory requirement
            solver.require(Logic.atLeast(req.num, ...courseCodes));
        }
    }

    private encodePrereqs(solver: Solver, allCourses: Course[]) {
        allCourses.forEach(course => {
            course.prereqs.forEach((prereq: Prerequisite) => {
            const options = prereq.courses.map((c: Course) => c.coursecode);
            // Logic: CourseCode => (Option1 OR Option2 OR Option3)
            solver.require(Logic.implies(course.coursecode, Logic.or(...options)));
            });
        });
    }

}