import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  ArrowLeftRight,
  Tags,
  Wallet,
  Target,
  Repeat,
  Settings,
  Plus,
  Bell,
  Search,
  TrendingUp,
  TrendingDown,
  Menu,
  X,
} from "lucide-react";
import "./App.css";

const menuItems = [
  { label: "Início", icon: LayoutDashboard },
  { label: "Extrato", icon: ArrowLeftRight },
  { label: "Categorias", icon: Tags },
  { label: "Orçamento", icon: Wallet },
  { label: "Metas", icon: Target },
  { label: "Recorrências", icon: Repeat },
];

const initialTransactions = [
  {
    id: 1,
    name: "Mercado",
    category: "Alimentação",
    date: "2026-10-31",
    value: 250,
    type: "expense",
  },
  {
    id: 2,
    name: "Salário",
    category: "Renda",
    date: "2026-10-30",
    value: 3500,
    type: "income",
  },
  {
    id: 3,
    name: "Uber",
    category: "Transporte",
    date: "2026-10-28",
    value: 32,
    type: "expense",
  },
];

const categories = {
  income: ["Salário", "Investimentos", "Freelance", "Outros"],
  expense: [
    "Alimentação",
    "Transporte",
    "Moradia",
    "Saúde",
    "Lazer",
    "Educação",
    "Outros",
  ],
};

