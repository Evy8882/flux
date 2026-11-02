
import { useMemo, useState } from "react";
import {
  Search,
  ArrowUpDown,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

import { formatCurrency } from "../utils/formatCurrency";

function Statement({ transactions }) {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const income = transactions
    .filter((item) => item.type === "income")
    .reduce((total, item) => total + Number(item.value), 0);

  const expenses = transactions
    .filter((item) => item.type === "expense")
    .reduce((total, item) => total + Number(item.value), 0);

  const filteredTransactions = useMemo(() => {
    return transactions
      .filter((item) => {
        const matchesSearch = item.name
          .toLowerCase()
          .includes(search.toLowerCase());

        const matchesType =
          typeFilter === "all" || item.type === typeFilter;

        const matchesCategory =
          categoryFilter === "all" || item.category === categoryFilter;

        return matchesSearch && matchesType && matchesCategory;
      })
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [transactions, search, typeFilter, categoryFilter]);

  const categories = [
    ...new Set(transactions.map((item) => item.category)),
  ];

  return (
    <div className="statement-page">
      <div className="welcome">
        <div>
          <span className="eyebrow">MOVIMENTAÇÕES</span>
          <h1>Extrato</h1>
          <p>Acompanhe todas as suas receitas e despesas.</p>
        </div>
      </div>

      <div className="statement-summary">
        <article className="panel statement-card">
          <div className="statement-card-icon income">
            <TrendingUp size={20} />
          </div>
          <span>Total de receitas</span>
          <strong className="positive">{formatCurrency(income)}</strong>
        </article>

        <article className="panel statement-card">
          <div className="statement-card-icon expense">
            <TrendingDown size={20} />
          </div>
          <span>Total de despesas</span>
          <strong className="negative">{formatCurrency(expenses)}</strong>
        </article>

        <article className="panel statement-card">
          <div className="statement-card-icon balance">
            <ArrowUpDown size={20} />
          </div>
          <span>Resultado</span>
          <strong>{formatCurrency(income - expenses)}</strong>
        </article>
      </div>

      <section className="panel statement-panel">
        <div className="panel-heading">
          <div>
            <h2>Todas as transações</h2>
            <p>{filteredTransactions.length} movimentações encontradas</p>
          </div>
        </div>

        <div className="statement-filters">
          <div className="statement-search">
            <Search size={18} />
            <input
              type="text"
              placeholder="Pesquisar transação..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          <select
            value={typeFilter}
            onChange={(event) => setTypeFilter(event.target.value)}
          >
            <option value="all">Todos os tipos</option>
            <option value="income">Receitas</option>
            <option value="expense">Despesas</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(event) => setCategoryFilter(event.target.value)}
          >
            <option value="all">Todas as categorias</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <div className="statement-list">
          {filteredTransactions.map((item) => (
            <div className="statement-row" key={item.id}>
              <div className={`transaction-icon ${item.type}`}>
                {item.type === "income" ? (
                  <ArrowDownRight size={19} />
                ) : (
                  <ArrowUpRight size={19} />
                )}
              </div>

              <div className="transaction-description">
                <strong>{item.name}</strong>
                <small>
                  {item.category} · {item.date.split("-").reverse().join("/")}
                </small>
              </div>

              <strong className={item.type === "income" ? "positive" : "negative"}>
                {item.type === "income" ? "+ " : "- "}
                {formatCurrency(item.value)}
              </strong>
            </div>
          ))}

          {filteredTransactions.length === 0 && (
            <div className="statement-empty">
              <Search size={28} />
              <strong>Nenhuma transação encontrada</strong>
              <p>Tente alterar os filtros ou a pesquisa.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default Statement;
