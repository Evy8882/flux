
import { TrendingUp, TrendingDown } from "lucide-react";

import SummaryCard from "../components/dashboard/SummaryCard";
import FinancialChart from "../components/dashboard/FinancialChart";
import CategoryExpenses from "../components/dashboard/CategoryExpenses";
import RecentTransactions from "../components/dashboard/RecentTransactions";

import "./Dashboard.css";

function Dashboard({ transactions, onViewAll }) {
  const income = transactions
    .filter((item) => item.type === "income")
    .reduce((total, item) => total + Number(item.value), 0);

  const expenses = transactions
    .filter((item) => item.type === "expense")
    .reduce((total, item) => total + Number(item.value), 0);

  const balance = 5700 + income - expenses;

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
          value={formatCurrency(income)}
          subtitle="Total de entradas"
          icon={TrendingUp}
          type="income"
        />

        <SummaryCard
          title="Despesas cadastradas"
          value={formatCurrency(expenses)}
          subtitle="Total de saídas"
          icon={TrendingDown}
          type="expense"
        />
      </section>

      <section className="dashboard-chart">
        <FinancialChart />
      </section>

      <section className="dashboard-bottom">
        <div className="dashboard-categories">
          <CategoryExpenses />
        </div>

        <div className="dashboard-transactions">
          <RecentTransactions
            transactions={transactions}
            onViewAll={onViewAll}
          />
        </div>
      </section>
    </main>
  );
}

export default Dashboard;
