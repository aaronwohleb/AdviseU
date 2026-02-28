import { Track } from "./Track";
import { Requirement } from "./Requirement";

export class Major {
  tracks: Track[];
  reqs: Requirement[];
  name: string;
  college: string;

  constructor(tracks: Track[], reqs: Requirement[], name: string, college: string) {
    this.tracks = tracks;
    this.reqs = reqs;
    this.name = name;
    this.college = college;
  }
}
