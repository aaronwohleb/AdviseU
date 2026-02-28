import { Requirement } from "./Requirement";

export class Track {
  reqs: Requirement[];
  name: string;
  college: string;

  constructor(reqs: Requirement[], name: string, college: string) {
    this.reqs = reqs;
    this.name = name;
    this.college = college;
  }
}
