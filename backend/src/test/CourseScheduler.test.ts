import { describe, it, expect } from "vitest";
import { CourseScheduler } from "../application/use-cases/CourseScheduler";
import type { Course } from "../domain/Course";
import { MockCourseRepository } from "../domain/repositories/MockCourseRepository";

function course(code: string, credits = 3, prereqs: Course[][] = [], repo: MockCourseRepository): Course {
  const c = {
    coursecode: code,
    credits,
    prereqs: prereqs.map(g => ({ courses: g.map(opt => opt.coursecode) }))
  } as Course;
  repo.addCourse(c); // Ensure this updates if the code already exists
  return c;
}

describe("CourseScheduler - No prerequisites", () => {

  it("schedules all courses in first semester when no prereqs", async () => {
    const courseRepository = new MockCourseRepository();

    const A = course("A", 3, [], courseRepository);
    const B = course("B", 3, [], courseRepository);
    const C = course("C", 3, [], courseRepository);

    const scheduler = await CourseScheduler.create([A, B, C], 9, courseRepository);
    const schedule = scheduler.buildSchedule();

    expect(schedule.length).toBe(1);
    expect(schedule[0]?.length).toBe(3);
  });

});

describe("AND prerequisites", () => {

  it("enforces sequential dependency", async () => {

    const courseRepository = new MockCourseRepository();

    const A = course("A", 3, [], courseRepository);
    const B = course("B", 3, [], courseRepository);
    const C = course("C", 3, [[A], [B]], courseRepository); // A AND B

    const scheduler = await CourseScheduler.create([A, B, C], 6, courseRepository);
    const schedule = scheduler.buildSchedule();

    expect(schedule.length).toBe(2);
    if (schedule[1] && schedule[1][0]) {
        expect(schedule[1][0].coursecode).toBe("C");
    }
  });

});

describe("OR prerequisites", () => {

  it("requires only one option", async () => {

    const courseRepository = new MockCourseRepository();

    const A = course("A", 3, [], courseRepository);
    const B = course("B", 3, [], courseRepository);
    const C = course("C", 3, [[A, B]], courseRepository); // A OR B

    const scheduler = await CourseScheduler.create([A, B, C], 6, courseRepository);
    const schedule = scheduler.buildSchedule();

    expect(schedule.length).toBe(2);

    const semester1 = schedule[0]?.map(c => c.coursecode);
    expect(semester1).toContain("A");
    expect(semester1).toContain("B");

    const semester2 = schedule[1]?.map(c => c.coursecode);
    expect(semester2).toContain("C");
  });

});

describe("AND-of-OR prerequisites", () => {

  it("handles multi-group logic", async () => {

    const courseRepository = new MockCourseRepository();

    const A = course("A", 3, [], courseRepository);
    const B = course("B", 3, [], courseRepository);
    const C = course("C", 3, [], courseRepository);
    const D = course("D", 3, [[A, B], [C]], courseRepository); // (A OR B) AND C

    const scheduler = await CourseScheduler.create([A, B, C, D], 9, courseRepository);
    const schedule = scheduler.buildSchedule();

    expect(schedule.length).toBe(2);

    const semester2 = schedule[1]?.map((c) => c.coursecode);
    expect(semester2).toContain("D");
  });

});

describe("Credit limits", () => {

  it("splits semesters when credit limit reached", async () => {

    const courseRepository = new MockCourseRepository();

    const A = course("A", 3, [], courseRepository);
    const B = course("B", 3, [], courseRepository);
    const C = course("C", 3, [], courseRepository);

    const scheduler = await CourseScheduler.create([A, B, C], 6, courseRepository);
    const schedule = scheduler.buildSchedule();

    expect(schedule.length).toBe(2);
  });

});

describe("Impossible schedules", () => {

  it("throws on cyclic dependency", async () => {

    const courseRepository = new MockCourseRepository();

    const A = course("A", 3, [], courseRepository);
    const B = course("B", 3, [[A]], courseRepository);
    A.prereqs = [{ courses: [B.coursecode] }]; // cycle

    courseRepository.addCourse(A); // Update with new prereqs

    const scheduler = await CourseScheduler.create([A, B], 6, courseRepository);

    expect(() => scheduler.buildSchedule())
        .toThrow();
    });

});

