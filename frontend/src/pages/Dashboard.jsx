import { useEffect, useState } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

import SummaryCard from "../components/dashboard/SummaryCard";
import FinancialChart from "../components/dashboard/FinancialChart";
import CategoryExpenses from "../components/dashboard/CategoryExpenses";
import RecentTransactions from "../components/dashboard/RecentTransactions";
import { api } from "../services/api";

import "./Dashboard.css";

function Dashboard({ onViewAll }) {
  const [summary, setSummary] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        // Busca o resumo consolidado do dashboard e a lista de transações em paralelo
        const [summaryRes, transRes] = await Promise.all([
          api.get("/dashboard/summary"),
          api.get("/transactions"),
        ]);
        setSummary(summaryRes);
        setTransactions(transRes);
      } catch (err) {
        console.error("Erro ao carregar dados do dashboard:", err.message);
      } finally {
        setIsLoading(false);
      }
    }
    loadDashboardData();
  }, []);

  if (isLoading) {
    return (
      <main className="dashboard">
        <p>Carregando dashboard...</p>
      </main>
    );
  }

  // Extrai os totais retornados por getSummary no dashboard.controller.ts
  const balance = summary?.saldo || 0;
  const totalReceitas = summary?.totalReceitas || 0;
  const totalDespesas = summary?.totalDespesas || 0;

  function formatCurrency(value) {
    return Number(value).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  return (
    <main className="dashboard">
      <header className="welcome">
        <div>
          <span className="eyebrow">VISÃO GERAL</span>
          <h1>Olá! 👋</h1>
          <p>Acompanhe sua vida financeira em um só lugar.</p>
        </div>

        <select className="month-select" defaultValue="Outubro 2026">
          <option>Outubro 2026</option>
          <option>Setembro 2026</option>
          <option>Agosto 2026</option>
        </select>
      </header>

      <section className="summary-grid">
        <SummaryCard
          title="Saldo total"
          value={formatCurrency(balance)}
          subtitle="Saldo da sua conta"
          type="balance"
        />

        <SummaryCard
          title="Receitas cadastradas"
          value={formatCurrency(totalReceitas)}
          subtitle="Total de entradas"
          icon={TrendingUp}
          type="income"
        />

        <SummaryCard
          title="Despesas cadastradas"
          value={formatCurrency(totalDespesas)}
          subtitle="Total de saídas"
          icon={TrendingDown}
          type="expense"
        />
      </section>

      <section className="dashboard-chart">
        <FinancialChart monthlyData={summary?.monthly || []} />
      </section>

      <section className="dashboard-bottom">
        <div className="dashboard-categories">
          <CategoryExpenses categoriesData={summary?.byCategory || []} />
        </div>

        <div className="dashboard-transactions">
          <RecentTransactions
            transactions={transactions.map((t) => ({
              ...t,
              name: t.description,
              value: t.amount,
              type: t.type === "receita" ? "income" : "expense",
            }))}
            onViewAll={onViewAll}
          />
        </div>
      </section>
    </main>
  );
}

export default Dashboard;