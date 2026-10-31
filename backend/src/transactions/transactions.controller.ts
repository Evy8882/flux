import type { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { readData, writeData } from "../db/db.js";
import type { Transaction, TransactionType } from "../types.js";

// ─── GET /api/transactions ────────────────────────────────────────────────────
// Query params opcionais: mes, ano, tipo

export function listTransactions(req: Request, res: Response): void {
  const { userId } = req.user!;
  const { mes, ano, tipo } = req.query as {
    mes?: string;
    ano?: string;
    tipo?: string;
  };

  let transactions = readData<Transaction>("transactions").filter(
    (t) => t.userId === userId
  );

  // Filtro por mês (1–12)
  if (mes) {
    const month = parseInt(mes, 10);
    transactions = transactions.filter((t) => {
      const d = new Date(t.date);
      return d.getUTCMonth() + 1 === month;
    });
  }

  // Filtro por ano
  if (ano) {
    const year = parseInt(ano, 10);
    transactions = transactions.filter((t) => {
      const d = new Date(t.date);
      return d.getUTCFullYear() === year;
    });
  }

  // Filtro por tipo (receita | despesa)
  if (tipo === "receita" || tipo === "despesa") {
    transactions = transactions.filter((t) => t.type === tipo);
  }

  res.json(transactions);
}

// ─── POST /api/transactions ───────────────────────────────────────────────────

export function createTransaction(req: Request, res: Response): void {
  const { userId } = req.user!;
  const { categoryId, type, amount, description, date } = req.body as {
    categoryId?: string;
    type?: TransactionType;
    amount?: number;
    description?: string;
    date?: string;
  };

  if (!categoryId || !type || amount === undefined || !description || !date) {
    res
      .status(400)
      .json({
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

  const transactions = readData<Transaction>("transactions");

  const newTransaction: Transaction = {
    id: uuidv4(),
    userId,
    categoryId,
    type,
    amount,
    description,
    date,
    createdAt: new Date().toISOString(),
  };

  transactions.push(newTransaction);
  writeData("transactions", transactions);

  res.status(201).json(newTransaction);
}

// ─── GET /api/transactions/:id ────────────────────────────────────────────────

export function getTransaction(req: Request, res: Response): void {
  const { userId } = req.user!;
  const { id } = req.params as { id: string };

  const transactions = readData<Transaction>("transactions");
  const transaction = transactions.find(
    (t) => t.id === id && t.userId === userId
  );

  if (!transaction) {
    res.status(404).json({ error: "Transação não encontrada." });
    return;
  }

  res.json(transaction);
}

// ─── PUT /api/transactions/:id ────────────────────────────────────────────────

export function updateTransaction(req: Request, res: Response): void {
  const { userId } = req.user!;
  const { id } = req.params as { id: string };
  const { categoryId, type, amount, description, date } = req.body as {
    categoryId?: string;
    type?: TransactionType;
    amount?: number;
    description?: string;
    date?: string;
  };

  const transactions = readData<Transaction>("transactions");
  const index = transactions.findIndex(
    (t) => t.id === id && t.userId === userId
  );

  if (index === -1) {
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

  const current = transactions[index]!;
  const updated: Transaction = {
    ...current,
    categoryId: categoryId ?? current.categoryId,
    type: type ?? current.type,
    amount: amount ?? current.amount,
    description: description ?? current.description,
    date: date ?? current.date,
  };

  transactions[index] = updated;
  writeData("transactions", transactions);

  res.json(updated);
}

// ─── DELETE /api/transactions/:id ─────────────────────────────────────────────

export function deleteTransaction(req: Request, res: Response): void {
  const { userId } = req.user!;
  const { id } = req.params as { id: string };

  const transactions = readData<Transaction>("transactions");
  const filtered = transactions.filter(
    (t) => !(t.id === id && t.userId === userId)
  );

  if (filtered.length === transactions.length) {
    res.status(404).json({ error: "Transação não encontrada." });
    return;
  }

  writeData("transactions", filtered);
  res.status(204).send();
}
