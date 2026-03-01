import { Course } from "../../../domain/Course";
import { Prerequisite } from "../../../domain/Prerequisite";

export class CourseMapper {
  // Requires populated prereqs:
  // CourseModel.findById(id).populate("prereqs.courses")
  static toDomain(doc: any): Course {
    const prereqs: Prerequisite[] = Array.isArray(doc.prereqs)
      ? doc.prereqs.map(
          (p: any) =>
            new Prerequisite(
              p.courses.map((c: any) => CourseMapper.toDomain(c)),
            ),
        )
      : [];

    return new Course(doc._id, doc.major ?? "", prereqs, doc.credits ?? 0);
  }

  static toPersistence(course: Course): Record<string, unknown> {
    return {
      _id: course.coursecode,
      major: course.major,
      prereqs: course.prereqs.map((p: Prerequisite) => ({
        courses: p.courses.map((c: Course) => c.coursecode),
      })),
      credits: course.credits,
    };
  }
}
