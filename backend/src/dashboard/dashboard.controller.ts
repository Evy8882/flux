import type { Request, Response } from "express";
import { TransactionModel, CategoryModel } from "../db/models.js";

// ─── GET /api/dashboard/summary ───────────────────────────────────────────────

export async function getSummary(req: Request, res: Response): Promise<void> {
  const { userId } = req.user!;

  // Filtros opcionais por mês e ano
  const { mes, ano } = req.query as { mes?: string; ano?: string };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const baseFilter: Record<string, any> = { userId };

  if (mes || ano) {
    const year = ano ? parseInt(ano, 10) : new Date().getFullYear();
    if (mes) {
      const month = parseInt(mes, 10);
      const start = new Date(Date.UTC(year, month - 1, 1));
      const end = new Date(Date.UTC(year, month, 1));
      baseFilter["date"] = { $gte: start, $lt: end };
    } else {
      const start = new Date(Date.UTC(year, 0, 1));
      const end = new Date(Date.UTC(year + 1, 0, 1));
      baseFilter["date"] = { $gte: start, $lt: end };
    }
  }

  // ── Totais ────────────────────────────────────────────────────────────────
  const [receitasAgg, despesasAgg] = await Promise.all([
    TransactionModel.aggregate([
      { $match: { ...baseFilter, type: "receita" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
    TransactionModel.aggregate([
      { $match: { ...baseFilter, type: "despesa" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
  ]);

  const totalReceitas: number = receitasAgg[0]?.total ?? 0;
  const totalDespesas: number = despesasAgg[0]?.total ?? 0;
  const saldo = totalReceitas - totalDespesas;

  // ── Agregação por categoria ───────────────────────────────────────────────
  const categoryAgg = await TransactionModel.aggregate([
    { $match: baseFilter },
    { $group: { _id: "$categoryId", total: { $sum: "$amount" } } },
    { $sort: { total: -1 } },
  ]);

  const categoryIds = categoryAgg.map((a) => a._id);
  const categories = await CategoryModel.find({ _id: { $in: categoryIds } });

  const catMap = new Map(categories.map((c) => [c._id.toString(), c]));

  const byCategory = categoryAgg
    .map((a) => {
      const cat = catMap.get(a._id.toString());
      if (!cat) return null;
      return {
        id: cat._id.toString(),
        name: cat.name,
        color: cat.color,
        icon: cat.icon,
        total: a.total,
      };
    })
    .filter(Boolean);

  // ── Evolução mensal (últimos 6 meses) ─────────────────────────────────────
  const monthlyAgg = await TransactionModel.aggregate([
    { $match: { userId } },
    {
      $group: {
        _id: {
          year: { $year: "$date" },
          month: { $month: "$date" },
          type: "$type",
        },
        total: { $sum: "$amount" },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } },
  ]);

  // Reagrupa por mes-ano
  const monthlyMap = new Map<string, { mes: string; receitas: number; despesas: number }>();
  for (const entry of monthlyAgg) {
    const key = `${entry._id.year}-${String(entry._id.month).padStart(2, "0")}`;
    const existing = monthlyMap.get(key) ?? { mes: key, receitas: 0, despesas: 0 };
    if (entry._id.type === "receita") existing.receitas += entry.total;
    else existing.despesas += entry.total;
    monthlyMap.set(key, existing);
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
