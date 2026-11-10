import { useState } from "react";
import { X, TrendingUp, TrendingDown } from "lucide-react";
import { categories } from "../../data/categories";

function TransactionModal({ isOpen, onClose, onSave }) {
  const [form, setForm] = useState({
    name: "",
    type: "expense",
    value: "",
    date: new Date().toISOString().slice(0, 10),
    category: categories.expense[0],
  });

  if (!isOpen) return null;

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

    onSave(newTransaction);

    setForm({
      name: "",
      type: "expense",
      value: "",
      date: new Date().toISOString().slice(0, 10),
      category: categories.expense[0],
    });

    onClose();
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