import { Router } from "express";
import { authMiddleware } from "../auth/auth.middleware.js";
import { getSummary } from "./dashboard.controller.js";

const router = Router();

// GET /api/dashboard/summary   ?mes=10&ano=2026
router.get("/summary", authMiddleware, getSummary);

export default router;
