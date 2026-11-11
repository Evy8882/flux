import "../pages/Recurrences.css";
import { useEffect, useState } from "react";
import {
  Repeat,
  Plus,
  Pencil,
  Trash2,
  CalendarDays,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

import { categories } from "../data/categories";
import { formatCurrency } from "../utils/formatCurrency";

const frequencies = [
  "Semanal",
  "Mensal",
  "Bimestral",
  "Trimestral",
  "Semestral",
  "Anual",
];

function Recurrences() {
  const [recurrences, setRecurrences] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("flux-recurrences")) || [];
    } catch {
      return [];
    }
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [editingRecurrence, setEditingRecurrence] = useState(null);

  const [form, setForm] = useState({
    name: "",
    type: "expense",
    value: "",
    category: categories.expense[0],
    frequency: "Mensal",
    nextDate: new Date().toISOString().slice(0, 10),
  });

  useEffect(() => {
    localStorage.setItem(
      "flux-recurrences",
      JSON.stringify(recurrences)
    );
  }, [recurrences]);

  const totalIncome = recurrences
    .filter((item) => item.type === "income")
    .reduce((total, item) => total + Number(item.value), 0);

  const totalExpenses = recurrences
    .filter((item) => item.type === "expense")
    .reduce((total, item) => total + Number(item.value), 0);

  function openModal(recurrence = null) {
    setEditingRecurrence(recurrence);

    setForm(
      recurrence
        ? {
            name: recurrence.name,
            type: recurrence.type,
            value: String(recurrence.value),
            category: recurrence.category,
            frequency: recurrence.frequency,
            nextDate: recurrence.nextDate,
          }
        : {
            name: "",
            type: "expense",
            value: "",
            category: categories.expense[0],
            frequency: "Mensal",
            nextDate: new Date().toISOString().slice(0, 10),
          }
    );

    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditingRecurrence(null);
  }

  function handleTypeChange(type) {
    setForm({
      ...form,
      type,
      category: categories[type][0],
    });
  }

  function handleSave(event) {
    event.preventDefault();

    const newRecurrence = {
      id: editingRecurrence?.id || Date.now(),
      name: form.name.trim(),
      type: form.type,
      value: Number(form.value),
      category: form.category,
      frequency: form.frequency,
      nextDate: form.nextDate,
    };

    setRecurrences((current) => {
      if (editingRecurrence) {
        return current.map((item) =>
          item.id === editingRecurrence.id
            ? newRecurrence
            : item
        );
      }

      return [...current, newRecurrence];
    });

    closeModal();
  }

  function handleDelete(id) {
    const confirmed = window.confirm(
      "Deseja realmente excluir esta recorrência?"
    );

    if (confirmed) {
      setRecurrences((current) =>
        current.filter((item) => item.id !== id)
      );
    }
  }

  function formatDate(date) {
    return new Date(`${date}T12:00:00`).toLocaleDateString("pt-BR");
  }

  return (
    <div className="recurrences-page">
      <div className="welcome">
        <div>
          <span className="eyebrow">CONTROLE AUTOMÁTICO</span>
          <h1>Recorrências</h1>
          <p>Organize suas receitas e despesas periódicas.</p>
        </div>

        <button
          className="primary-button"
          onClick={() => openModal()}
        >
          <Plus size={17} />
          Nova recorrência
        </button>
      </div>

      <div className="recurrences-summary">
        <article className="panel recurrence-summary-card">
          <div className="recurrence-summary-icon blue">
            <Repeat size={20} />
          </div>
          <span>Recorrências cadastradas</span>
          <strong>{recurrences.length}</strong>
        </article>

        <article className="panel recurrence-summary-card">
          <div className="recurrence-summary-icon green">
            <TrendingUp size={20} />
          </div>
          <span>Receitas por ocorrência</span>
          <strong className="positive">
            {formatCurrency(totalIncome)}
          </strong>
        </article>

        <article className="panel recurrence-summary-card">
          <div className="recurrence-summary-icon red">
            <TrendingDown size={20} />
          </div>
          <span>Despesas por ocorrência</span>
          <strong className="negative">
            {formatCurrency(totalExpenses)}
          </strong>
        </article>
      </div>

      <section className="panel recurrences-panel">
        <div className="panel-heading">
          <div>
            <h2>Seus lançamentos recorrentes</h2>
            <p>Consulte e gerencie seus compromissos financeiros.</p>
          </div>
        </div>

        {recurrences.length === 0 ? (
          <div className="recurrences-empty">
            <Repeat size={34} />
            <strong>Nenhuma recorrência cadastrada</strong>
            <p>Adicione uma receita ou despesa que se repete.</p>
          </div>
        ) : (
          <div className="recurrences-list">
            {recurrences
              .slice()
              .sort(
                (a, b) =>
                  new Date(a.nextDate) - new Date(b.nextDate)
              )
              .map((item) => (
                <div className="recurrence-item" key={item.id}>
                  <div className="recurrence-item-info">
                    <div
                      className={`recurrence-icon ${item.type}`}
                    >
                      {item.type === "income" ? (
                        <TrendingUp size={19} />
                      ) : (
                        <TrendingDown size={19} />
                      )}
                    </div>

                    <div>
                      <strong>{item.name}</strong>
                      <small>
                        {item.category} · {item.frequency}
                      </small>
                    </div>
                  </div>

                  <div className="recurrence-item-details">
                    <strong
                      className={
                        item.type === "income"
                          ? "positive"
                          : "negative"
                      }
                    >
                      {item.type === "income" ? "+" : "-"}
                      {formatCurrency(item.value)}
                    </strong>

                    <span>
                      <CalendarDays size={13} />
                      {formatDate(item.nextDate)}
                    </span>
                  </div>

                  <div className="recurrence-actions">
                    <button
                      className="recurrence-action edit"
                      onClick={() => openModal(item)}
                      title="Editar recorrência"
                    >
                      <Pencil size={16} />
                    </button>

                    <button
                      className="recurrence-action delete"
                      onClick={() => handleDelete(item.id)}
                      title="Excluir recorrência"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
          </div>
        )}
      </section>

      {modalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div
            className="transaction-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="modal-header">
              <div>
                <h2>
                  {editingRecurrence
                    ? "Editar recorrência"
                    : "Nova recorrência"}
                </h2>
                <p>Configure os detalhes do lançamento periódico.</p>
              </div>

              <button className="modal-close" onClick={closeModal}>
                ×
              </button>
            </div>

            <form onSubmit={handleSave}>
              <label htmlFor="recurrence-name">Descrição</label>
              <input
                id="recurrence-name"
                type="text"
                placeholder="Ex.: Aluguel"
                value={form.name}
                onChange={(event) =>
                  setForm({ ...form, name: event.target.value })
                }
                required
              />

              <label>Tipo</label>
              <div className="transaction-type-selector">
                <button
                  type="button"
                  className={
                    form.type === "expense" ? "selected expense" : ""
                  }
                  onClick={() => handleTypeChange("expense")}
                >
                  Despesa
                </button>

                <button
                  type="button"
                  className={
                    form.type === "income" ? "selected income" : ""
                  }
                  onClick={() => handleTypeChange("income")}
                >
                  Receita
                </button>
              </div>

              <label htmlFor="recurrence-value">Valor (R$)</label>
              <input
                id="recurrence-value"
                type="number"
                min="0.01"
                step="0.01"
                placeholder="Ex.: 150"
                value={form.value}
                onChange={(event) =>
                  setForm({ ...form, value: event.target.value })
                }
                required
              />

              <label htmlFor="recurrence-category">Categoria</label>
              <select
                id="recurrence-category"
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

              <label htmlFor="recurrence-frequency">Frequência</label>
              <select
                id="recurrence-frequency"
                value={form.frequency}
                onChange={(event) =>
                  setForm({ ...form, frequency: event.target.value })
                }
              >
                {frequencies.map((frequency) => (
                  <option key={frequency} value={frequency}>
                    {frequency}
                  </option>
                ))}
              </select>

              <label htmlFor="recurrence-date">Próxima ocorrência</label>
              <input
                id="recurrence-date"
                type="date"
                value={form.nextDate}
                onChange={(event) =>
                  setForm({ ...form, nextDate: event.target.value })
                }
                required
              />

              <div className="modal-actions">
                <button
                  type="button"
                  className="cancel-button"
                  onClick={closeModal}
                >
                  Cancelar
                </button>

                <button type="submit" className="save-button">
                  Salvar recorrência
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Recurrences;
