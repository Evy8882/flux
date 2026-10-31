import type { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { readData, writeData } from "../db/db.js";
import type { Category } from "../types.js";

// ─── GET /api/categories ──────────────────────────────────────────────────────

export function listCategories(req: Request, res: Response): void {
  const { userId } = req.user!;
  const categories = readData<Category>("categories");
  const userCategories = categories.filter((c) => c.userId === userId);
  res.json(userCategories);
}

// ─── POST /api/categories ─────────────────────────────────────────────────────

export function createCategory(req: Request, res: Response): void {
  const { userId } = req.user!;
  const { name, color, icon } = req.body as {
    name?: string;
    color?: string;
    icon?: string;
  };

  if (!name) {
    res.status(400).json({ error: "O campo name é obrigatório." });
    return;
  }

  const categories = readData<Category>("categories");

  const newCategory: Category = {
    id: uuidv4(),
    userId,
    name,
    color: color ?? "#6366f1",
    icon: icon ?? "tag",
    createdAt: new Date().toISOString(),
  };

  categories.push(newCategory);
  writeData("categories", categories);

  res.status(201).json(newCategory);
}

// ─── PUT /api/categories/:id ──────────────────────────────────────────────────

export function updateCategory(req: Request, res: Response): void {
  const { userId } = req.user!;
  const { id } = req.params as { id: string };
  const { name, color, icon } = req.body as {
    name?: string;
    color?: string;
    icon?: string;
  };

  const categories = readData<Category>("categories");
  const index = categories.findIndex(
    (c) => c.id === id && c.userId === userId
  );

  if (index === -1) {
    res.status(404).json({ error: "Categoria não encontrada." });
    return;
  }

  const updated: Category = {
    ...categories[index]!,
    name: name ?? categories[index]!.name,
    color: color ?? categories[index]!.color,
    icon: icon ?? categories[index]!.icon,
  };

  categories[index] = updated;
  writeData("categories", categories);

  res.json(updated);
}

// ─── DELETE /api/categories/:id ───────────────────────────────────────────────

export function deleteCategory(req: Request, res: Response): void {
  const { userId } = req.user!;
  const { id } = req.params as { id: string };

  const categories = readData<Category>("categories");
  const filtered = categories.filter(
    (c) => !(c.id === id && c.userId === userId)
  );

  if (filtered.length === categories.length) {
    res.status(404).json({ error: "Categoria não encontrada." });
    return;
  }

  writeData("categories", filtered);
  res.status(204).send();
}
