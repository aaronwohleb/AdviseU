import { describe, it, expect, vi } from 'vitest';
import Logic from 'logic-solver';
import { LogicEncoder } from '../application/use-cases/LogicEncoder';
import { Course } from '../domain/Course';
import { Major } from '../domain/Major';
import { Prerequisite } from '../domain/Prerequisite';
import { Requirement } from '../domain/Requirement';
import { Track } from '../domain/Track';


describe('LogicEncoder Use Cases', () => {
    it("should encode a single course requirement correctly", () => {
        // Mock data
        const courseA = new Course('CS101', 'CS', [], 3);
        const req = new Requirement([courseA], 1); // Requires CS101
        const major = new Major([], [req], 'Computer Science', 'Engineering');
        const solver = new Logic.Solver();
        const encoder = new LogicEncoder(solver);
        encoder.encodeMajor(major);
        expect(solver.solve()).not.toBeNull(); // Should have a solution
    });

    it('should encode a simple or requirement', () => {
        // Mock data
        const courseA = new Course('CS101', 'CS', [], 3);
        const courseB = new Course('CS102', 'CS', [], 3);
        const req = new Requirement([courseA, courseB], 1); // At least 1 of CS101 or CS102
        const major = new Major([], [req], 'Computer Science', 'Engineering');

        // Initialize encoder and solver
        const solver = new Logic.Solver();
        const encoder = new LogicEncoder(solver);
        // Encode the major
        encoder.encodeMajor(major);
        expect(solver.solve()).not.toBeNull(); // Should have a solution
        const solution = solver.solve();
        // Check that at least one of the courses is true in the solution
        if (solution !== null) {
            const courseAVar = 'CS101';
            const courseBVar = 'CS102';
            const isCourseASelected = solution.getTrueVars().includes(courseAVar);
            const isCourseBSelected = solution.getTrueVars().includes(courseBVar);
            expect(isCourseASelected || isCourseBSelected).toBe(true); // At least one should be selected
        }
    });

    it('should encode a track with multiple requirements', () => {
        // Mock data
        const courseA = new Course('CS101', 'CS', [], 3);
        const courseB = new Course('CS102', 'CS', [], 3);
        const courseC = new Course('CS103', 'CS', [], 3);
        const req1 = new Requirement([courseA], 1); // Requires CS101
        const req2 = new Requirement([courseB, courseC], 1); // Requires at least one of CS102 or CS103
        const track = new Track([req1, req2], 'Software Engineering Track', "Engineering");
        const major = new Major([track], [], 'Computer Science', 'Engineering');
        const solver = new Logic.Solver();
        const encoder = new LogicEncoder(solver);
        encoder.encodeMajor(major);
        expect(solver.solve()).not.toBeNull(); // Should have a solution
    });

    it("should encode a major with both tracks and standalone requirements", () => {
        // Mock data
        const courseA = new Course('CS101', 'CS', [], 3);
        const courseB = new Course('CS102', 'CS', [], 3);
        const courseC = new Course('CS103', 'CS', [], 3);
        const courseD = new Course('CS104', 'CS', [], 3);
        const req1 = new Requirement([courseA], 1); // Requires CS101
        const req2 = new Requirement([courseB, courseC], 1); // Requires at least one of CS102 or CS103
        const track = new Track([req1, req2], 'Software Engineering Track', "Engineering");
        const standaloneReq = new Requirement([courseD], 1); // Requires CS104
        const major = new Major([track], [standaloneReq], 'Computer Science', 'Engineering');
        const solver = new Logic.Solver();
        const encoder = new LogicEncoder(solver);
        encoder.encodeMajor(major);
        expect(solver.solve()).not.toBeNull(); // Should have a solution
        expect(solver.solve()?.getTrueVars()).toContain('CS104'); // CS104 must be included due to standalone requirement
        expect(solver.solve()?.getTrueVars()).toContain('Track_Software Engineering Track'); // Track must be selected
        expect(solver.solve()?.getTrueVars()).toContain('CS101'); // CS101 must be included due to track requirement
        // At least one of CS102 or CS103 must be included due to track requirement
        const isCourseBSelected = solver.solve()?.getTrueVars().includes('CS102');
        const isCourseCSelected = solver.solve()?.getTrueVars().includes('CS103');
        expect(isCourseBSelected || isCourseCSelected).toBe(true); // At least one should be selected
    });

    it('should handle multiple majors correctly', () => {
        // Mock data for Major 1
        const courseA = new Course('CS101', 'CS', [], 3);
        const courseB = new Course('CS102', 'CS', [], 3);
        const req1 = new Requirement([courseA], 1);
        const track1 = new Track([req1], 'Software Engineering Track', "Engineering");
        const major1 = new Major([track1], [], 'Computer Science', 'Engineering');
        // Mock data for Major 2
        const courseC = new Course('MATH101', 'MATH', [], 3);
        const courseD = new Course('MATH102', 'MATH', [], 3);
        const req2 = new Requirement([courseC], 1);
        const track2 = new Track([req2], 'Applied Math Track', "Science");
        const major2 = new Major([track2], [], 'Mathematics', 'Science');
        // Initialize encoder and solver
        const solver = new Logic.Solver();
        const encoder = new LogicEncoder(solver);
        // Encode both majors
        encoder.encodeMajor(major1, solver);
        encoder.encodeMajor(major2, solver);
        expect(solver.solve()).not.toBeNull(); // Should have a solution
        const solution = solver.solve();
        if (solution !== null) {
            const isCourseASelected = solution.getTrueVars().includes('CS101');
            const isCourseCSelected = solution.getTrueVars().includes('MATH101');
            expect(isCourseASelected).toBe(true);
            expect(isCourseCSelected).toBe(true);
        }
    });
    it('should handle edge case of no tracks and no requirements', () => {
        const major = new Major([], [], 'Undeclared', 'General');
        const solver = new Logic.Solver();
        const encoder = new LogicEncoder(solver);
        encoder.encodeMajor(major);
        expect(solver.solve()).not.toBeNull(); // Should have a solution (trivially satisfied)
    });
    it("should handle prerequisites correctly", () => {
        // Mock data
        const courseA = new Course('CS101', 'CS', [], 3);
        const prereq = new Prerequisite([courseA]); // CS101 is a prerequisite
        const courseB = new Course('CS102', 'CS', [prereq], 3); // CS102 has a prerequisite of CS101
        const req = new Requirement([courseB], 1); // Requires CS102
        const major = new Major([], [req], 'Computer Science', 'Engineering');
        const solver = new Logic.Solver();
        const encoder = new LogicEncoder(solver);
        encoder.encodeMajor(major);
        expect(solver.solve()).not.toBeNull(); // Should have a solution
        const solution = solver.solve();
        if (solution !== null) {
            const isCourseASelected = solution.getTrueVars().includes('CS101');
            const isCourseBSelected = solution.getTrueVars().includes('CS102');
            expect(isCourseBSelected).toBe(true);
            expect(isCourseASelected).toBe(true); // CS101 must be selected due to prerequisite
        }
    });
    it("should handle nested prerequisites correctly", () => {
        // Mock data
        const courseA = new Course('CS101', 'CS', [], 3);
        const prereq1 = new Prerequisite([courseA]); // CS101 is a prerequisite
        const courseB = new Course('CS102', 'CS', [prereq1], 3); // CS102 has a prerequisite of CS101
        const prereq2 = new Prerequisite([courseB]); // CS102 is a prerequisite
        const courseC = new Course('CS103', 'CS', [prereq2], 3); // CS103 has a prerequisite of CS102
        const req = new Requirement([courseC], 1); // Requires CS103
        const major = new Major([], [req], 'Computer Science', 'Engineering');
        const solver = new Logic.Solver();
        const encoder = new LogicEncoder(solver);
        encoder.encodeMajor(major);
        expect(solver.solve()).not.toBeNull(); // Should have a solution
        const solution = solver.solve();
        if (solution !== null) {
            const isCourseASelected = solution.getTrueVars().includes('CS101');
            const isCourseBSelected = solution.getTrueVars().includes('CS102');
            const isCourseCSelected = solution.getTrueVars().includes('CS103');
            expect(isCourseCSelected).toBe(true);
            expect(isCourseBSelected).toBe(true); // CS102 must be selected due to prerequisite
            expect(isCourseASelected).toBe(true); // CS101 must be selected due to prerequisite
        }
    });
});