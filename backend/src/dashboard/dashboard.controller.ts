import type { Request, Response } from "express";
import { Types } from "mongoose";
import { TransacaoModel } from "../db/models.js";

// ─── GET /api/dashboard/summary ───────────────────────────────────────────────

export async function getSummary(req: Request, res: Response): Promise<void> {
  const { userId } = req.user!;

  // Filtros opcionais por mês e ano
  const { mes, ano } = req.query as { mes?: string; ano?: string };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const baseFilter: Record<string, any> = { usuarioId: new Types.ObjectId(userId) };

  if (mes || ano) {
    const year = ano ? parseInt(ano, 10) : new Date().getFullYear();
    if (mes) {
      const month = parseInt(mes, 10);
      const start = new Date(Date.UTC(year, month - 1, 1));
      const end = new Date(Date.UTC(year, month, 1));
      baseFilter["data"] = { $gte: start, $lt: end };
    } else {
      const start = new Date(Date.UTC(year, 0, 1));
      const end = new Date(Date.UTC(year + 1, 0, 1));
      baseFilter["data"] = { $gte: start, $lt: end };
    }
  }

  // ── Totais ────────────────────────────────────────────────────────────────
  const [receitasAgg, despesasAgg] = await Promise.all([
    TransacaoModel.aggregate([
      { $match: { ...baseFilter, tipo: "receita" } },
      { $group: { _id: null, total: { $sum: "$valor" } } },
    ]),
    TransacaoModel.aggregate([
      { $match: { ...baseFilter, tipo: "despesa" } },
      { $group: { _id: null, total: { $sum: "$valor" } } },
    ]),
  ]);

  const totalReceitas: number = receitasAgg[0]?.total ?? 0;
  const totalDespesas: number = despesasAgg[0]?.total ?? 0;
  const saldo = totalReceitas - totalDespesas;

  // ── Agregação por categoria (Apenas Despesas) ─────────────────────────────
  const categoryAgg = await TransacaoModel.aggregate([
    { $match: { ...baseFilter, tipo: "despesa" } }, // Filtra estritamente por despesas
    { $group: { _id: "$categoryId", total: { $sum: "$valor" } } },
    { $sort: { total: -1 } },
  ]);

  const defaultColors = ["#ef4444", "#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#22c55e", "#14b8a6", "#64748b"];

  const byCategory = categoryAgg.map((a, index) => ({
    id: a._id,
    name: a._id || "Outros",
    color: defaultColors[index % defaultColors.length],
    icon: "tag",
    total: a.total,
  }));

  // ── Evolução mensal (últimos 6 meses) ─────────────────────────────────────
  const monthlyAgg = await TransacaoModel.aggregate([
    { $match: { usuarioId: new Types.ObjectId(userId) } },
    {
      $group: {
        _id: {
          year: { $year: "$data" },
          month: { $month: "$data" },
          type: "$tipo",
        },
        total: { $sum: "$valor" },
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
