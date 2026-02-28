import { Router } from "express";
import Controller from "../controllers/controller";


export default function createRouter(): Router {
    const router = Router();
    const controller = new Controller();

    router.post('/generate', async (req, res) => {
        res.send(controller.generatePlan(req.body));
    });

    router.get('/health', async (req, res) => {
        res.status(200).json({ status: "OK" });
    });
    return router;
}