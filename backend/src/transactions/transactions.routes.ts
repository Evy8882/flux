import { Router } from "express";
import { authMiddleware } from "../auth/auth.middleware.js";
import {
  listTransactions,
  createTransaction,
  getTransaction,
  updateTransaction,
  deleteTransaction,
} from "./transactions.controller.js";

const router = Router();

// Todas as rotas de transações requerem autenticação
router.use(authMiddleware);

// GET    /api/transactions          ?mes=10&ano=2026&tipo=despesa
router.get("/", listTransactions);

// POST   /api/transactions
router.post("/", createTransaction);

// GET    /api/transactions/:id
router.get("/:id", getTransaction);

// PUT    /api/transactions/:id
router.put("/:id", updateTransaction);

// DELETE /api/transactions/:id
router.delete("/:id", deleteTransaction);

export default router;
