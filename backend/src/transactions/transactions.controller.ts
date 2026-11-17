import type { Request, Response } from "express";
import { Types } from "mongoose";
import { TransacaoModel } from "../db/models.js";
import type { TipoTransacao } from "../db/models.js";

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
  const filter: Record<string, any> = { usuarioId: new Types.ObjectId(userId) };

  if (mes || ano) {
    const year = ano ? parseInt(ano, 10) : new Date().getFullYear();
    if (mes) {
      const month = parseInt(mes, 10);
      const start = new Date(Date.UTC(year, month - 1, 1));
      const end = new Date(Date.UTC(year, month, 1));
      filter["data"] = { $gte: start, $lt: end };
    } else {
      const start = new Date(Date.UTC(year, 0, 1));
      const end = new Date(Date.UTC(year + 1, 0, 1));
      filter["data"] = { $gte: start, $lt: end };
    }
  }

  if (tipo === "receita" || tipo === "despesa") {
    filter["tipo"] = tipo;
  }

  const transactions = await TransacaoModel.find(filter).sort({ data: -1 });

  res.json(
    transactions.map((t) => ({
      id: t._id.toString(),
      userId: t.usuarioId.toString(),
      categoryId: t.categoriaId.toString(),
      type: t.tipo,
      amount: t.valor,
      description: t.descricao,
      date: t.data,
      createdAt: t.createdAt,
    }))
  );
}

// ─── POST /api/transactions ───────────────────────────────────────────────────

export async function createTransaction(req: Request, res: Response): Promise<void> {
  const { userId } = req.user!;
  const { categoryId, type, amount, description, date } = req.body as {
    categoryId?: string;
    type?: TipoTransacao;
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

  const transaction = await TransacaoModel.create({
    usuarioId: new Types.ObjectId(userId),
    categoriaId: new Types.ObjectId(categoryId),
    tipo: type,
    valor: amount,
    descricao: description,
    data: new Date(date),
  });

  res.status(201).json({
    id: transaction._id.toString(),
    userId: transaction.usuarioId.toString(),
    categoryId: transaction.categoriaId.toString(),
    type: transaction.tipo,
    amount: transaction.valor,
    description: transaction.descricao,
    date: transaction.data,
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

  const transaction = await TransacaoModel.findOne({
    _id: id,
    usuarioId: new Types.ObjectId(userId),
  });

  if (!transaction) {
    res.status(404).json({ error: "Transação não encontrada." });
    return;
  }

  res.json({
    id: transaction._id.toString(),
    userId: transaction.usuarioId.toString(),
    categoryId: transaction.categoriaId.toString(),
    type: transaction.tipo,
    amount: transaction.valor,
    description: transaction.descricao,
    date: transaction.data,
    createdAt: transaction.createdAt,
  });
}

// ─── PUT /api/transactions/:id ────────────────────────────────────────────────

export async function updateTransaction(req: Request, res: Response): Promise<void> {
  const { userId } = req.user!;
  const { id } = req.params as { id: string };
  const { categoryId, type, amount, description, date } = req.body as {
    categoryId?: string;
    type?: TipoTransacao;
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
  if (categoryId) patch["categoriaId"] = new Types.ObjectId(categoryId);
  if (type) patch["tipo"] = type;
  if (amount !== undefined) patch["valor"] = amount;
  if (description) patch["descricao"] = description;
  if (date) patch["data"] = new Date(date);

  const updated = await TransacaoModel.findOneAndUpdate(
    { _id: id, usuarioId: new Types.ObjectId(userId) },
    patch,
    { new: true }
  );

  if (!updated) {
    res.status(404).json({ error: "Transação não encontrada." });
    return;
  }

  res.json({
    id: updated._id.toString(),
    userId: updated.usuarioId.toString(),
    categoryId: updated.categoriaId.toString(),
    type: updated.tipo,
    amount: updated.valor,
    description: updated.descricao,
    date: updated.data,
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

  const result = await TransacaoModel.deleteOne({
    _id: id,
    usuarioId: new Types.ObjectId(userId),
  });

  if (result.deletedCount === 0) {
    res.status(404).json({ error: "Transação não encontrada." });
    return;
  }

  res.status(204).send();
}
