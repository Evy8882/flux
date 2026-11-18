import "../pages/Statement.css";
import { useMemo, useState, useEffect } from "react";
import {
  Search,
  ArrowUpDown,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  X,
} from "lucide-react";

import { formatCurrency } from "../utils/formatCurrency";
import { api } from "../services/api";

const CATEGORIES = [
  { id: "alimentacao", name: "Alimentação" },
  { id: "transporte", name: "Transporte" },
  { id: "moradia", name: "Moradia" },
  { id: "saude", name: "Saúde" },
  { id: "lazer", name: "Lazer" },
  { id: "educacao", name: "Educação" },
  { id: "salario", name: "Salário" },
  { id: "freelance", name: "Freelance" },
  { id: "outros", name: "Outros" },
];

function Statement() {
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({
    description: "",
    type: "despesa",
    amount: "",
    categoryId: CATEGORIES[0].name,
    date: new Date().toISOString().slice(0, 10),
  });

  useEffect(() => {
    async function loadData() {
      try {
        const transRes = await api.get("/transactions");
        setTransactions(transRes);
      } catch (err) {
        console.error("Erro ao carregar extrato:", err.message);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  async function handleAddTransaction(event) {
    event.preventDefault();
    try {
      const newTransaction = await api.post("/transactions", {
        description: form.description.trim(),
        type: form.type,
        amount: Number(form.amount),
        categoryId: form.categoryId,
        date: form.date,
      });

      setTransactions((current) => [newTransaction, ...current]);
      setModalOpen(false);
      setForm({
        description: "",
        type: "despesa",
        amount: "",
        categoryId: CATEGORIES[0].name,
        date: new Date().toISOString().slice(0, 10),
      });
    } catch (err) {
      alert("Erro ao criar transação: " + err.message);
    }
  }

  const income = transactions
    .filter((item) => item.type === "receita")
    .reduce((total, item) => total + Number(item.amount), 0);

  const expenses = transactions
    .filter((item) => item.type === "despesa")
    .reduce((total, item) => total + Number(item.amount), 0);

  const catMap = useMemo(() => {
    return new Map(CATEGORIES.map((c) => [c.name, c.name]));
  }, []);

  const filteredTransactions = useMemo(() => {
    return transactions
      .filter((item) => {
        const matchesSearch = item.description
          .toLowerCase()
          .includes(search.toLowerCase());

        const matchesType =
          typeFilter === "all" || item.type === (typeFilter === "income" ? "receita" : "despesa");

        const matchesCategory =
          categoryFilter === "all" || item.categoryId === categoryFilter;

        return matchesSearch && matchesType && matchesCategory;
      })
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [transactions, search, typeFilter, categoryFilter]);

  if (isLoading) {
    return <div className="statement-page"><p>Carregando extrato...</p></div>;
  }

  return (
    <div className="statement-page">
      <div className="welcome">
        <div>
          <span className="eyebrow">MOVIMENTAÇÕES</span>
          <h1>Extrato</h1>
          <p>Acompanhe todas as suas receitas e despesas.</p>
        </div>

        <button className="primary-button" onClick={() => setModalOpen(true)}>
          <Plus size={17} />
          Nova transação
        </button>
      </div>

      <div className="statement-summary">
        <article className="panel statement-card">
          <div className="statement-card-icon income"><TrendingUp size={20} /></div>
          <span>Total de receitas</span>
          <strong className="positive">{formatCurrency(income)}</strong>
        </article>

        <article className="panel statement-card">
          <div className="statement-card-icon expense"><TrendingDown size={20} /></div>
          <span>Total de despesas</span>
          <strong className="negative">{formatCurrency(expenses)}</strong>
        </article>

        <article className="panel statement-card">
          <div className="statement-card-icon balance"><ArrowUpDown size={20} /></div>
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

          <select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)}>
            <option value="all">Todos os tipos</option>
            <option value="income">Receitas</option>
            <option value="expense">Despesas</option>
          </select>

          <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}>
            <option value="all">Todas as categorias</option>
            {CATEGORIES.map((cat) => (
              <option key={cat.id} value={cat.name}>{cat.name}</option>
            ))}
          </select>
        </div>

        <div className="statement-list">
          {filteredTransactions.map((item) => {
            const isIncome = item.type === "receita";
            const categoryName = item.categoryId || "Geral";
            const formattedDate = item.date ? new Date(item.date).toLocaleDateString("pt-BR") : "";

            return (
              <div className="statement-row" key={item.id}>
                <div className={`transaction-icon ${isIncome ? "income" : "expense"}`}>
                  {isIncome ? <ArrowDownRight size={19} /> : <ArrowUpRight size={19} />}
                </div>

                <div className="transaction-description">
                  <strong>{item.description}</strong>
                  <small>{categoryName} · {formattedDate}</small>
                </div>

                <strong className={isIncome ? "positive" : "negative"}>
                  {isIncome ? "+ " : "- "}
                  {formatCurrency(item.amount)}
                </strong>
              </div>
            );
          })}

          {filteredTransactions.length === 0 && (
            <div className="statement-empty">
              <Search size={28} />
              <strong>Nenhuma transação encontrada</strong>
              <p>Tente alterar os filtros ou a pesquisa.</p>
            </div>
          )}
        </div>
      </section>

      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="transaction-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2>Nova transação</h2>
                <p>Preencha os dados da movimentação.</p>
              </div>
              <button className="modal-close" onClick={() => setModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddTransaction}>
              <label>Tipo de transação</label>
              <div className="type-selector">
                <button
                  type="button"
                  className={form.type === "despesa" ? "selected expense-option" : ""}
                  onClick={() => setForm({ ...form, type: "despesa" })}
                >
                  <TrendingDown size={18} /> Despesa
                </button>
                <button
                  type="button"
                  className={form.type === "receita" ? "selected income-option" : ""}
                  onClick={() => setForm({ ...form, type: "receita" })}
                >
                  <TrendingUp size={18} /> Receita
                </button>
              </div>

              <label htmlFor="transaction-description">Descrição</label>
              <input
                id="transaction-description"
                type="text"
                placeholder="Ex.: Compra no mercado"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                required
              />

              <div className="form-row">
                <div>
                  <label htmlFor="transaction-value">Valor (R$)</label>
                  <input
                    id="transaction-value"
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="0,00"
                    value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="transaction-date">Data</label>
                  <input
                    id="transaction-date"
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    required
                  />
                </div>
              </div>

              <label htmlFor="transaction-category">Categoria</label>
              <select
                id="transaction-category"
                value={form.categoryId}
                onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                required
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.name}>{cat.name}</option>
                ))}
              </select>

              <div className="modal-actions">
                <button type="button" className="cancel-button" onClick={() => setModalOpen(false)}>
                  Cancelar
                </button>
                <button type="submit" className="save-button">
                  Salvar transação
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Statement;