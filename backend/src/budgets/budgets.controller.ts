import type { Request, Response } from "express";
import { Types } from "mongoose";
import { OrcamentoModel } from "../db/models.js";

// ─── GET /api/budgets ─────────────────────────────────────────────────────────
// Query param opcional: mesAno (ex: "2026-11")

export async function listBudgets(req: Request, res: Response): Promise<void> {
  const { userId } = req.user!;
  const { mesAno } = req.query as { mesAno?: string };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filter: Record<string, any> = { usuarioId: new Types.ObjectId(userId) };

  if (mesAno) {
    filter["mesAno"] = mesAno;
  }

  const budgets = await OrcamentoModel.find(filter).sort({ createdAt: -1 });

  res.json(
    budgets.map((b) => ({
      id: b._id.toString(),
      userId: b.usuarioId.toString(),
      categoryId: b.categoriaId.toString(),
      limit: b.limite,
      monthYear: b.mesAno,
      createdAt: b.createdAt,
    }))
  );
}

// ─── POST /api/budgets ────────────────────────────────────────────────────────

export async function createBudget(req: Request, res: Response): Promise<void> {
  const { userId } = req.user!;
  const { categoryId, limit, monthYear } = req.body as {
    categoryId?: string;
    limit?: number;
    monthYear?: string;
  };

  if (!categoryId || limit === undefined || !monthYear) {
    res.status(400).json({
      error: "Os campos categoryId, limit e monthYear são obrigatórios.",
    });
    return;
  }

  if (!Types.ObjectId.isValid(categoryId)) {
    res.status(400).json({ error: "categoryId inválido." });
    return;
  }

  if (typeof limit !== "number" || limit <= 0) {
    res.status(400).json({ error: "limit deve ser um número positivo." });
    return;
  }

  // Validar formato mesAno: YYYY-MM
  if (!/^\d{4}-\d{2}$/.test(monthYear)) {
    res.status(400).json({ error: "monthYear deve estar no formato YYYY-MM (ex: 2026-11)." });
    return;
  }

  const budget = await OrcamentoModel.create({
    usuarioId: new Types.ObjectId(userId),
    categoriaId: new Types.ObjectId(categoryId),
    limite: limit,
    mesAno: monthYear,
  });

  res.status(201).json({
    id: budget._id.toString(),
    userId: budget.usuarioId.toString(),
    categoryId: budget.categoriaId.toString(),
    limit: budget.limite,
    monthYear: budget.mesAno,
    createdAt: budget.createdAt,
  });
}

// ─── GET /api/budgets/:id ─────────────────────────────────────────────────────

export async function getBudget(req: Request, res: Response): Promise<void> {
  const { userId } = req.user!;
  const { id } = req.params as { id: string };

  if (!Types.ObjectId.isValid(id)) {
    res.status(404).json({ error: "Orçamento não encontrado." });
    return;
  }

  const budget = await OrcamentoModel.findOne({ _id: id, usuarioId: new Types.ObjectId(userId) });

  if (!budget) {
    res.status(404).json({ error: "Orçamento não encontrado." });
    return;
  }

  res.json({
    id: budget._id.toString(),
    userId: budget.usuarioId.toString(),
    categoryId: budget.categoriaId.toString(),
    limit: budget.limite,
    monthYear: budget.mesAno,
    createdAt: budget.createdAt,
  });
}

// ─── PUT /api/budgets/:id ─────────────────────────────────────────────────────

export async function updateBudget(req: Request, res: Response): Promise<void> {
  const { userId } = req.user!;
  const { id } = req.params as { id: string };
  const { categoryId, limit, monthYear } = req.body as {
    categoryId?: string;
    limit?: number;
    monthYear?: string;
  };

  if (!Types.ObjectId.isValid(id)) {
    res.status(404).json({ error: "Orçamento não encontrado." });
    return;
  }

  if (categoryId && !Types.ObjectId.isValid(categoryId)) {
    res.status(400).json({ error: "categoryId inválido." });
    return;
  }

  if (limit !== undefined && (typeof limit !== "number" || limit <= 0)) {
    res.status(400).json({ error: "limit deve ser um número positivo." });
    return;
  }

  if (monthYear && !/^\d{4}-\d{2}$/.test(monthYear)) {
    res.status(400).json({ error: "monthYear deve estar no formato YYYY-MM (ex: 2026-11)." });
    return;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const patch: Record<string, any> = {};
  if (categoryId) patch["categoriaId"] = new Types.ObjectId(categoryId);
  if (limit !== undefined) patch["limite"] = limit;
  if (monthYear) patch["mesAno"] = monthYear;

  const updated = await OrcamentoModel.findOneAndUpdate(
    { _id: id, usuarioId: new Types.ObjectId(userId) },
    patch,
    { new: true }
  );

  if (!updated) {
    res.status(404).json({ error: "Orçamento não encontrado." });
    return;
  }

  res.json({
    id: updated._id.toString(),
    userId: updated.usuarioId.toString(),
    categoryId: updated.categoriaId.toString(),
    limit: updated.limite,
    monthYear: updated.mesAno,
    createdAt: updated.createdAt,
  });
}

// ─── DELETE /api/budgets/:id ──────────────────────────────────────────────────

export async function deleteBudget(req: Request, res: Response): Promise<void> {
  const { userId } = req.user!;
  const { id } = req.params as { id: string };

  if (!Types.ObjectId.isValid(id)) {
    res.status(404).json({ error: "Orçamento não encontrado." });
    return;
  }

  const result = await OrcamentoModel.deleteOne({ _id: id, usuarioId: new Types.ObjectId(userId) });

  if (result.deletedCount === 0) {
    res.status(404).json({ error: "Orçamento não encontrado." });
    return;
  }

  res.status(204).send();
}
