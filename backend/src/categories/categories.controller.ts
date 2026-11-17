import type { Request, Response } from "express";
import { Types } from "mongoose";
import { CategoryModel } from "../db/models.js";

// ─── GET /api/categories ──────────────────────────────────────────────────────

export async function listCategories(req: Request, res: Response): Promise<void> {
  const { userId } = req.user!;

  const categories = await CategoryModel.find({ userId }).sort({ createdAt: 1 });

  res.json(
    categories.map((c) => ({
      id: c._id.toString(),
      userId: c.userId.toString(),
      name: c.name,
      color: c.color,
      icon: c.icon,
      createdAt: c.createdAt,
    }))
  );
}

// ─── POST /api/categories ─────────────────────────────────────────────────────

export async function createCategory(req: Request, res: Response): Promise<void> {
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

  const category = await CategoryModel.create({
    userId: new Types.ObjectId(userId),
    name,
    color: color ?? "#6366f1",
    icon: icon ?? "tag",
  });

  res.status(201).json({
    id: category._id.toString(),
    userId: category.userId.toString(),
    name: category.name,
    color: category.color,
    icon: category.icon,
    createdAt: category.createdAt,
  });
}

// ─── PUT /api/categories/:id ──────────────────────────────────────────────────

export async function updateCategory(req: Request, res: Response): Promise<void> {
  const { userId } = req.user!;
  const { id } = req.params as { id: string };
  const { name, color, icon } = req.body as {
    name?: string;
    color?: string;
    icon?: string;
  };

  if (!Types.ObjectId.isValid(id)) {
    res.status(404).json({ error: "Categoria não encontrada." });
    return;
  }

  const updated = await CategoryModel.findOneAndUpdate(
    { _id: id, userId },
    { ...(name && { name }), ...(color && { color }), ...(icon && { icon }) },
    { new: true }
  );

  if (!updated) {
    res.status(404).json({ error: "Categoria não encontrada." });
    return;
  }

  res.json({
    id: updated._id.toString(),
    userId: updated.userId.toString(),
    name: updated.name,
    color: updated.color,
    icon: updated.icon,
    createdAt: updated.createdAt,
  });
}

// ─── DELETE /api/categories/:id ───────────────────────────────────────────────

export async function deleteCategory(req: Request, res: Response): Promise<void> {
  const { userId } = req.user!;
  const { id } = req.params as { id: string };

  if (!Types.ObjectId.isValid(id)) {
    res.status(404).json({ error: "Categoria não encontrada." });
    return;
  }

  const result = await CategoryModel.deleteOne({ _id: id, userId });

  if (result.deletedCount === 0) {
    res.status(404).json({ error: "Categoria não encontrada." });
    return;
  }

  res.status(204).send();
}
