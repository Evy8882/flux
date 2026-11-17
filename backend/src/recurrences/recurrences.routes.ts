import { Router } from "express";
import { authMiddleware } from "../auth/auth.middleware.js";
import {
  listRecurrences,
  createRecurrence,
  getRecurrence,
  updateRecurrence,
  deleteRecurrence,
} from "./recurrences.controller.js";

const router = Router();

// Todas as rotas de recorrências requerem autenticação
router.use(authMiddleware);

// GET    /api/recurrences
router.get("/", listRecurrences);

// POST   /api/recurrences
router.post("/", createRecurrence);

// GET    /api/recurrences/:id
router.get("/:id", getRecurrence);

// PUT    /api/recurrences/:id
router.put("/:id", updateRecurrence);

// DELETE /api/recurrences/:id
router.delete("/:id", deleteRecurrence);

export default router;
