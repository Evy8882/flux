import type { Request, Response } from "express";
import { readData } from "../db/db.js";
import type { Transaction, Category } from "../types.js";

// ─── GET /api/dashboard/summary ───────────────────────────────────────────────

export function getSummary(req: Request, res: Response): void {
  const { userId } = req.user!;

  // Filtros opcionais por mês e ano
  const { mes, ano } = req.query as { mes?: string; ano?: string };

  let transactions = readData<Transaction>("transactions").filter(
    (t) => t.userId === userId
  );

  if (mes) {
    const month = parseInt(mes, 10);
    transactions = transactions.filter(
      (t) => new Date(t.date).getUTCMonth() + 1 === month
    );
  }

  if (ano) {
    const year = parseInt(ano, 10);
    transactions = transactions.filter(
      (t) => new Date(t.date).getUTCFullYear() === year
    );
  }

  // ── Totais ────────────────────────────────────────────────────────────────
  const totalReceitas = transactions
    .filter((t) => t.type === "receita")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalDespesas = transactions
    .filter((t) => t.type === "despesa")
    .reduce((sum, t) => sum + t.amount, 0);

  const saldo = totalReceitas - totalDespesas;

  // ── Agregação por categoria ───────────────────────────────────────────────
  const categories = readData<Category>("categories").filter(
    (c) => c.userId === userId
  );

  const categoryMap = new Map<
    string,
    { id: string; name: string; color: string; icon: string; total: number }
  >();

  for (const t of transactions) {
    const cat = categories.find((c) => c.id === t.categoryId);
    if (!cat) continue;

    const existing = categoryMap.get(t.categoryId);
    if (existing) {
      existing.total += t.amount;
    } else {
      categoryMap.set(t.categoryId, {
        id: cat.id,
        name: cat.name,
        color: cat.color,
        icon: cat.icon,
        total: t.amount,
      });
    }
  }

  const byCategory = Array.from(categoryMap.values()).sort(
    (a, b) => b.total - a.total
  );

  // ── Evolução mensal (últimos 6 meses) ─────────────────────────────────────
  const allTransactions = readData<Transaction>("transactions").filter(
    (t) => t.userId === userId
  );

  const monthlyMap = new Map<
    string,
    { mes: string; receitas: number; despesas: number }
  >();

  for (const t of allTransactions) {
    const d = new Date(t.date);
    const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;

    const entry = monthlyMap.get(key) ?? {
      mes: key,
      receitas: 0,
      despesas: 0,
    };

    if (t.type === "receita") entry.receitas += t.amount;
    else entry.despesas += t.amount;

    monthlyMap.set(key, entry);
  }

  const monthly = Array.from(monthlyMap.values())
    .sort((a, b) => a.mes.localeCompare(b.mes))
    .slice(-6);

  res.json({
    saldo,
    totalReceitas,
    totalDespesas,
    byCategory,
    monthly,
  });
}