function formatCurrency(value) {
  return Number(value).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function App() {
  const [activePage, setActivePage] = useState("Início");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  const [transactions, setTransactions] = useState(() => {
    try {
      const saved = localStorage.getItem("flux-transactions");

      if (saved) {
        const parsed = JSON.parse(saved);

        return parsed.map((item) => ({
          ...item,
          name: item.name ?? item.description ?? "",
          value: Number(item.value ?? item.amount ?? 0),
        }));
      }

      return initialTransactions;
    } catch {
      return initialTransactions;
    }
  });

  useEffect(() => {
    localStorage.setItem("flux-transactions", JSON.stringify(transactions));
  }, [transactions]);

  const [form, setForm] = useState({
    name: "",
    type: "expense",
    value: "",
    date: new Date().toISOString().slice(0, 10),
    category: "Alimentação",
  });

  const income = transactions
    .filter((item) => item.type === "income")
    .reduce((total, item) => total + Number(item.value), 0);

  const expenses = transactions
    .filter((item) => item.type === "expense")
    .reduce((total, item) => total + Number(item.value), 0);

  const balance = 5700 + income - expenses;

  function openModal() {
    setForm({
      name: "",
      type: "expense",
      value: "",
      date: new Date().toISOString().slice(0, 10),
      category: "Alimentação",
    });

    setModalOpen(true);
  }

  function handleTypeChange(type) {
    setForm({
      ...form,
      type,
      category: categories[type][0],
    });
  }

  function handleSubmit(event) {
    event.preventDefault();

    const newTransaction = {
      id: Date.now(),
      name: form.name.trim(),
      type: form.type,
      value: Number(form.value),
      date: form.date,
      category: form.category,
    };

    setTransactions((current) => [newTransaction, ...current]);
    setModalOpen(false);
  }

  return (
    <div className="app">
      <aside className={`sidebar ${sidebarOpen ? "" : "collapsed"}`}>
        <div className="brand">
          <div className="brand-icon">F</div>

          {sidebarOpen && <span>flux</span>}

          <button
            className="sidebar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        <span className="menu-label">
          {sidebarOpen ? "MENU PRINCIPAL" : ""}
        </span>

        <nav>
          {menuItems.map(({ label, icon: Icon }) => (
            <button
              key={label}
              className={`nav-item ${
                activePage === label ? "active" : ""
              }`}
              onClick={() => setActivePage(label)}
              title={label}
            >
              <Icon size={20} />
              {sidebarOpen && <span>{label}</span>}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <button className="nav-item">
            <Settings size={20} />
            {sidebarOpen && <span>Configurações</span>}
          </button>

          <div className="profile">
            <div className="avatar">M</div>

            {sidebarOpen && (
              <div>
                <strong>Meu perfil</strong>
                <small>Conta pessoal</small>
              </div>
            )}
          </div>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div>
            <span className="breadcrumb">Flux /</span>
            <strong>{activePage}</strong>
          </div>

          <div className="top-actions">
            <button className="icon-button">
              <Search size={19} />
            </button>

            <button className="icon-button">
              <Bell size={19} />
            </button>

            <button className="primary-button" onClick={openModal}>
              <Plus size={18} />
              Nova transação
            </button>
          </div>
        </header>

        <section className="content">
          <div className="welcome">
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
          </div>

          <div className="summary-grid">
            <article className="summary-card balance-card">
              <span>Saldo total</span>
              <div className="balance-value">
                {formatCurrency(balance)}
              </div>
              <small className="positive">Saldo da sua conta</small>
              <div className="card-decoration">R$</div>
            </article>

            <article className="summary-card">
              <div className="card-heading">
                <span>Receitas cadastradas</span>
                <div className="metric-icon income">
                  <TrendingUp size={19} />
                </div>
              </div>

              <div className="metric-value">
                {formatCurrency(income)}
              </div>

              <small className="positive">Total de entradas</small>
            </article>

            <article className="summary-card">
              <div className="card-heading">
                <span>Despesas cadastradas</span>
                <div className="metric-icon expense">
                  <TrendingDown size={19} />
                </div>
              </div>

              <div className="metric-value">
                {formatCurrency(expenses)}
              </div>

              <small className="negative">Total de saídas</small>
            </article>
          </div>

          <div className="dashboard-grid">
            <article className="panel chart-panel">
              <div className="panel-heading">
                <div>
                  <h2>Fluxo financeiro</h2>
                  <p>Receitas e despesas cadastradas</p>
                </div>

                <span className="period-label">Geral</span>
              </div>

              <div className="chart-placeholder">
                <div className="chart-bars">
                  {[45, 70, 52, 85, 60, 95, 65, 78, 48, 88, 58, 75].map(
                    (height, i) => (
                      <div className="bar-group" key={i}>
                        <div
                          className="bar income-bar"
                          style={{ height: `${height}%` }}
                        />

                        <div
                          className="bar expense-bar"
                          style={{ height: `${height * 0.55}%` }}
                        />
                      </div>
                    )
                  )}
                </div>

                <div className="chart-legend">
                  <span>
                    <i className="legend-dot blue-dot" /> Receitas
                  </span>

                  <span>
                    <i className="legend-dot purple-dot" /> Despesas
                  </span>
                </div>
              </div>
            </article>

            <article className="panel">
              <div className="panel-heading">
                <div>
                  <h2>Despesas por categoria</h2>
                  <p>Distribuição dos seus gastos</p>
                </div>
              </div>

              <div className="category-list">
                {[
                  ["Alimentação", "R$ 850,00", "36%", "food"],
                  ["Transporte", "R$ 620,00", "26%", "transport"],
                  ["Moradia", "R$ 500,00", "21%", "home"],
                  ["Outros", "R$ 380,00", "17%", "other"],
                ].map(([name, value, percent, type]) => (
                  <div className="category-row" key={name}>
                    <div className="category-info">
                      <span className={`category-dot ${type}`} />
                      <span>{name}</span>
                      <strong>{value}</strong>
                    </div>

                    <div className="progress-track">
                      <div
                        className={`progress-fill ${type}`}
                        style={{ width: percent }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </article>
          </div>

          <article className="panel transactions-panel">
            <div className="panel-heading">
              <div>
                <h2>Transações recentes</h2>
                <p>Suas últimas movimentações</p>
              </div>

              <button
                className="text-button"
                onClick={() => setActivePage("Extrato")}
              >
                Ver extrato completo →
              </button>
            </div>

            <div className="transaction-list">
              {transactions.slice(0, 5).map((item) => (
                <div className="transaction-row" key={item.id}>
                  <div className={`transaction-icon ${item.type}`}>
                    {item.type === "income" ? (
                      <TrendingUp size={19} />
                    ) : (
                      <TrendingDown size={19} />
                    )}
                  </div>

                  <div className="transaction-description">
                    <strong>{item.name}</strong>
                    <small>
                      {item.category} ·{" "}
                      {item.date.split("-").reverse().join("/")}
                    </small>
                  </div>

                  <strong
                    className={item.type === "income" ? "positive" : ""}
                  >
                    {item.type === "income" ? "+ " : "- "}
                    {formatCurrency(item.value)}
                  </strong>
                </div>
              ))}

              {transactions.length === 0 && (
                <p>Nenhuma transação cadastrada.</p>
              )}
            </div>
          </article>
        </section>
      </main>

      {modalOpen && (
        <div
          className="modal-overlay"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="transaction-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="modal-header">
              <div>
                <h2>Nova transação</h2>
                <p>Preencha os dados da movimentação.</p>
              </div>

              <button
                className="modal-close"
                onClick={() => setModalOpen(false)}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <label>Tipo de transação</label>

              <div className="type-selector">
                <button
                  type="button"
                  className={
                    form.type === "expense"
                      ? "selected expense-option"
                      : ""
                  }
                  onClick={() => handleTypeChange("expense")}
                >
                  <TrendingDown size={18} /> Despesa
                </button>

                <button
                  type="button"
                  className={
                    form.type === "income"
                      ? "selected income-option"
                      : ""
                  }
                  onClick={() => handleTypeChange("income")}
                >
                  <TrendingUp size={18} /> Receita
                </button>
              </div>

              <label htmlFor="transaction-name">Descrição</label>

              <input
                id="transaction-name"
                type="text"
                placeholder="Ex.: Compra no mercado"
                value={form.name}
                onChange={(event) =>
                  setForm({ ...form, name: event.target.value })
                }
                required
              />

              <div className="form-row">
                <div>
                  <label htmlFor="transaction-value">Valor (R$)</label>

                  <input
                    id="transaction-value"
                    type="number"
                    min="0.01"
                    step="0.01"
                    placeholder="0,00"
                    value={form.value}
                    onChange={(event) =>
                      setForm({ ...form, value: event.target.value })
                    }
                    required
                  />
                </div>

                <div>
                  <label htmlFor="transaction-date">Data</label>

                  <input
                    id="transaction-date"
                    type="date"
                    value={form.date}
                    onChange={(event) =>
                      setForm({ ...form, date: event.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <label htmlFor="transaction-category">Categoria</label>

              <select
                id="transaction-category"
                value={form.category}
                onChange={(event) =>
                  setForm({ ...form, category: event.target.value })
                }
              >
                {categories[form.type].map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>

              <div className="modal-actions">
                <button
                  type="button"
                  className="cancel-button"
                  onClick={() => setModalOpen(false)}
                >
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

export default App;