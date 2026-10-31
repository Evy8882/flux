import { Router } from "express";
import { authMiddleware } from "../auth/auth.middleware.js";
import {
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "./categories.controller.js";

const router = Router();

// Todas as rotas de categorias requerem autenticação
router.use(authMiddleware);

// GET    /api/categories
router.get("/", listCategories);

// POST   /api/categories
router.post("/", createCategory);

// PUT    /api/categories/:id
router.put("/:id", updateCategory);

// DELETE /api/categories/:id
router.delete("/:id", deleteCategory);

export default router;
