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

const categoryIcons = {
  Alimentação: ShoppingCart,
  Transporte: Car,
  Moradia: House,
  Saúde: HeartPulse,
  Lazer: Gamepad2,
  Educação: GraduationCap,
  Outros: CircleDollarSign,
};

function Budget({ transactions }) {
  const [budgets, setBudgets] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("flux-budgets")) || [];
    } catch {
      return [];
    }
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [category, setCategory] = useState("Alimentação");
  const [limit, setLimit] = useState("");

  useEffect(() => {
    localStorage.setItem("flux-budgets", JSON.stringify(budgets));
  }, [budgets]);

  const currentMonth = new Date().toISOString().slice(0, 7);

  const monthlyExpenses = transactions.filter(
    (item) =>
      item.type === "expense" &&
      item.date?.startsWith(currentMonth)
  );

  const totalSpent = monthlyExpenses.reduce(
    (total, item) => total + Number(item.value),
    0
  );

  const totalLimit = budgets.reduce(
    (total, budget) => total + Number(budget.limit),
    0
  );

  function getCategorySpent(categoryName) {
    return monthlyExpenses
      .filter((item) => item.category === categoryName)
      .reduce((total, item) => total + Number(item.value), 0);
  }

  function openBudgetModal(budget = null) {
    setEditingBudget(budget);
    setCategory(budget?.category || "Alimentação");
    setLimit(budget ? String(budget.limit) : "");
    setModalOpen(true);
  }

  function closeBudgetModal() {
    setModalOpen(false);
    setEditingBudget(null);
    setLimit("");
  }

  function handleSaveBudget(event) {
    event.preventDefault();

    const newBudget = {
      id: editingBudget?.id || Date.now(),
      category,
      limit: Number(limit),
    };

    setBudgets((current) => {
      if (editingBudget) {
        return current.map((item) =>
          item.id === editingBudget.id ? newBudget : item
        );
      }

      return [...current, newBudget];
    });

    closeBudgetModal();
  }

  function handleDeleteBudget(id) {
    const confirmed = window.confirm(
      "Deseja realmente remover este orçamento?"
    );

    if (confirmed) {
      setBudgets((current) =>
        current.filter((item) => item.id !== id)
      );
    }
  }

  return (
    <div className="budget-page">
      <div className="welcome">
        <button
          className="primary-button"
          onClick={() => openBudgetModal()}
        >
          <Plus size={17} />
          Novo orçamento
        </button>
      </div>

      <div className="budget-summary">
        <article className="panel budget-summary-card">
          <div className="budget-summary-icon blue">
            <Wallet size={20} />
          </div>
          <span>Limite total</span>
          <strong>{formatCurrency(totalLimit)}</strong>
        </article>

        <article className="panel budget-summary-card">
          <div className="budget-summary-icon red">
            <ShoppingCart size={20} />
          </div>
          <span>Total gasto no mês</span>
          <strong className="negative">
            {formatCurrency(totalSpent)}
          </strong>
        </article>

        <article className="panel budget-summary-card">
          <div className="budget-summary-icon green">
            <CircleDollarSign size={20} />
          </div>
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
              const Icon = categoryIcons[budget.category] || CircleDollarSign;
              const spent = getCategorySpent(budget.category);
              const percentage =
                budget.limit > 0 ? (spent / budget.limit) * 100 : 0;
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
                        <strong>{budget.category}</strong>
                        <small>
                          {formatCurrency(spent)} de{" "}
                          {formatCurrency(budget.limit)}
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
                        title="Editar orçamento"
                      >
                        <Pencil size={16} />
                      </button>

                      <button
                        className="budget-action delete"
                        onClick={() => handleDeleteBudget(budget.id)}
                        title="Excluir orçamento"
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
                      Limite ultrapassado em{" "}
                      {formatCurrency(spent - budget.limit)}
                    </div>
                  )}

                  {warning && (
                    <div className="budget-alert warning">
                      <AlertTriangle size={14} />
                      Você já utilizou boa parte deste orçamento.
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
          <div
            className="transaction-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="modal-header">
              <div>
                <h2>
                  {editingBudget ? "Editar orçamento" : "Novo orçamento"}
                </h2>
                <p>Defina um limite mensal para a categoria.</p>
              </div>

              <button className="modal-close" onClick={closeBudgetModal}>
                ×
              </button>
            </div>

            <form onSubmit={handleSaveBudget}>
              <label htmlFor="budget-category">Categoria</label>
              <select
                id="budget-category"
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                required
              >
                {Object.keys(categoryIcons).map((item) => {
                  const alreadyExists = budgets.some(
                    (budget) =>
                      budget.category === item &&
                      budget.id !== editingBudget?.id
                  );

                  return (
                    <option key={item} value={item} disabled={alreadyExists}>
                      {item}{alreadyExists ? " (já cadastrado)" : ""}
                    </option>
                  );
                })}
              </select>

              <label htmlFor="budget-limit">Limite mensal (R$)</label>
              <input
                id="budget-limit"
                type="number"
                min="0.01"
                step="0.01"
                placeholder="Ex.: 500"
                value={limit}
                onChange={(event) => setLimit(event.target.value)}
                required
              />

              <div className="modal-actions">
                <button
                  type="button"
                  className="cancel-button"
                  onClick={closeBudgetModal}
                >
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
