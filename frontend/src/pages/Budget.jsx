import "../pages/Budget.css";
import { useEffect, useState } from "react";
import {
  Wallet,
  Plus,
  Pencil,
  Trash2,
  ShoppingCart,
  Car,
  House,
  HeartPulse,
  Gamepad2,
  GraduationCap,
  CircleDollarSign,
  AlertTriangle,
} from "lucide-react";

import { formatCurrency } from "../utils/formatCurrency";
import { api } from "../services/api";

const categoryIcons = {
  Alimentação: ShoppingCart,
  Transporte: Car,
  Moradia: House,
  Saúde: HeartPulse,
  Lazer: Gamepad2,
  Educação: GraduationCap,
  Outros: CircleDollarSign,
};

function Budget() {
  const [budgets, setBudgets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [categoryId, setCategoryId] = useState("");
  const [limit, setLimit] = useState("");
  const [monthYear, setMonthYear] = useState(new Date().toISOString().slice(0, 7));

  useEffect(() => {
    async function loadData() {
      try {
        const [budgetsRes, categoriesRes, transRes] = await Promise.all([
          api.get("/budgets"),
          api.get("/categories"),
          api.get("/transactions"),
        ]);
        setBudgets(budgetsRes);
        setCategories(categoriesRes);
        setTransactions(transRes);
        if (categoriesRes.length > 0) {
          setCategoryId(categoriesRes[0].id);
        }
      } catch (err) {
        console.error("Erro ao carregar dados de orçamento:", err.message);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const currentMonth = new Date().toISOString().slice(0, 7);

  const monthlyExpenses = transactions.filter(
    (item) => item.type === "despesa" && item.date?.startsWith(currentMonth)
  );

  const totalSpent = monthlyExpenses.reduce(
    (total, item) => total + Number(item.amount),
    0
  );

  const totalLimit = budgets.reduce(
    (total, budget) => total + Number(budget.limit),
    0
  );

  const catMap = new Map(categories.map((c) => [c.id, c.name]));

  function getCategorySpent(catId) {
    return monthlyExpenses
      .filter((item) => item.categoryId === catId)
      .reduce((total, item) => total + Number(item.amount), 0);
  }

  function openBudgetModal(budget = null) {
    setEditingBudget(budget);
    setCategoryId(budget?.categoryId || categories[0]?.id || "");
    setLimit(budget ? String(budget.limit) : "");
    setMonthYear(budget?.monthYear || currentMonth);
    setModalOpen(true);
  }

  function closeBudgetModal() {
    setModalOpen(false);
    setEditingBudget(null);
    setLimit("");
  }

  async function handleSaveBudget(event) {
    event.preventDefault();

    try {
      const payload = {
        categoryId,
        limit: Number(limit),
        monthYear,
      };

      let savedBudget;
      if (editingBudget) {
        savedBudget = await api.put(`/budgets/${editingBudget.id}`, payload);
        setBudgets((current) =>
          current.map((item) => (item.id === editingBudget.id ? savedBudget : item))
        );
      } else {
        savedBudget = await api.post("/budgets", payload);
        setBudgets((current) => [...current, savedBudget]);
      }

      closeBudgetModal();
    } catch (err) {
      alert("Erro ao salvar orçamento: " + err.message);
    }
  }

  async function handleDeleteBudget(id) {
    const confirmed = window.confirm("Deseja realmente remover este orçamento?");
    if (!confirmed) return;

    try {
      await api.delete(`/budgets/${id}`);
      setBudgets((current) => current.filter((item) => item.id !== id));
    } catch (err) {
      alert("Erro ao excluir orçamento: " + err.message);
    }
  }

  if (isLoading) {
    return <div className="budget-page"><p>Carregando orçamentos...</p></div>;
  }

  return (
    <div className="budget-page">
      <div className="welcome">
        <div>
          <span className="eyebrow">CONTROLE FINANCEIRO</span>
          <h1>Orçamento</h1>
          <p>Defina limites e acompanhe seus gastos mensais.</p>
        </div>

        <button className="primary-button" onClick={() => openBudgetModal()}>
          <Plus size={17} />
          Novo orçamento
        </button>
      </div>

      <div className="budget-summary">
        <article className="panel budget-summary-card">
          <div className="budget-summary-icon blue"><Wallet size={20} /></div>
          <span>Limite total</span>
          <strong>{formatCurrency(totalLimit)}</strong>
        </article>

        <article className="panel budget-summary-card">
          <div className="budget-summary-icon red"><ShoppingCart size={20} /></div>
          <span>Total gasto no mês</span>
          <strong className="negative">{formatCurrency(totalSpent)}</strong>
        </article>

        <article className="panel budget-summary-card">
          <div className="budget-summary-icon green"><CircleDollarSign size={20} /></div>
          <span>Disponível</span>
          <strong className={totalLimit - totalSpent < 0 ? "negative" : "positive"}>
            {formatCurrency(totalLimit - totalSpent)}
          </strong>
        </article>
      </div>

      <section className="panel budget-panel">
        <div className="panel-heading">
          <div>
            <h2>Orçamentos por categoria</h2>
            <p>Acompanhe seus limites individuais.</p>
          </div>
        </div>

        {budgets.length === 0 ? (
          <div className="budget-empty">
            <Wallet size={32} />
            <strong>Nenhum orçamento cadastrado</strong>
            <p>Adicione um limite para começar a acompanhar seus gastos.</p>
          </div>
        ) : (
          <div className="budget-list">
            {budgets.map((budget) => {
              const catName = catMap.get(budget.categoryId) || "Geral";
              const Icon = categoryIcons[catName] || CircleDollarSign;
              const spent = getCategorySpent(budget.categoryId);
              const percentage = budget.limit > 0 ? (spent / budget.limit) * 100 : 0;
              const exceeded = percentage > 100;
              const warning = percentage >= 80 && !exceeded;

              return (
                <div className="budget-item" key={budget.id}>
                  <div className="budget-item-top">
                    <div className="budget-category">
                      <div className="budget-category-icon">
                        <Icon size={19} />
                      </div>
                      <div>
                        <strong>{catName}</strong>
                        <small>
                          {formatCurrency(spent)} de {formatCurrency(budget.limit)} ({budget.monthYear})
                        </small>
                      </div>
                    </div>

                    <div className="budget-item-actions">
                      <strong className={exceeded ? "negative" : "positive"}>
                        {Math.round(percentage)}%
                      </strong>

                      <button
                        className="budget-action edit"
                        onClick={() => openBudgetModal(budget)}
                        title="Editar"
                      >
                        <Pencil size={16} />
                      </button>

                      <button
                        className="budget-action delete"
                        onClick={() => handleDeleteBudget(budget.id)}
                        title="Excluir"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="budget-progress-track">
                    <div
                      className={`budget-progress-fill ${
                        exceeded ? "exceeded" : warning ? "warning" : ""
                      }`}
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    />
                  </div>

                  {exceeded && (
                    <div className="budget-alert exceeded">
                      <AlertTriangle size={14} />
                      Limite ultrapassado em {formatCurrency(spent - budget.limit)}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {modalOpen && (
        <div className="modal-overlay" onClick={closeBudgetModal}>
          <div className="transaction-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2>{editingBudget ? "Editar orçamento" : "Novo orçamento"}</h2>
                <p>Defina um limite mensal para a categoria.</p>
              </div>
              <button className="modal-close" onClick={closeBudgetModal}>×</button>
            </div>

            <form onSubmit={handleSaveBudget}>
              <label>Categoria</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                required
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>

              <label>Limite mensal (R$)</label>
              <input
                type="number"
                min="0.01"
                step="0.01"
                placeholder="Ex.: 500"
                value={limit}
                onChange={(e) => setLimit(e.target.value)}
                required
              />

              <label>Mês e Ano (YYYY-MM)</label>
              <input
                type="text"
                placeholder="2026-11"
                value={monthYear}
                onChange={(e) => setMonthYear(e.target.value)}
                required
              />

              <div className="modal-actions">
                <button type="button" className="cancel-button" onClick={closeBudgetModal}>
                  Cancelar
                </button>
                <button type="submit" className="save-button">
                  Salvar orçamento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Budget;