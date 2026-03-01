import { Major } from "../Major";

export interface IMajorRepository {
    findByName(name: string): Promise<Major | null>;
}