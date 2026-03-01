import { describe, it, expect } from "vitest";
import { CourseScheduler } from "../application/use-cases/CourseScheduler";
import type { Course } from "../domain/Course";

function course(
  code: string,
  credits = 3,
  prereqs: Course[][] = []
): Course {
  return {
    coursecode: code,
    major: "TEST",
    credits,
    prereqs: prereqs.map(group => ({ courses: group }))
  };
}

describe("CourseScheduler - No prerequisites", () => {

  it("schedules all courses in first semester when no prereqs", () => {

    const A = course("A");
    const B = course("B");
    const C = course("C");

    const scheduler = new CourseScheduler([A, B, C], 9);
    const schedule = scheduler.buildSchedule();

    expect(schedule.length).toBe(1);
    expect(schedule[0]?.length).toBe(3);
  });

});

describe("AND prerequisites", () => {

  it("enforces sequential dependency", () => {

    const A = course("A");
    const B = course("B");
    const C = course("C", 3, [[A], [B]]); // A AND B

    const scheduler = new CourseScheduler([A, B, C], 6);
    const schedule = scheduler.buildSchedule();

    expect(schedule.length).toBe(2);
    if (schedule[1] && schedule[1][0]) {
        expect(schedule[1][0].coursecode).toBe("C");
    }
  });

});

describe("OR prerequisites", () => {

  it("requires only one option", () => {

    const A = course("A");
    const B = course("B");
    const C = course("C", 3, [[A, B]]); // A OR B

    const scheduler = new CourseScheduler([A, B, C], 6);
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

  it("handles multi-group logic", () => {

    const A = course("A");
    const B = course("B");
    const C = course("C");
    const D = course("D", 3, [[A, B], [C]]); // (A OR B) AND C

    const scheduler = new CourseScheduler([A, B, C, D], 9);
    const schedule = scheduler.buildSchedule();

    expect(schedule.length).toBe(2);

    const semester2 = schedule[1]?.map((c) => c.coursecode);
    expect(semester2).toContain("D");
  });

});

describe("Credit limits", () => {

  it("splits semesters when credit limit reached", () => {

    const A = course("A", 3);
    const B = course("B", 3);
    const C = course("C", 3);

    const scheduler = new CourseScheduler([A, B, C], 6);
    const schedule = scheduler.buildSchedule();

    expect(schedule.length).toBe(2);
  });

});

describe("Impossible schedules", () => {

  it("throws on cyclic dependency", () => {

    const A = course("A");
    const B = course("B", 3, [[A]]);
    A.prereqs = [{ courses: [B] }]; // cycle

    const scheduler = new CourseScheduler([A, B], 6);

    expect(() => scheduler.buildSchedule())
        .toThrow();
    });

});

describe("Credit deadlock", () => {

  it("throws if a course cannot fit into any semester", () => {

    const A = course("A", 9); // too big
    const scheduler = new CourseScheduler([A], 6);

    expect(() => scheduler.buildSchedule())
      .toThrow();
  });

});

describe("Graduation minimization - parallel chains", () => {

  it("runs independent chains in parallel", () => {

    // Chain 1: A -> B -> C
    const A = course("A");
    const B = course("B", 3, [[A]]);
    const C = course("C", 3, [[B]]);

    // Chain 2: D -> E -> F
    const D = course("D");
    const E = course("E", 3, [[D]]);
    const F = course("F", 3, [[E]]);

    const scheduler = new CourseScheduler(
      [A, B, C, D, E, F],
      6
    );

    const schedule = scheduler.buildSchedule();

    expect(schedule.length).toBe(3);
  });

});

describe("Graduation minimization - unlock priority", () => {

  it("takes gateway courses early", () => {

    const G = course("G");

    const A = course("A", 3, [[G]]);
    const B = course("B", 3, [[G]]);
    const C = course("C", 3, [[G]]);
    const D = course("D", 3, [[G]]);

    const scheduler = new CourseScheduler(
      [G, A, B, C, D],
      6
    );

    const schedule = scheduler.buildSchedule();

    expect(schedule[0]?.map(c => c.coursecode)).toContain("G");
    expect(schedule.length).toBe(3);
  });

});

describe("Large program test", () => {

  it("handles complex AND-of-OR structure", () => {

    const MATH101 = course("MATH101");
    const MATH102 = course("MATH102", 3, [[MATH101]]);
    const MATH201 = course("MATH201", 3, [[MATH102]]);

    const CS101 = course("CS101");
    const CS102 = course("CS102", 3, [[CS101]]);
    const CS201 = course("CS201", 3, [[CS102], [MATH102]]);

    const STATS101 = course("STATS101", 3, [[MATH101]]);
    const AI101 = course("AI101", 3, [[CS201, STATS101]]); // OR

    const CAPSTONE = course("CAPSTONE", 3, [[CS201], [MATH201]]);

    const scheduler = new CourseScheduler(
      [
        MATH101, MATH102, MATH201,
        CS101, CS102, CS201,
        STATS101,
        AI101,
        CAPSTONE
      ],
      9
    );

    const schedule = scheduler.buildSchedule();

    expect(schedule.length).toBeLessThanOrEqual(4);
  });

});

describe("Wide DAG performance (nearly optimal)", () => {

  it("handles many dependencies without exploding semesters", () => {

    const base = Array.from({ length: 6 }, (_, i) =>
      course(`B${i}`)
    );

    const mid = base.map((b, i) =>
      course(`M${i}`, 3, [[b]])
    );

    const advanced = mid.map((m, i) =>
      course(`A${i}`, 3, [[m]])
    );

    const capstone = course(
      "CAP",
      3,
      [advanced] // OR across many
    );

    const scheduler = new CourseScheduler(
      [...base, ...mid, ...advanced, capstone],
      12
    );

    const schedule = scheduler.buildSchedule();

    expect(schedule.length).lessThanOrEqual(5);
  });

});