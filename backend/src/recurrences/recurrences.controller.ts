import type { Request, Response } from "express";
import { Types } from "mongoose";
import { RecorrenciaModel } from "../db/models.js";
import type { TipoTransacao } from "../db/models.js";

type Frequencia = "mensal" | "anual" | "semanal";

// ─── GET /api/recurrences ─────────────────────────────────────────────────────

export async function listRecurrences(req: Request, res: Response): Promise<void> {
  const { userId } = req.user!;

  const recurrences = await RecorrenciaModel.find({
    usuarioId: new Types.ObjectId(userId),
  }).sort({ proximaData: 1 });

  res.json(
    recurrences.map((r) => ({
      id: r._id.toString(),
      userId: r.usuarioId.toString(),
      categoryId: r.categoriaId.toString(),
      type: r.tipo,
      amount: r.valor,
      description: r.descricao,
      frequency: r.frequencia,
      nextDate: r.proximaData,
      createdAt: r.createdAt,
    }))
  );
}

// ─── POST /api/recurrences ────────────────────────────────────────────────────

export async function createRecurrence(req: Request, res: Response): Promise<void> {
  const { userId } = req.user!;
  const { categoryId, type, amount, description, frequency, nextDate } = req.body as {
    categoryId?: string;
    type?: TipoTransacao;
    amount?: number;
    description?: string;
    frequency?: Frequencia;
    nextDate?: string;
  };

  if (!categoryId || !type || amount === undefined || !description || !frequency || !nextDate) {
    res.status(400).json({
      error:
        "Os campos categoryId, type, amount, description, frequency e nextDate são obrigatórios.",
    });
    return;
  }

  if (!Types.ObjectId.isValid(categoryId)) {
    res.status(400).json({ error: "categoryId inválido." });
    return;
  }

  if (type !== "receita" && type !== "despesa") {
    res.status(400).json({ error: "type deve ser 'receita' ou 'despesa'." });
    return;
  }

  if (typeof amount !== "number" || amount <= 0) {
    res.status(400).json({ error: "amount deve ser um número positivo." });
    return;
  }

  const validFrequencies: Frequencia[] = ["mensal", "anual", "semanal"];
  if (!validFrequencies.includes(frequency)) {
    res.status(400).json({ error: "frequency deve ser 'mensal', 'anual' ou 'semanal'." });
    return;
  }

  const recurrence = await RecorrenciaModel.create({
    usuarioId: new Types.ObjectId(userId),
    categoriaId: new Types.ObjectId(categoryId),
    tipo: type,
    valor: amount,
    descricao: description,
    frequencia: frequency,
    proximaData: new Date(nextDate),
  });

  res.status(201).json({
    id: recurrence._id.toString(),
    userId: recurrence.usuarioId.toString(),
    categoryId: recurrence.categoriaId.toString(),
    type: recurrence.tipo,
    amount: recurrence.valor,
    description: recurrence.descricao,
    frequency: recurrence.frequencia,
    nextDate: recurrence.proximaData,
    createdAt: recurrence.createdAt,
  });
}

// ─── GET /api/recurrences/:id ─────────────────────────────────────────────────

export async function getRecurrence(req: Request, res: Response): Promise<void> {
  const { userId } = req.user!;
  const { id } = req.params as { id: string };

  if (!Types.ObjectId.isValid(id)) {
    res.status(404).json({ error: "Recorrência não encontrada." });
    return;
  }

  const recurrence = await RecorrenciaModel.findOne({
    _id: id,
    usuarioId: new Types.ObjectId(userId),
  });

  if (!recurrence) {
    res.status(404).json({ error: "Recorrência não encontrada." });
    return;
  }

  res.json({
    id: recurrence._id.toString(),
    userId: recurrence.usuarioId.toString(),
    categoryId: recurrence.categoriaId.toString(),
    type: recurrence.tipo,
    amount: recurrence.valor,
    description: recurrence.descricao,
    frequency: recurrence.frequencia,
    nextDate: recurrence.proximaData,
    createdAt: recurrence.createdAt,
  });
}

// ─── PUT /api/recurrences/:id ─────────────────────────────────────────────────

export async function updateRecurrence(req: Request, res: Response): Promise<void> {
  const { userId } = req.user!;
  const { id } = req.params as { id: string };
  const { categoryId, type, amount, description, frequency, nextDate } = req.body as {
    categoryId?: string;
    type?: TipoTransacao;
    amount?: number;
    description?: string;
    frequency?: Frequencia;
    nextDate?: string;
  };

  if (!Types.ObjectId.isValid(id)) {
    res.status(404).json({ error: "Recorrência não encontrada." });
    return;
  }

  if (categoryId && !Types.ObjectId.isValid(categoryId)) {
    res.status(400).json({ error: "categoryId inválido." });
    return;
  }

  if (type && type !== "receita" && type !== "despesa") {
    res.status(400).json({ error: "type deve ser 'receita' ou 'despesa'." });
    return;
  }

  if (amount !== undefined && (typeof amount !== "number" || amount <= 0)) {
    res.status(400).json({ error: "amount deve ser um número positivo." });
    return;
  }

  const validFrequencies: Frequencia[] = ["mensal", "anual", "semanal"];
  if (frequency && !validFrequencies.includes(frequency)) {
    res.status(400).json({ error: "frequency deve ser 'mensal', 'anual' ou 'semanal'." });
    return;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const patch: Record<string, any> = {};
  if (categoryId) patch["categoriaId"] = new Types.ObjectId(categoryId);
  if (type) patch["tipo"] = type;
  if (amount !== undefined) patch["valor"] = amount;
  if (description) patch["descricao"] = description;
  if (frequency) patch["frequencia"] = frequency;
  if (nextDate) patch["proximaData"] = new Date(nextDate);

  const updated = await RecorrenciaModel.findOneAndUpdate(
    { _id: id, usuarioId: new Types.ObjectId(userId) },
    patch,
    { new: true }
  );

  if (!updated) {
    res.status(404).json({ error: "Recorrência não encontrada." });
    return;
  }

  res.json({
    id: updated._id.toString(),
    userId: updated.usuarioId.toString(),
    categoryId: updated.categoriaId.toString(),
    type: updated.tipo,
    amount: updated.valor,
    description: updated.descricao,
    frequency: updated.frequencia,
    nextDate: updated.proximaData,
    createdAt: updated.createdAt,
  });
}

// ─── DELETE /api/recurrences/:id ──────────────────────────────────────────────

export async function deleteRecurrence(req: Request, res: Response): Promise<void> {
  const { userId } = req.user!;
  const { id } = req.params as { id: string };

  if (!Types.ObjectId.isValid(id)) {
    res.status(404).json({ error: "Recorrência não encontrada." });
    return;
  }

  const result = await RecorrenciaModel.deleteOne({
    _id: id,
    usuarioId: new Types.ObjectId(userId),
  });

  if (result.deletedCount === 0) {
    res.status(404).json({ error: "Recorrência não encontrada." });
    return;
  }

  res.status(204).send();
}
