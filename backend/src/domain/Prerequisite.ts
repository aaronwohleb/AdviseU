import { Course } from "./Course";

export class Prerequisite {
  courses: string[];
  constructor(courses: string[]) {
    this.courses = courses;
  }
}
