import { Prerequisite } from "./Prerequisite";

export class Course {
  coursecode: string;
  major: string;
  prereqs: Prerequisite[];
  credits: number;
}
