import { describe } from 'node:test';
import { Course } from '../domain/Course';
import { Major } from '../domain/Major';
import { Prerequisite } from '../domain/Prerequisite';
import { Requirement } from '../domain/Requirement';
import { Track } from '../domain/Track';
import { expect, it } from 'vitest';
import { CourseMinimizer } from '../application/use-cases/CourseMinimizer';

describe('Course Minimizer Tests', () => {
    it('should minimize courses for a simple major with one track and straightforward requirements', () => {
        // Mock data
        const courseA = new Course('CS101', 'CS', [], 3);
        const courseB = new Course('CS102', 'CS', [], 3);
        const courseC = new Course('CS103', 'CS', [], 3);
        const req1 = new Requirement([courseA], 1); // Requires CS101
        const req2 = new Requirement([courseB, courseC], 1); // Requires at least one of CS102 or CS103
        const track = new Track([req1, req2], 'Software Engineering Track', "Engineering");
        const major = new Major([track], [], 'Computer Science', 'Engineering');
        const completed: Course[] = []; // No completed courses
        const minimizer = new CourseMinimizer([major], completed);
        const minimalCourses = minimizer.findMinimalCourses();
        // Expect the minimal courses to be either CS101 + CS102 or CS101 + CS103
        expect(minimizer.encoder.searchSpace).toContain('CS101');
        expect(minimizer.encoder.solver.solve()).not.toBeNull(); // Should have a solution
        const solution = minimizer.solver.solve();
        const minSolution = minimizer.solver.minimizeWeightedSum(solution, Array.from(minimizer.encoder.searchSpace, x => x), 1);
        const trueVars = minSolution.getTrueVars();
        expect(minimizer.encoder.searchSpace).toContain('CS101');
        expect(trueVars).toContain('CS101');
        expect(minimalCourses).toContain('CS101');
        expect(minimalCourses).toSatisfy((courses: string[]) => 
            (courses.includes('CS102') && !courses.includes('CS103')) || 
            (!courses.includes('CS102') && courses.includes('CS103'))
        );
    });
    it("should minimize courses for a major with a single course requirement", () => {
        // Mock data
        const courseA = new Course('CS101', 'CS', [], 3);
        const req = new Requirement([courseA], 1); // Requires CS101
        const major = new Major([], [req], 'Computer Science', 'Engineering');
        const completed: Course[] = []; // No completed courses
        const minimizer = new CourseMinimizer([major], completed);
        const minimalCourses = minimizer.findMinimalCourses();
        expect(minimalCourses).toEqual(['CS101']); // Should require CS101
    });
    it("should minimize courses for a major with an OR requirement", () => {
        // Mock data
        const courseA = new Course('CS101', 'CS', [], 3);
        const courseB = new Course('CS102', 'CS', [], 3);
        const req = new Requirement([courseA, courseB], 1);
        const major = new Major([], [req], 'Computer Science', 'Engineering');
        const completed: Course[] = []; // No completed courses
        const minimizer = new CourseMinimizer([major], completed);
        const minimalCourses = minimizer.findMinimalCourses();
        expect(minimalCourses.length).toBe(1);
        expect(minimalCourses).toSatisfy((courses: string[]) => 
            (courses.includes('CS101') && !courses.includes('CS102')) || 
            (!courses.includes('CS101') && courses.includes('CS102'))
        );
    });
    it("should minimize courses for a major with a track that has multiple requirements", () => {
        // Mock data
        const courseA = new Course('CS101', 'CS', [], 3);
        const courseB = new Course('CS102', 'CS', [], 3);
        const req1 = new Requirement([courseA], 1);
        const req2 = new Requirement([courseB], 1);
        const track = new Track([req1, req2], 'Software Engineering Track', "Engineering");
        const major = new Major([track], [], 'Computer Science', 'Engineering');
        const completed: Course[] = []; // No completed courses
        const minimizer = new CourseMinimizer([major], completed);
        const minimalCourses = minimizer.findMinimalCourses();
        expect(minimalCourses.length).toBe(2); // Should require both CS101 and CS102
        expect(minimalCourses).toContain('CS101');
        expect(minimalCourses).toContain('CS102');
    });
    it("should minimize courses for a major with both tracks and standalone requirements", () => {
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
        const completed: Course[] = []; // No completed courses
        const minimizer = new CourseMinimizer([major], completed);
        const minimalCourses = minimizer.findMinimalCourses();
        expect(minimalCourses).toContain('CS104'); // Should require CS104
        expect(minimalCourses).toContain('CS101'); // Should require CS101
        expect(minimalCourses).toSatisfy((courses: string[]) => 
            (courses.includes('CS102') && !courses.includes('CS103')) || 
            (!courses.includes('CS102') && courses.includes('CS103'))
        );
    });
    it("should minimize courses correctly when some courses are already completed", () => {
        // Mock data
        const courseA = new Course('CS101', 'CS', [], 3);
        const courseB = new Course('CS102', 'CS', [], 3);
        const courseC = new Course('CS103', 'CS', [], 3);
        const req1 = new Requirement([courseA], 1);
        const req2 = new Requirement([courseB, courseC], 1);
        const track = new Track([req1, req2], 'Software Engineering Track', "Engineering");
        const major = new Major([track], [], 'Computer Science', 'Engineering');
        const completed: Course[] = [courseA]; // CS101 is already completed
        const minimizer = new CourseMinimizer([major], completed);
        const minimalCourses = minimizer.findMinimalCourses();
        expect(minimalCourses).toContain('CS101'); // Should not require CS101
        expect(minimalCourses).toContain('CS102'); // Should require either CS102 or CS103
        expect(minimalCourses).toSatisfy((courses: string[]) => 
            (courses.includes('CS102') && !courses.includes('CS103')) || 
            (!courses.includes('CS102') && courses.includes('CS103'))
        );
    });

});