describe("Credit deadlock", () => {

  it("throws if a course cannot fit into any semester", async () => {

    const courseRepository = new MockCourseRepository();

    const A = course("A", 9, [], courseRepository); // too big
    const scheduler = await CourseScheduler.create([A], 6, courseRepository);

    expect(() => scheduler.buildSchedule())
      .toThrow();
  });

});

describe("Graduation minimization - parallel chains", () => {

  it("runs independent chains in parallel", async () => {

    const courseRepository = new MockCourseRepository();

    // Chain 1: A -> B -> C
    const A = course("A", 3, [], courseRepository);
    const B = course("B", 3, [[A]], courseRepository);
    const C = course("C", 3, [[B]], courseRepository);

    // Chain 2: D -> E -> F
    const D = course("D", 3, [], courseRepository);
    const E = course("E", 3, [[D]], courseRepository);
    const F = course("F", 3, [[E]], courseRepository);

    const scheduler = await CourseScheduler.create(
      [A, B, C, D, E, F],
      6,
      courseRepository
    );

    const schedule = scheduler.buildSchedule();

    expect(schedule.length).toBe(3);
  });

});

describe("Graduation minimization - unlock priority", () => {

  it("takes gateway courses early", async () => {

    const courseRepository = new MockCourseRepository();

    const G = course("G", 3, [], courseRepository);

    const A = course("A", 3, [[G]], courseRepository);
    const B = course("B", 3, [[G]], courseRepository);
    const C = course("C", 3, [[G]], courseRepository);
    const D = course("D", 3, [[G]], courseRepository);

    const scheduler = await CourseScheduler.create(
      [G, A, B, C, D],
      6,
      courseRepository
    );

    const schedule = scheduler.buildSchedule();

    expect(schedule[0]?.map(c => c.coursecode)).toContain("G");
    expect(schedule.length).toBe(3);
  });

});

describe("Large program test", () => {

  it("handles complex AND-of-OR structure", async () => {

    const courseRepository = new MockCourseRepository();

    const MATH101 = course("MATH101", 3, [], courseRepository);
    const MATH102 = course("MATH102", 3, [[MATH101]], courseRepository);
    const MATH201 = course("MATH201", 3, [[MATH102]], courseRepository);

    const CS101 = course("CS101", 3, [], courseRepository);
    const CS102 = course("CS102", 3, [[CS101]], courseRepository);
    const CS201 = course("CS201", 3, [[CS102], [MATH102]], courseRepository);

    const STATS101 = course("STATS101", 3, [[MATH101]], courseRepository);
    const AI101 = course("AI101", 3, [[CS201, STATS101]], courseRepository); // OR

    const CAPSTONE = course("CAPSTONE", 3, [[CS201], [MATH201]], courseRepository); // OR

    const scheduler = await CourseScheduler.create(
      [
        MATH101, MATH102, MATH201,
        CS101, CS102, CS201,
        STATS101,
        AI101,
        CAPSTONE
      ],
      9,
      courseRepository
    );

    const schedule = scheduler.buildSchedule();

    expect(schedule.length).toBeLessThanOrEqual(4);
  });

});

describe("Wide DAG performance (nearly optimal)", () => {

  it("handles many dependencies without exploding semesters", async () => {

    const courseRepository = new MockCourseRepository();

    const base = Array.from({ length: 6 }, (_, i) =>
      course(`B${i}`, 3, [], courseRepository)
    );

    const mid = base.map((b, i) =>
      course(`M${i}`, 3, [[b]], courseRepository)
    );

    const advanced = mid.map((m, i) =>
      course(`A${i}`, 3, [[m]], courseRepository)
    );

    const capstone = course(
      "CAP",
      3,
      [advanced], // OR across many,
        courseRepository
    );

    const scheduler = await CourseScheduler.create(
      [...base, ...mid, ...advanced, capstone],
      12,
      courseRepository
    );

    const schedule = scheduler.buildSchedule();

    expect(schedule.length).toBeLessThanOrEqual(5);
  });

});