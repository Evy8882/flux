import type { Request, Response } from "express";
import { Types } from "mongoose";
import { TransactionModel } from "../db/models.js";
import type { TransactionType } from "../db/models.js";

// ─── GET /api/transactions ────────────────────────────────────────────────────
// Query params opcionais: mes, ano, tipo

export async function listTransactions(req: Request, res: Response): Promise<void> {
  const { userId } = req.user!;
  const { mes, ano, tipo } = req.query as {
    mes?: string;
    ano?: string;
    tipo?: string;
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filter: Record<string, any> = { userId };

  if (mes || ano) {
    const year = ano ? parseInt(ano, 10) : new Date().getFullYear();
    if (mes) {
      const month = parseInt(mes, 10);
      const start = new Date(Date.UTC(year, month - 1, 1));
      const end = new Date(Date.UTC(year, month, 1));
      filter["date"] = { $gte: start, $lt: end };
    } else {
      const start = new Date(Date.UTC(year, 0, 1));
      const end = new Date(Date.UTC(year + 1, 0, 1));
      filter["date"] = { $gte: start, $lt: end };
    }
  }

  if (tipo === "receita" || tipo === "despesa") {
    filter["type"] = tipo;
  }

  const transactions = await TransactionModel.find(filter).sort({ date: -1 });

  res.json(
    transactions.map((t) => ({
      id: t._id.toString(),
      userId: t.userId.toString(),
      categoryId: t.categoryId.toString(),
      type: t.type,
      amount: t.amount,
      description: t.description,
      date: t.date,
      createdAt: t.createdAt,
    }))
  );
}

// ─── POST /api/transactions ───────────────────────────────────────────────────

export async function createTransaction(req: Request, res: Response): Promise<void> {
  const { userId } = req.user!;
  const { categoryId, type, amount, description, date } = req.body as {
    categoryId?: string;
    type?: TransactionType;
    amount?: number;
    description?: string;
    date?: string;
  };

  if (!categoryId || !type || amount === undefined || !description || !date) {
    res.status(400).json({
      error:
        "Os campos categoryId, type, amount, description e date são obrigatórios.",
    });
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

  if (!Types.ObjectId.isValid(categoryId)) {
    res.status(400).json({ error: "categoryId inválido." });
    return;
  }

  const transaction = await TransactionModel.create({
    userId: new Types.ObjectId(userId),
    categoryId: new Types.ObjectId(categoryId),
    type,
    amount,
    description,
    date: new Date(date),
  });

  res.status(201).json({
    id: transaction._id.toString(),
    userId: transaction.userId.toString(),
    categoryId: transaction.categoryId.toString(),
    type: transaction.type,
    amount: transaction.amount,
    description: transaction.description,
    date: transaction.date,
    createdAt: transaction.createdAt,
  });
}

// ─── GET /api/transactions/:id ────────────────────────────────────────────────

export async function getTransaction(req: Request, res: Response): Promise<void> {
  const { userId } = req.user!;
  const { id } = req.params as { id: string };

  if (!Types.ObjectId.isValid(id)) {
    res.status(404).json({ error: "Transação não encontrada." });
    return;
  }

  const transaction = await TransactionModel.findOne({ _id: id, userId });

  if (!transaction) {
    res.status(404).json({ error: "Transação não encontrada." });
    return;
  }

  res.json({
    id: transaction._id.toString(),
    userId: transaction.userId.toString(),
    categoryId: transaction.categoryId.toString(),
    type: transaction.type,
    amount: transaction.amount,
    description: transaction.description,
    date: transaction.date,
    createdAt: transaction.createdAt,
  });
}

// ─── PUT /api/transactions/:id ────────────────────────────────────────────────

export async function updateTransaction(req: Request, res: Response): Promise<void> {
  const { userId } = req.user!;
  const { id } = req.params as { id: string };
  const { categoryId, type, amount, description, date } = req.body as {
    categoryId?: string;
    type?: TransactionType;
    amount?: number;
    description?: string;
    date?: string;
  };

  if (!Types.ObjectId.isValid(id)) {
    res.status(404).json({ error: "Transação não encontrada." });
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const patch: Record<string, any> = {};
  if (categoryId) patch["categoryId"] = new Types.ObjectId(categoryId);
  if (type) patch["type"] = type;
  if (amount !== undefined) patch["amount"] = amount;
  if (description) patch["description"] = description;
  if (date) patch["date"] = new Date(date);

  const updated = await TransactionModel.findOneAndUpdate(
    { _id: id, userId },
    patch,
    { new: true }
  );

  if (!updated) {
    res.status(404).json({ error: "Transação não encontrada." });
    return;
  }

  res.json({
    id: updated._id.toString(),
    userId: updated.userId.toString(),
    categoryId: updated.categoryId.toString(),
    type: updated.type,
    amount: updated.amount,
    description: updated.description,
    date: updated.date,
    createdAt: updated.createdAt,
  });
}

// ─── DELETE /api/transactions/:id ─────────────────────────────────────────────

export async function deleteTransaction(req: Request, res: Response): Promise<void> {
  const { userId } = req.user!;
  const { id } = req.params as { id: string };

  if (!Types.ObjectId.isValid(id)) {
    res.status(404).json({ error: "Transação não encontrada." });
    return;
  }

  const result = await TransactionModel.deleteOne({ _id: id, userId });

  if (result.deletedCount === 0) {
    res.status(404).json({ error: "Transação não encontrada." });
    return;
  }

  res.status(204).send();
}
