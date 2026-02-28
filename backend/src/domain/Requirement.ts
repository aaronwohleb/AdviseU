import { Course } from "./Course";

export class Requirement {
  courses: Course[];
  num: number;

  constructor(courses: Course[], num: number) {
    this.courses = courses;
    this.num = num;
  }
}
