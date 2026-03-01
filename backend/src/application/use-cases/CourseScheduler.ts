import { Course } from "../../domain/Course";
import { ICourseRepository } from "../../domain/repositories/ICourseRepository";

export class CourseScheduler {

  private remainingGroups = new Map<Course, number>();
  private groupSatisfied = new Map<Course, boolean[]>();
  private satisfiesMap = new Map<Course, { target: Course; groupIndex: number }[]>();
  private depth = new Map<Course, number>();

  private completed = new Set<Course>();
  private available = new Set<Course>();

  constructor(
    private courses: Course[],
    private maxCreditsPerSemester: number,
    private courseRepository: ICourseRepository
    
  ) {}

  public static async create(
    courses: Course[],
    maxCreditsPerSemester: number,
    courseRepository: ICourseRepository
  ): Promise<CourseScheduler> {
    const scheduler = new CourseScheduler(courses, maxCreditsPerSemester, courseRepository);
    await scheduler.initializeState(); 
    scheduler.computeDepths(); // Call this AFTER state is initialized
    return scheduler;
  }

  public buildSchedule(): Course[][] {
    const schedule: Course[][] = [];

    this.computeDepths();

    while (!this.allCoursesCompleted()) {
      const semester = this.buildSemester();

      if (semester.length === 0) {
        throw new Error("Impossible schedule — cycle or credit deadlock.");
      }

      this.completeSemester(semester);
      schedule.push(semester);
    }

    return schedule;
  }


    private async initializeState(): Promise<void> {
        for (const course of this.courses) {

            const groupCount = course.prereqs.length;

            this.remainingGroups.set(course, groupCount);
            this.groupSatisfied.set(course, new Array(groupCount).fill(false));

            if (!this.satisfiesMap.has(course)) {
                this.satisfiesMap.set(course, []);
            }


            course.prereqs.forEach(async (group, i: number) => {
                for (const prereqCourse of group.courses) {
                    const resolvedPrereqCourse = await this.courseRepository.findByCourseCode(prereqCourse);

                    if (resolvedPrereqCourse === null) {
                        throw new Error(`Prerequisite course ${prereqCourse} not found in repository.`);
                    } else {
                        this.addReverseDependency(resolvedPrereqCourse, course, i);
                    }
                }
            });

            if (groupCount === 0) {
            this.available.add(course);
            }

        }
    }

    private addReverseDependency(
        prereq: Course,
        target: Course,
        groupIndex: number
        ): void {

        if (!this.satisfiesMap.has(prereq)) {
            this.satisfiesMap.set(prereq, []);
        }

        this.satisfiesMap.get(prereq)!.push({
            target,
            groupIndex
        });
    }

    private buildSemester(): Course[] {

        let semester: Course[] = [];
        let creditsUsed = 0;

        const candidates = this.getAvailableCoursesSorted();

        for (const course of candidates) {

            if (this.completed.has(course)) continue;

            if (creditsUsed + course.credits > this.maxCreditsPerSemester) {
            continue;
            }

            semester.push(course);
            creditsUsed += course.credits;
        }

        return semester;
    }

    private getAvailableCoursesSorted(): Course[] {
        return Array.from(this.available)
            .filter(c => !this.completed.has(c))
            // .sort((a, b) =>
            // (this.satisfiesMap.get(b)?.length ?? 0) -
            // (this.satisfiesMap.get(a)?.length ?? 0)
            // );
            // .sort((a, b) =>
            //     (this.depth.get(b)! - this.depth.get(a)!)
            // );
            .sort((a, b) => {
                const urgencyDiff =
                    this.urgencyScore(b) - this.urgencyScore(a);

                if (urgencyDiff !== 0) return urgencyDiff;

                return this.depth.get(b)! - this.depth.get(a)!;
            });
    }

    private completeSemester(semester: Course[]): void {

        for (const course of semester) {
            this.completed.add(course);
            this.available.delete(course);
            this.updateUnlockedCourses(course);
        }
    }

    private updateUnlockedCourses(completedCourse: Course): void {

        const unlocks = this.satisfiesMap.get(completedCourse) ?? [];

        for (const { target, groupIndex } of unlocks) {

            const satisfied = this.groupSatisfied.get(target)!;

            if (!satisfied[groupIndex]) {

            satisfied[groupIndex] = true;

            const remaining = this.remainingGroups.get(target)! - 1;
            this.remainingGroups.set(target, remaining);

            if (remaining === 0) {
                this.available.add(target);
            }
            }
        }
    }

    private computeDepths(): void {

        const memo = new Map<Course, number>();
        const visiting = new Set<Course>();

        const dfs = (course: Course): number => {

            if (memo.has(course)) return memo.get(course)!;

            if (visiting.has(course)) {
                throw new Error("Cycle detected in prerequisites.");
            }

            visiting.add(course);

            const unlocks = this.satisfiesMap.get(course) ?? [];

            let maxDepth = 0;

            for (const { target } of unlocks) {
            maxDepth = Math.max(maxDepth, 1 + dfs(target));
            }

            visiting.delete(course);
            memo.set(course, maxDepth);

            return maxDepth;
        };

        for (const course of this.courses) {
            this.depth.set(course, dfs(course));
        }
    }


    private urgencyScore(course: Course): number {

        let score = 0;

        const unlocks = this.satisfiesMap.get(course) ?? [];

        for (const { target, groupIndex } of unlocks) {

            const group = target.prereqs[groupIndex];
            const remaining = this.remainingGroups.get(target)!;

            // smaller OR groups = more urgent
            if (group == undefined) {
                throw new Error("Group index out of bounds for course prerequisites.");
            }
            const groupSize = group.courses.length || 1;

            score += 1 / groupSize;

            // finishing the last group is especially valuable
            if (remaining === 1) {
            score += 2;
            }
        }

        return score;
    }

    private allCoursesCompleted(): boolean {
        return this.completed.size === this.courses.length;
    }


}