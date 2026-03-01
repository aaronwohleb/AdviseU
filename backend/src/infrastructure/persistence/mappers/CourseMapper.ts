import { Course } from "../../../domain/Course";
import { Prerequisite } from "../../../domain/Prerequisite";

export class CourseMapper {
  static toDomain(doc: any): Course {
    let prereqs: Prerequisite[];

    for (let i = 0; i < doc.prereqs.length; i++) {
      const courses = doc.prereqs[i].courses;
      for (let j = 0; j < courses.length; j++) {}
    }

    return new Course(doc._id, prereqs, doc.credits ?? 0);
  }
}
