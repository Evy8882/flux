import type { Request, Response } from "express";
import { Types } from "mongoose";
import { MetaModel } from "../db/models.js";

// ─── GET /api/goals ───────────────────────────────────────────────────────────

export async function listGoals(req: Request, res: Response): Promise<void> {
  const { userId } = req.user!;

  const goals = await MetaModel.find({ usuarioId: new Types.ObjectId(userId) }).sort({ createdAt: -1 });

  res.json(
    goals.map((g) => ({
      id: g._id.toString(),
      userId: g.usuarioId.toString(),
      title: g.titulo,
      targetAmount: g.valorAlvo,
      currentAmount: g.valorAtual,
      deadline: g.dataLimite,
      createdAt: g.createdAt,
    }))
  );
}

// ─── POST /api/goals ──────────────────────────────────────────────────────────

export async function createGoal(req: Request, res: Response): Promise<void> {
  const { userId } = req.user!;
  const { title, targetAmount, currentAmount, deadline } = req.body as {
    title?: string;
    targetAmount?: number;
    currentAmount?: number;
    deadline?: string;
  };

  if (!title || targetAmount === undefined || !deadline) {
    res.status(400).json({
      error: "Os campos title, targetAmount e deadline são obrigatórios.",
    });
    return;
  }

  if (typeof targetAmount !== "number" || targetAmount <= 0) {
    res.status(400).json({ error: "targetAmount deve ser um número positivo." });
    return;
  }

  if (currentAmount !== undefined && (typeof currentAmount !== "number" || currentAmount < 0)) {
    res.status(400).json({ error: "currentAmount deve ser um número não-negativo." });
    return;
  }

  const goal = await MetaModel.create({
    usuarioId: new Types.ObjectId(userId),
    titulo: title,
    valorAlvo: targetAmount,
    valorAtual: currentAmount ?? 0,
    dataLimite: new Date(deadline),
  });

  res.status(201).json({
    id: goal._id.toString(),
    userId: goal.usuarioId.toString(),
    title: goal.titulo,
    targetAmount: goal.valorAlvo,
    currentAmount: goal.valorAtual,
    deadline: goal.dataLimite,
    createdAt: goal.createdAt,
  });
}

// ─── GET /api/goals/:id ───────────────────────────────────────────────────────

export async function getGoal(req: Request, res: Response): Promise<void> {
  const { userId } = req.user!;
  const { id } = req.params as { id: string };

  if (!Types.ObjectId.isValid(id)) {
    res.status(404).json({ error: "Meta não encontrada." });
    return;
  }

  const goal = await MetaModel.findOne({ _id: id, usuarioId: new Types.ObjectId(userId) });

  if (!goal) {
    res.status(404).json({ error: "Meta não encontrada." });
    return;
  }

  res.json({
    id: goal._id.toString(),
    userId: goal.usuarioId.toString(),
    title: goal.titulo,
    targetAmount: goal.valorAlvo,
    currentAmount: goal.valorAtual,
    deadline: goal.dataLimite,
    createdAt: goal.createdAt,
  });
}

// ─── PUT /api/goals/:id ───────────────────────────────────────────────────────

export async function updateGoal(req: Request, res: Response): Promise<void> {
  const { userId } = req.user!;
  const { id } = req.params as { id: string };
  const { title, targetAmount, currentAmount, deadline } = req.body as {
    title?: string;
    targetAmount?: number;
    currentAmount?: number;
    deadline?: string;
  };

  if (!Types.ObjectId.isValid(id)) {
    res.status(404).json({ error: "Meta não encontrada." });
    return;
  }

  if (targetAmount !== undefined && (typeof targetAmount !== "number" || targetAmount <= 0)) {
    res.status(400).json({ error: "targetAmount deve ser um número positivo." });
    return;
  }

  if (currentAmount !== undefined && (typeof currentAmount !== "number" || currentAmount < 0)) {
    res.status(400).json({ error: "currentAmount deve ser um número não-negativo." });
    return;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const patch: Record<string, any> = {};
  if (title) patch["titulo"] = title;
  if (targetAmount !== undefined) patch["valorAlvo"] = targetAmount;
  if (currentAmount !== undefined) patch["valorAtual"] = currentAmount;
  if (deadline) patch["dataLimite"] = new Date(deadline);

  const updated = await MetaModel.findOneAndUpdate(
    { _id: id, usuarioId: new Types.ObjectId(userId) },
    patch,
    { new: true }
  );

  if (!updated) {
    res.status(404).json({ error: "Meta não encontrada." });
    return;
  }

  res.json({
    id: updated._id.toString(),
    userId: updated.usuarioId.toString(),
    title: updated.titulo,
    targetAmount: updated.valorAlvo,
    currentAmount: updated.valorAtual,
    deadline: updated.dataLimite,
    createdAt: updated.createdAt,
  });
}

// ─── DELETE /api/goals/:id ────────────────────────────────────────────────────

export async function deleteGoal(req: Request, res: Response): Promise<void> {
  const { userId } = req.user!;
  const { id } = req.params as { id: string };

  if (!Types.ObjectId.isValid(id)) {
    res.status(404).json({ error: "Meta não encontrada." });
    return;
  }

  const result = await MetaModel.deleteOne({ _id: id, usuarioId: new Types.ObjectId(userId) });

  if (result.deletedCount === 0) {
    res.status(404).json({ error: "Meta não encontrada." });
    return;
  }

  res.status(204).send();
}
