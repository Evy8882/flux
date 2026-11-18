import { Router } from "express";
import { authMiddleware } from "../auth/auth.middleware.js";
import {
  listBudgets,
  createBudget,
  getBudget,
  updateBudget,
  deleteBudget,
} from "./budgets.controller.js";

const router = Router();

// Todas as rotas de orçamentos requerem autenticação
router.use(authMiddleware);

// GET    /api/budgets          ?mesAno=2026-11
router.get("/", listBudgets);

// POST   /api/budgets
router.post("/", createBudget);

// GET    /api/budgets/:id
router.get("/:id", getBudget);

// PUT    /api/budgets/:id
router.put("/:id", updateBudget);

// DELETE /api/budgets/:id
router.delete("/:id", deleteBudget);

export default router;
