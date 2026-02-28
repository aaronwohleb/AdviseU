import { Course } from "./Course";

export class Prerequisite {
  courses: Course[];
  constructor(courses: Course[]) {
    this.courses = courses;
  }
}
