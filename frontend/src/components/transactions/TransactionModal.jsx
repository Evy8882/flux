import { useState } from "react";
import { X, TrendingUp, TrendingDown } from "lucide-react";
import { api } from "../../services/api";

const STATIC_CATEGORIES = [
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

function TransactionModal({ isOpen, onClose, onSave }) {
  const [form, setForm] = useState({
    description: "",
    type: "despesa",
    amount: "",
    date: new Date().toISOString().slice(0, 10),
    categoryId: STATIC_CATEGORIES[0].name,
  });

  if (!isOpen) return null;

  function handleTypeChange(type) {
    setForm((prev) => ({
      ...prev,
      type,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      const payload = {
        description: form.description.trim(),
        type: form.type, // "despesa" ou "receita"
        amount: Number(form.amount),
        date: form.date,
        categoryId: form.categoryId, // Se o seu backend aceitar o nome ou ID direto
      };

      const newTransaction = await api.post("/transactions", payload);

      if (onSave) {
        onSave(newTransaction);
      }

      setForm({
        description: "",
        type: "despesa",
        amount: "",
        date: new Date().toISOString().slice(0, 10),
        categoryId: STATIC_CATEGORIES[0].name,
      });

      onClose();
    } catch (err) {
      alert("Erro ao salvar transação: " + err.message);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="transaction-modal"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="modal-header">
          <div>
            <h2>Nova transação</h2>
            <p>Preencha os dados da movimentação.</p>
          </div>

          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <label>Tipo de transação</label>

          <div className="type-selector">
            <button
              type="button"
              className={
                form.type === "despesa"
                  ? "selected expense-option"
                  : ""
              }
              onClick={() => handleTypeChange("despesa")}
            >
              <TrendingDown size={18} /> Despesa
            </button>

            <button
              type="button"
              className={
                form.type === "receita"
                  ? "selected income-option"
                  : ""
              }
              onClick={() => handleTypeChange("receita")}
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
            onChange={(event) =>
              setForm({ ...form, description: event.target.value })
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
                value={form.amount}
                onChange={(event) =>
                  setForm({ ...form, amount: event.target.value })
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
            value={form.categoryId}
            onChange={(event) =>
              setForm({ ...form, categoryId: event.target.value })
            }
            required
          >
            {STATIC_CATEGORIES.map((category) => (
              <option key={category.id} value={category.name}>
                {category.name}
              </option>
            ))}
          </select>

          <div className="modal-actions">
            <button
              type="button"
              className="cancel-button"
              onClick={onClose}
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
  );
}

export default TransactionModal;