import { Major } from "../../../domain/Major";
import { Track } from "../../../domain/Track";
import { Requirement } from "../../../domain/Requirement";
import { Course } from "../../../domain/Course";
import { CourseMapper } from "./CourseMapper";
import { MongoCourseRepository } from "../repositories/MongoCourseRepository";

export class MajorMapper {
  static toDomain(doc: any): Major {
    const tracks: Track[] = this.getTracks(doc);
    const reqs: Requirement[] = this.getReqs(doc);

    return new Major(tracks, reqs, doc.name ?? "", doc.college ?? "");
  }

  private static getTracks(doc: any): Track[] {
    let tracks: Track[] = [];

    for (let i = 0; i < doc.tracks.length; i++) {
      let reqs: Requirement[] = [];
      for (let j = 0; j < doc.tracks[i].reqs.length; j++) {
        const courses: string[] = doc.tracks[i].reqs[j].courses;
        let Dcourses: Course[] = [];
        for (let k = 0; k < courses.length; k++) {
          const course = courses[k];
          if (course !== undefined) {
            Dcourses.push(this.getCourseByID(course));
          }
        }
        reqs.push(new Requirement(Dcourses, 1));
      }
      tracks.push(new Track(reqs, doc.tracks[i].name, doc.tracks[i].college));
    }
    return tracks;
  }

  private static getReqs(doc: any): Requirement[] {
    let reqs: Requirement[] = [];
    for (let j = 0; j < doc.reqs.length; j++) {
      const courses: string[] = doc.reqs[j].courses;
      let Dcourses: Course[] = [];
      for (let k = 0; k < courses.length; k++) {
        const course = courses[k];
        if (course !== undefined) {
          Dcourses.push(this.getCourseByID(course));
        }
      }
      reqs.push(new Requirement(Dcourses, 1));
    }
    return reqs;
  }

  //may break things cause a call to database; may return null
  private static getCourseByID(coursename: string): any {
    const m = new MongoCourseRepository();
    return m.findByCourseCode(coursename);
  }
}
