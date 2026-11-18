import "../pages/Goals.css";
import { useEffect, useState } from "react";
import {
  Target,
  Plus,
  Pencil,
  Trash2,
  CalendarDays,
  CircleDollarSign,
  Trophy,
} from "lucide-react";

import { formatCurrency } from "../utils/formatCurrency";
import { api } from "../services/api";

function Goals() {
  const [goals, setGoals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);

  const [form, setForm] = useState({
    title: "",
    targetAmount: "",
    currentAmount: "",
    deadline: "",
  });

  useEffect(() => {
    async function loadGoals() {
      try {
        const data = await api.get("/goals");
        setGoals(data);
      } catch (err) {
        console.error("Erro ao carregar metas:", err.message);
      } finally {
        setIsLoading(false);
      }
    }
    loadGoals();
  }, []);

  const totalTarget = goals.reduce((total, goal) => total + Number(goal.targetAmount), 0);
  const totalSaved = goals.reduce((total, goal) => total + Number(goal.currentAmount), 0);

  function openModal(goal = null) {
    if (goal && goal.id) {
      setEditingGoal(goal);
      setForm({
        title: goal.title || "",
        targetAmount: String(goal.targetAmount || ""),
        currentAmount: String(goal.currentAmount || ""),
        deadline: goal.deadline ? goal.deadline.slice(0, 10) : "",
      });
    } else {
      setEditingGoal(null);
      setForm({ title: "", targetAmount: "", currentAmount: "", deadline: "" });
    }
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditingGoal(null);
  }

  async function handleSave(event) {
    event.preventDefault();

    try {
      const payload = {
        title: form.title.trim(),
        targetAmount: Number(form.targetAmount),
        currentAmount: Number(form.currentAmount || 0),
        deadline: form.deadline,
      };

      let savedGoal;
      
      // Separado de forma estrita para evitar erros de rota
      if (editingGoal && editingGoal.id) {
        savedGoal = await api.put(`/goals/${editingGoal.id}`, payload);
        setGoals((current) =>
          current.map((g) => (g.id === editingGoal.id ? savedGoal : g))
        );
      } else {
        savedGoal = await api.post("/goals", payload);
        setGoals((current) => [...current, savedGoal]);
      }

      closeModal();
    } catch (err) {
      alert("Erro ao salvar meta: " + err.message);
    }
  }

  async function handleDelete(id) {
    const confirmed = window.confirm("Deseja realmente excluir esta meta?");
    if (!confirmed) return;

    try {
      await api.delete(`/goals/${id}`);
      setGoals((current) => current.filter((goal) => goal.id !== id));
    } catch (err) {
      alert("Erro ao excluir meta: " + err.message);
    }
  }

  if (isLoading) {
    return <div className="goals-page"><p>Carregando metas...</p></div>;
  }

  return (
    <div className="goals-page">
      <div className="welcome">
        <div>
          <span className="eyebrow">PLANEJAMENTO FINANCEIRO</span>
          <h1>Metas</h1>
          <p>Defina objetivos e acompanhe suas conquistas.</p>
        </div>

        <button className="primary-button" onClick={() => openModal(null)}>
          <Plus size={17} />
          Nova meta
        </button>
      </div>

      <div className="goals-summary">
        <article className="panel goals-summary-card">
          <div className="goals-summary-icon blue"><Target size={20} /></div>
          <span>Metas cadastradas</span>
          <strong>{goals.length}</strong>
        </article>

        <article className="panel goals-summary-card">
          <div className="goals-summary-icon green"><CircleDollarSign size={20} /></div>
          <span>Total acumulado</span>
          <strong className="positive">{formatCurrency(totalSaved)}</strong>
        </article>

        <article className="panel goals-summary-card">
          <div className="goals-summary-icon purple"><Trophy size={20} /></div>
          <span>Valor total das metas</span>
          <strong>{formatCurrency(totalTarget)}</strong>
        </article>
      </div>

      <section className="panel goals-panel">
        <div className="panel-heading">
          <div>
            <h2>Seus objetivos</h2>
            <p>Acompanhe o progresso de cada conquista.</p>
          </div>
        </div>

        {goals.length === 0 ? (
          <div className="goals-empty">
            <Target size={34} />
            <strong>Nenhuma meta cadastrada</strong>
            <p>Crie sua primeira meta e comece a planejar suas conquistas.</p>
          </div>
        ) : (
          <div className="goals-list">
            {goals.map((goal) => {
              const percentage = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;
              const completed = percentage >= 100;

              return (
                <div className="goal-item" key={goal.id}>
                  <div className="goal-item-top">
                    <div className="goal-info">
                      <div className="goal-icon">
                        {completed ? <Trophy size={20} /> : <Target size={20} />}
                      </div>
                      <div>
                        <strong>{goal.title}</strong>
                        <small>
                          {formatCurrency(goal.currentAmount)} de {formatCurrency(goal.targetAmount)}
                        </small>
                      </div>
                    </div>

                    <div className="goal-actions">
                      <strong className={completed ? "positive" : ""}>{Math.round(percentage)}%</strong>
                      <button className="goal-action edit" onClick={() => openModal(goal)} title="Editar">
                        <Pencil size={16} />
                      </button>
                      <button className="goal-action delete" onClick={() => handleDelete(goal.id)} title="Excluir">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="goal-progress-track">
                    <div
                      className={`goal-progress-fill ${completed ? "completed" : ""}`}
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    />
                  </div>

                  <div className="goal-footer">
                    <span>
                      {completed ? "Meta alcançada!" : `Faltam ${formatCurrency(Math.max(goal.targetAmount - goal.currentAmount, 0))}`}
                    </span>
                    {goal.deadline && (
                      <span>
                        <CalendarDays size={13} />
                        {new Date(goal.deadline).toLocaleDateString("pt-BR")}
                      </span>
                    )}
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
                <h2>{editingGoal ? "Editar meta" : "Nova meta"}</h2>
                <p>Preencha os dados do seu objetivo.</p>
              </div>
              <button className="modal-close" onClick={closeModal}>×</button>
            </div>

            <form onSubmit={handleSave}>
              <label>Nome da meta</label>
              <input
                type="text"
                placeholder="Ex.: Comprar um notebook"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
              />

              <label>Valor desejado (R$)</label>
              <input
                type="number"
                min="0.01"
                step="0.01"
                placeholder="Ex.: 5000"
                value={form.targetAmount}
                onChange={(e) => setForm({ ...form, targetAmount: e.target.value })}
                required
              />

              <label>Valor já acumulado (R$)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="Ex.: 1000"
                value={form.currentAmount}
                onChange={(e) => setForm({ ...form, currentAmount: e.target.value })}
              />

              <label>Prazo</label>
              <input
                type="date"
                value={form.deadline}
                onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                required
              />

              <div className="modal-actions">
                <button type="button" className="cancel-button" onClick={closeModal}>Cancelar</button>
                <button type="submit" className="save-button">Salvar meta</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Goals;