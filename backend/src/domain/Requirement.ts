import { Course } from "./Course";

export class Requirement {
  courses: Course[]; // List of courses that can satisfy this requirement
  num: number; // How many courses from the list are required to satisfy this requirement

  constructor(courses: Course[], num: number) {
    this.courses = courses;
    this.num = num;
  }
}
