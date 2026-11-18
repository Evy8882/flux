import "../pages/Recurrences.css";
import { useEffect, useState, useMemo } from "react";
import {
  Repeat,
  Plus,
  Pencil,
  Trash2,
  CalendarDays,
  TrendingUp,
  TrendingDown,
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

const frequencies = [
  { label: "Semanal", value: "semanal" },
  { label: "Mensal", value: "mensal" },
  { label: "Anual", value: "anual" },
];

function Recurrences() {
  const [recurrences, setRecurrences] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingRecurrence, setEditingRecurrence] = useState(null);

  const [form, setForm] = useState({
    description: "",
    type: "despesa",
    amount: "",
    categoryId: CATEGORIES[0].name,
    frequency: "mensal",
    nextDate: new Date().toISOString().slice(0, 10),
  });

  useEffect(() => {
    async function loadData() {
      try {
        const recsRes = await api.get("/recurrences");
        setRecurrences(recsRes);
      } catch (err) {
        console.error("Erro ao carregar recorrências:", err.message);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const totalIncome = recurrences
    .filter((item) => item.type === "receita")
    .reduce((total, item) => total + Number(item.amount), 0);

  const totalExpenses = recurrences
    .filter((item) => item.type === "despesa")
    .reduce((total, item) => total + Number(item.amount), 0);

  function openModal(recurrence = null) {
    setEditingRecurrence(recurrence);
    setForm(
      recurrence
        ? {
            description: recurrence.description,
            type: recurrence.type,
            amount: String(recurrence.amount),
            categoryId: recurrence.categoryId || CATEGORIES[0].name,
            frequency: recurrence.frequency,
            nextDate: recurrence.nextDate ? recurrence.nextDate.slice(0, 10) : "",
          }
        : {
            description: "",
            type: "despesa",
            amount: "",
            categoryId: CATEGORIES[0].name,
            frequency: "mensal",
            nextDate: new Date().toISOString().slice(0, 10),
          }
    );
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditingRecurrence(null);
  }

  async function handleSave(event) {
    event.preventDefault();

    try {
      const payload = {
        description: form.description.trim(),
        type: form.type,
        amount: Number(form.amount),
        categoryId: form.categoryId,
        frequency: form.frequency,
        nextDate: form.nextDate,
      };

      let savedRecurrence;
      if (editingRecurrence && editingRecurrence.id) {
        savedRecurrence = await api.put(`/recurrences/${editingRecurrence.id}`, payload);
        setRecurrences((current) =>
          current.map((item) => (item.id === editingRecurrence.id ? savedRecurrence : item))
        );
      } else {
        savedRecurrence = await api.post("/recurrences", payload);
        setRecurrences((current) => [...current, savedRecurrence]);
      }

      closeModal();
    } catch (err) {
      alert("Erro ao salvar recorrência: " + err.message);
    }
  }

  async function handleDelete(id) {
    const confirmed = window.confirm("Deseja realmente excluir esta recorrência?");
    if (!confirmed) return;

    try {
      await api.delete(`/recurrences/${id}`);
      setRecurrences((current) => current.filter((item) => item.id !== id));
    } catch (err) {
      alert("Erro ao excluir recorrência: " + err.message);
    }
  }

  if (isLoading) {
    return <div className="recurrences-page"><p>Carregando recorrências...</p></div>;
  }

  return (
    <div className="recurrences-page">
      <div className="welcome">
        <div>
          <span className="eyebrow">CONTROLE AUTOMÁTICO</span>
          <h1>Recorrências</h1>
          <p>Organize suas receitas e despesas periódicas.</p>
        </div>

        <button className="primary-button" onClick={() => openModal(null)}>
          <Plus size={17} />
          Nova recorrência
        </button>
      </div>

      <div className="recurrences-summary">
        <article className="panel recurrence-summary-card">
          <div className="recurrence-summary-icon blue"><Repeat size={20} /></div>
          <span>Recorrências cadastradas</span>
          <strong>{recurrences.length}</strong>
        </article>

        <article className="panel recurrence-summary-card">
          <div className="recurrence-summary-icon green"><TrendingUp size={20} /></div>
          <span>Receitas por ocorrência</span>
          <strong className="positive">{formatCurrency(totalIncome)}</strong>
        </article>

        <article className="panel recurrence-summary-card">
          <div className="recurrence-summary-icon red"><TrendingDown size={20} /></div>
          <span>Despesas por ocorrência</span>
          <strong className="negative">{formatCurrency(totalExpenses)}</strong>
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
            {recurrences.map((item) => {
              const isIncome = item.type === "receita";
              const catName = item.categoryId || "Geral";
              const formattedDate = item.nextDate ? new Date(item.nextDate).toLocaleDateString("pt-BR") : "";

              return (
                <div className="recurrence-item" key={item.id}>
                  <div className="recurrence-item-info">
                    <div className={`recurrence-icon ${isIncome ? "income" : "expense"}`}>
                      {isIncome ? <TrendingUp size={19} /> : <TrendingDown size={19} />}
                    </div>
                    <div>
                      <strong>{item.description}</strong>
                      <small>{catName} · {item.frequency}</small>
                    </div>
                  </div>

                  <div className="recurrence-item-details">
                    <strong className={isIncome ? "positive" : "negative"}>
                      {isIncome ? "+" : "-"}
                      {formatCurrency(item.amount)}
                    </strong>
                    <span>
                      <CalendarDays size={13} />
                      {formattedDate}
                    </span>
                  </div>

                  <div className="recurrence-actions">
                    <button className="recurrence-action edit" onClick={() => openModal(item)} title="Editar">
                      <Pencil size={16} />
                    </button>
                    <button className="recurrence-action delete" onClick={() => handleDelete(item.id)} title="Excluir">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {modalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="transaction-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2>{editingRecurrence ? "Editar recorrência" : "Nova recorrência"}</h2>
                <p>Configure os detalhes do lançamento periódico.</p>
              </div>
              <button className="modal-close" onClick={closeModal}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave}>
              <label>Tipo</label>
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

              <label>Descrição</label>
              <input
                type="text"
                placeholder="Ex.: Aluguel"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                required
              />

              <label>Valor (R$)</label>
              <input
                type="number"
                min="0.01"
                step="0.01"
                placeholder="Ex.: 150"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                required
              />

              <label>Categoria</label>
              <select
                value={form.categoryId}
                onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                required
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.name}>{cat.name}</option>
                ))}
              </select>

              <label>Frequência</label>
              <select
                value={form.frequency}
                onChange={(e) => setForm({ ...form, frequency: e.target.value })}
              >
                {frequencies.map((freq) => (
                  <option key={freq.value} value={freq.value}>{freq.label}</option>
                ))}
              </select>

              <label>Próxima ocorrência</label>
              <input
                type="date"
                value={form.nextDate}
                onChange={(e) => setForm({ ...form, nextDate: e.target.value })}
                required
              />

              <div className="modal-actions">
                <button type="button" className="cancel-button" onClick={closeModal}>Cancelar</button>
                <button type="submit" className="save-button">Salvar recorrência</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Recurrences;