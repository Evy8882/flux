import type { Request, Response } from "express";
import { Types } from "mongoose";
import { CategoriaModel } from "../db/models.js";

// ─── GET /api/categories ──────────────────────────────────────────────────────

export async function listCategories(req: Request, res: Response): Promise<void> {
  const { userId } = req.user!;

  const categories = await CategoriaModel.find({
    usuarioId: new Types.ObjectId(userId),
  }).sort({ createdAt: 1 });

  res.json(
    categories.map((c) => ({
      id: c._id.toString(),
      userId: c.usuarioId.toString(),
      name: c.nome,
      color: c.cor,
      icon: c.icone,
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

  const category = await CategoriaModel.create({
    usuarioId: new Types.ObjectId(userId),
    nome: name,
    cor: color ?? "#6366f1",
    icone: icon ?? "tag",
  });

  res.status(201).json({
    id: category._id.toString(),
    userId: category.usuarioId.toString(),
    name: category.nome,
    color: category.cor,
    icon: category.icone,
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

  const updated = await CategoriaModel.findOneAndUpdate(
    { _id: id, usuarioId: new Types.ObjectId(userId) },
    {
      ...(name && { nome: name }),
      ...(color && { cor: color }),
      ...(icon && { icone: icon }),
    },
    { new: true }
  );

  if (!updated) {
    res.status(404).json({ error: "Categoria não encontrada." });
    return;
  }

  res.json({
    id: updated._id.toString(),
    userId: updated.usuarioId.toString(),
    name: updated.nome,
    color: updated.cor,
    icon: updated.icone,
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

  const result = await CategoriaModel.deleteOne({
    _id: id,
    usuarioId: new Types.ObjectId(userId),
  });

  if (result.deletedCount === 0) {
    res.status(404).json({ error: "Categoria não encontrada." });
    return;
  }

  res.status(204).send();
}
