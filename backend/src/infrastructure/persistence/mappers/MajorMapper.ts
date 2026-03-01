import { Major } from "../../../domain/Major";
import { Track } from "../../../domain/Track";
import { Requirement } from "../../../domain/Requirement";
import { Course } from "../../../domain/Course";
import { CourseMapper } from "./CourseMapper";

export class MajorMapper {
  // Requires populated courses within reqs and tracks:
  // MajorModel.findById(id)
  //   .populate("reqs.courses")
  //   .populate("tracks.reqs.courses")
  static toDomain(doc: any): Major {
    const reqs: Requirement[] = MajorMapper.mapRequirements(doc.reqs);
    const tracks: Track[] = MajorMapper.mapTracks(doc.tracks);
    return new Major(tracks, reqs, doc.name ?? "", doc.college ?? "");
  }

  // ---------- private helpers ----------

  private static mapRequirements(rawReqs: any[]): Requirement[] {
    if (!Array.isArray(rawReqs)) return [];
    return rawReqs.map((req: any) => {
      const courses = Array.isArray(req.courses)
        ? req.courses.map((c: any) => CourseMapper.toDomain(c))
        : [];
      return new Requirement(courses, req.num ?? 0);
    });
  }

  private static mapTracks(rawTracks: any[]): Track[] {
    if (!Array.isArray(rawTracks)) return [];
    return rawTracks.map((track: any) => {
      const reqs = MajorMapper.mapRequirements(track.reqs);
      return new Track(reqs, track.name ?? "", track.college ?? "");
    });
  }
}
