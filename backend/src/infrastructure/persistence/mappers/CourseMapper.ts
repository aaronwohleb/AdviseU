import { Course } from "../../../domain/Course";
import { Prerequisite } from "../../../domain/Prerequisite";

export class CourseMapper {
  static toDomain(doc: any): Course {
    let prereqs: Prerequisite[] = [];

    for (let i = 0; i < doc.prereqs.length; i++) {
      const courses = doc.prereqs[i].courses;
      prereqs.push(new Prerequisite(courses));
    }

    return new Course(doc._id, prereqs, doc.credits ?? 0);
  }
}
