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

function Goals() {
  const [goals, setGoals] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("flux-goals")) || [];
    } catch {
      return [];
    }
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);

  const [form, setForm] = useState({
    name: "",
    target: "",
    saved: "",
    deadline: "",
  });

  useEffect(() => {
    localStorage.setItem("flux-goals", JSON.stringify(goals));
  }, [goals]);

  const totalTarget = goals.reduce(
    (total, goal) => total + Number(goal.target),
    0
  );

  const totalSaved = goals.reduce(
    (total, goal) => total + Number(goal.saved),
    0
  );

  function openModal(goal = null) {
    setEditingGoal(goal);

    setForm(
      goal
        ? {
            name: goal.name,
            target: String(goal.target),
            saved: String(goal.saved),
            deadline: goal.deadline,
          }
        : {
            name: "",
            target: "",
            saved: "",
            deadline: "",
          }
    );

    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditingGoal(null);
  }

  function handleSave(event) {
    event.preventDefault();

    const newGoal = {
      id: editingGoal?.id || Date.now(),
      name: form.name.trim(),
      target: Number(form.target),
      saved: Number(form.saved || 0),
      deadline: form.deadline,
    };

    setGoals((current) => {
      if (editingGoal) {
        return current.map((goal) =>
          goal.id === editingGoal.id ? newGoal : goal
        );
      }

      return [...current, newGoal];
    });

    closeModal();
  }

  function handleDelete(id) {
    const confirmed = window.confirm(
      "Deseja realmente excluir esta meta?"
    );

    if (confirmed) {
      setGoals((current) => current.filter((goal) => goal.id !== id));
    }
  }

  return (
    <div className="goals-page">
      <div className="welcome">
        <div>
          <span className="eyebrow">PLANEJAMENTO FINANCEIRO</span>
          <h1>Metas</h1>
          <p>Defina objetivos e acompanhe suas conquistas.</p>
        </div>

        <button className="primary-button" onClick={() => openModal()}>
          <Plus size={17} />
          Nova meta
        </button>
      </div>

      <div className="goals-summary">
        <article className="panel goals-summary-card">
          <div className="goals-summary-icon blue">
            <Target size={20} />
          </div>
          <span>Metas cadastradas</span>
          <strong>{goals.length}</strong>
        </article>

        <article className="panel goals-summary-card">
          <div className="goals-summary-icon green">
            <CircleDollarSign size={20} />
          </div>
          <span>Total acumulado</span>
          <strong className="positive">
            {formatCurrency(totalSaved)}
          </strong>
        </article>

        <article className="panel goals-summary-card">
          <div className="goals-summary-icon purple">
            <Trophy size={20} />
          </div>
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
              const percentage =
                goal.target > 0
                  ? (goal.saved / goal.target) * 100
                  : 0;

              const completed = percentage >= 100;

              return (
                <div className="goal-item" key={goal.id}>
                  <div className="goal-item-top">
                    <div className="goal-info">
                      <div className="goal-icon">
                        {completed ? (
                          <Trophy size={20} />
                        ) : (
                          <Target size={20} />
                        )}
                      </div>

                      <div>
                        <strong>{goal.name}</strong>
                        <small>
                          {formatCurrency(goal.saved)} de{" "}
                          {formatCurrency(goal.target)}
                        </small>
                      </div>
                    </div>

                    <div className="goal-actions">
                      <strong className={completed ? "positive" : ""}>
                        {Math.round(percentage)}%
                      </strong>

                      <button
                        className="goal-action edit"
                        onClick={() => openModal(goal)}
                        title="Editar meta"
                      >
                        <Pencil size={16} />
                      </button>

                      <button
                        className="goal-action delete"
                        onClick={() => handleDelete(goal.id)}
                        title="Excluir meta"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="goal-progress-track">
                    <div
                      className={`goal-progress-fill ${
                        completed ? "completed" : ""
                      }`}
                      style={{
                        width: `${Math.min(percentage, 100)}%`,
                      }}
                    />
                  </div>

                  <div className="goal-footer">
                    <span>
                      {completed
                        ? "Meta alcançada!"
                        : `Faltam ${formatCurrency(
                            Math.max(goal.target - goal.saved, 0)
                          )}`}
                    </span>

                    {goal.deadline && (
                      <span>
                        <CalendarDays size={13} />
                        {new Date(
                          `${goal.deadline}T12:00:00`
                        ).toLocaleDateString("pt-BR")}
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
          <div
            className="transaction-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="modal-header">
              <div>
                <h2>{editingGoal ? "Editar meta" : "Nova meta"}</h2>
                <p>Preencha os dados do seu objetivo.</p>
              </div>

              <button className="modal-close" onClick={closeModal}>
                ×
              </button>
            </div>

            <form onSubmit={handleSave}>
              <label htmlFor="goal-name">Nome da meta</label>
              <input
                id="goal-name"
                type="text"
                placeholder="Ex.: Comprar um notebook"
                value={form.name}
                onChange={(event) =>
                  setForm({ ...form, name: event.target.value })
                }
                required
              />

              <label htmlFor="goal-target">Valor desejado (R$)</label>
              <input
                id="goal-target"
                type="number"
                min="0.01"
                step="0.01"
                placeholder="Ex.: 5000"
                value={form.target}
                onChange={(event) =>
                  setForm({ ...form, target: event.target.value })
                }
                required
              />

              <label htmlFor="goal-saved">Valor já acumulado (R$)</label>
              <input
                id="goal-saved"
                type="number"
                min="0"
                step="0.01"
                placeholder="Ex.: 1000"
                value={form.saved}
                onChange={(event) =>
                  setForm({ ...form, saved: event.target.value })
                }
              />

              <label htmlFor="goal-deadline">Prazo (opcional)</label>
              <input
                id="goal-deadline"
                type="date"
                value={form.deadline}
                onChange={(event) =>
                  setForm({ ...form, deadline: event.target.value })
                }
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
