import { Course } from "../Course";
import { Major } from "../Major";
import { Prerequisite } from "../Prerequisite";
import { Requirement } from "../Requirement";
import { ICourseRepository } from "./ICourseRepository";
import { IMajorRepository } from "./IMajorRepository";

export class MockMajorRepository implements IMajorRepository {

    private majors = new Map<string, Major>();

    constructor(courseRepo: ICourseRepository) {
        // Initialize with some mock data if needed

        const CSCE10 = new Course("CSCE10",[],0);
        const CSCE155A = new Course("CS155A",[],3);

        const prereq1 = new Prerequisite(["CSCE10"]);
        const CSCE156 = new Course("CSCE156",[prereq1],3);
        const CSCE231 = new Course("CSCE231",[],4);
        const CSCE235 = new Course("CSCE235",[],3);
        const CSCE251 = new Course("CSCE251",[],1);
        const CSCE310 = new Course("CSCE310",[],3);
        const CSCE322 = new Course("CSCE322",[],3);
        const CSCE361 = new Course("CSCE361",[],3);

        courseRepo.addCourse(CSCE10);
        courseRepo.addCourse(CSCE155A);
        courseRepo.addCourse(CSCE156);
        courseRepo.addCourse(CSCE231);
        courseRepo.addCourse(CSCE235);
        courseRepo.addCourse(CSCE251);
        courseRepo.addCourse(CSCE310);
        courseRepo.addCourse(CSCE322);
        courseRepo.addCourse(CSCE361);

        const reqList = 
        
        this.majors.set("Computer Science", new Major([], [], "Computer Science", "Engineering"));
    }

    async findByName(name: string): Promise<Major | null> {
        return this.majors.get(name) || null;
    }
}