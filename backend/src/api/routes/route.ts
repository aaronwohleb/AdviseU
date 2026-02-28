import { Router } from "express";

export default function createRouter(): Router {
    const router = Router();

    router.post('/generate', async (req, res) => {
        
    });

    router.get('/health', async (req, res) => {
        res.status(200).json({ status: "OK" });
    });
    return router;
}