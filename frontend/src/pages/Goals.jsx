import "../pages/Goals.css";

import { useMemo, useState, useEffect } from "react";
import {
  Target,
  TrendingUp,
  Plus,
  X,
  CheckCircle2,
  AlertCircle,
  Pencil,
  Trash2,
} from "lucide-react";

import { formatCurrency } from "../utils/formatCurrency";
import { api } from "../services/api";

function Goals() {
  const [goals, setGoals] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);

  const [form, setForm] = useState({
    title: "",
    targetAmount: "",
    currentAmount: "0",
    deadline: "",
    categoryId: "",
  });

  useEffect(() => {
    async function loadData() {
      try {
        const [goalsRes, transRes] = await Promise.all([
          api.get("/goals"),
          api.get("/transactions"),
        ]);
        setGoals(goalsRes);
        setTransactions(transRes);
      } catch (err) {
        console.error("Erro ao carregar metas:", err.message);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

  async function handleSaveGoal(event) {
    event.preventDefault();

    try {
      const payload = {
        title: form.title.trim(),
        targetAmount: Number(form.targetAmount),
        currentAmount: Number(form.currentAmount),
        deadline: form.deadline,
        categoryId: form.categoryId,
      };

      if (editingGoal) {
        const updated = await api.put(`/goals/${editingGoal.id}`, payload);
        setGoals((current) =>
          current.map((item) => (item.id === updated.id ? updated : item))
        );
      } else {
        const newGoal = await api.post("/goals", payload);
        setGoals((current) => [newGoal, ...current]);
      }

      closeModal();
    } catch (err) {
      alert("Erro ao salvar meta: " + err.message);
    }
  }

  async function handleDeleteGoal(id) {
    if (!window.confirm("Deseja realmente excluir esta meta?")) return;

    try {
      await api.delete(`/goals/${id}`);
      setGoals((current) => current.filter((item) => item.id !== id));
    } catch (err) {
      alert("Erro ao excluir meta: " + err.message);
    }
  }

  function openCreateModal() {
    setEditingGoal(null);
    setForm({
      title: "",
      targetAmount: "",
      currentAmount: "0",
      deadline: new Date().toISOString().slice(0, 10),
      categoryId: "",
    });
    setModalOpen(true);
  }

  function openEditModal(goal) {
    setEditingGoal(goal);
    setForm({
      title: goal.title,
      targetAmount: goal.targetAmount,
      currentAmount: goal.currentAmount,
      deadline: goal.deadline ? goal.deadline.slice(0, 10) : "",
      categoryId: goal.categoryId || "",
    });
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditingGoal(null);
  }

  const totalTarget = goals.reduce((acc, item) => acc + Number(item.targetAmount), 0);
  const totalCurrent = goals.reduce((acc, item) => acc + Number(item.currentAmount), 0);
  const completedGoals = goals.filter(
    (item) => Number(item.currentAmount) >= Number(item.targetAmount)
  ).length;

  if (isLoading) {
    return (
      <div className="goals-page">
        <p>Carregando metas...</p>
      </div>
    );
  }

  return (
    <div className="goals-page">
      <div className="goals-summary">
        <article className="panel goals-summary-card">
          <div className="goals-summary-icon blue">
            <Target size={20} />
          </div>
          <span>Total objetivado</span>
          <strong>{formatCurrency(totalTarget)}</strong>
        </article>

        <article className="panel goals-summary-card">
          <div className="goals-summary-icon green">
            <TrendingUp size={20} />
          </div>
          <span>Total acumulado</span>
          <strong className="positive">{formatCurrency(totalCurrent)}</strong>
        </article>

        <article className="panel goals-summary-card">
          <div className="goals-summary-icon purple">
            <CheckCircle2 size={20} />
          </div>
          <span>Metas concluídas</span>
          <strong>{completedGoals} de {goals.length}</strong>
        </article>
      </div>

      <section className="panel goals-panel">
        <div className="panel-heading statement-panel-heading">
          <div>
            <h2>Suas metas</h2>
            <p>Acompanhe e gerencie seus objetivos financeiros.</p>
          </div>

          <button
            className="statement-add-button"
            onClick={openCreateModal}
          >
            <Plus size={17} />
            Nova meta
          </button>
        </div>

        <div className="goals-list">
          {goals.map((goal) => {
            const target = Number(goal.targetAmount);
            const current = Number(goal.currentAmount);
            const percentage = target > 0 ? Math.min(Math.round((current / target) * 100), 100) : 0;
            const isCompleted = current >= target;

            const formattedDeadline = goal.deadline
              ? new Date(goal.deadline).toLocaleDateString("pt-BR")
              : "Sem prazo";

            return (
              <div className="goal-item" key={goal.id}>
                <div className="goal-item-top">
                  <div className="goal-info">
                    <div className="goal-icon">
                      <Target size={20} />
                    </div>
                    <div>
                      <strong>{goal.title}</strong>
                      <small>Prazo: {formattedDeadline}</small>
                    </div>
                  </div>

                  <div className="goal-actions">
                    <strong className={isCompleted ? "positive" : ""}>
                      {percentage}%
                    </strong>
                    <button
                      className="goal-action edit"
                      onClick={() => openEditModal(goal)}
                      title="Editar meta"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      className="goal-action delete"
                      onClick={() => handleDeleteGoal(goal.id)}
                      title="Excluir meta"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                <div className="goal-progress-track">
                  <div
                    className={`goal-progress-fill ${isCompleted ? "completed" : ""}`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>

                <div className="goal-footer">
                  <span>Acumulado: {formatCurrency(current)}</span>
                  <span>Meta: {formatCurrency(target)}</span>
                </div>
              </div>
            );
          })}

          {goals.length === 0 && (
            <div className="goals-empty">
              <Target size={32} />
              <strong>Nenhuma meta cadastrada</strong>
              <p>Crie objetivos financeiros para acompanhar sua evolução.</p>
            </div>
          )}
        </div>
      </section>

      {modalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="transaction-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2>{editingGoal ? "Editar meta" : "Nova meta"}</h2>
                <p>Defina o valor e prazo do seu objetivo.</p>
              </div>

              <button className="modal-close" onClick={closeModal}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveGoal}>
              <label htmlFor="goal-title">Título da meta</label>
              <input
                id="goal-title"
                type="text"
                placeholder="Ex.: Viagem de férias"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
              />

              <div className="form-row">
                <div>
                  <label htmlFor="goal-target">Valor alvo (R$)</label>
                  <input
                    id="goal-target"
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="0,00"
                    value={form.targetAmount}
                    onChange={(e) => setForm({ ...form, targetAmount: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="goal-current">Já guardado (R$)</label>
                  <input
                    id="goal-current"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0,00"
                    value={form.currentAmount}
                    onChange={(e) => setForm({ ...form, currentAmount: e.target.value })}
                    required
                  />
                </div>
              </div>

              <label htmlFor="goal-deadline">Prazo limite</label>
              <input
                id="goal-deadline"
                type="date"
                value={form.deadline}
                onChange={(e) => setForm({ ...form, deadline: e.target.value })}
              />

              <div className="modal-actions">
                <button type="button" className="cancel-button" onClick={closeModal}>
                  Cancelar
                </button>
                <button type="submit" className="save-button">
                  Salvar meta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Goals;