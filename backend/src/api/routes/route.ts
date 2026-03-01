import { Router } from "express";
import Controller from "../controllers/controller";
import { PlanRequestPayload } from "../../dtos/PlanRequest.dto";
import { MongoMajorRepository } from "../../infrastructure/persistence/repositories/MongoMajorRepository";
import { IMajorRepository } from "../../domain/repositories/IMajorRepository";
import { ICourseRepository } from "../../domain/repositories/ICourseRepository";

export default function createRouter(majorRepository: IMajorRepository, courseRepository: ICourseRepository): Router {
    const router = Router();
    const controller = new Controller(majorRepository, courseRepository);

    router.post('/generate', async (req, res, next) => {
        try {
            const payload = req.body as PlanRequestPayload;
            
            // Wait for the controller to finish its work
            const result = await controller.generatePlan(payload);
            
            res.status(200).json(result);
        } catch (error) {
            // Pass errors to your global error handler
            next(error);
        }
    });

    router.get('/health', async (req, res) => {
        res.status(200).json({ status: "OK" });
    });
    return router;
}