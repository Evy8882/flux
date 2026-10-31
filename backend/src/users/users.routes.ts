import { Router } from "express";
import { authMiddleware } from "../auth/auth.middleware.js";
import { getProfile } from "./users.controller.js";

const router = Router();

// GET /api/users/profile
router.get("/profile", authMiddleware, getProfile);

export default router;
