import { Router } from "express";
import { authMiddleware } from "../auth/auth.middleware.js";
import {
  listGoals,
  createGoal,
  getGoal,
  updateGoal,
  deleteGoal,
} from "./goals.controller.js";

const router = Router();

// Todas as rotas de metas requerem autenticação
router.use(authMiddleware);

// GET    /api/goals
router.get("/", listGoals);

// POST   /api/goals
router.post("/", createGoal);

// GET    /api/goals/:id
router.get("/:id", getGoal);

// PUT    /api/goals/:id
router.put("/:id", updateGoal);

// DELETE /api/goals/:id
router.delete("/:id", deleteGoal);

export default router;
