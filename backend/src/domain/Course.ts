import { Prerequisite } from "./Prerequisite";

export class Course {
  coursecode: string;
  //major: string;
  prereqs: Prerequisite[];
  credits: number;

  constructor(
    coursecode: string,
    //major: string,
    prereqs: Prerequisite[],
    credits: number,
  ) {
    this.coursecode = coursecode;
    //this.major = major;
    this.prereqs = prereqs;
    this.credits = credits;
  }
}
