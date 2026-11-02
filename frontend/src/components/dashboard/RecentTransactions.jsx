import { TrendingUp, TrendingDown } from "lucide-react";
import { formatCurrency } from "../../utils/formatCurrency";

function RecentTransactions({ transactions, onViewAll }) {
  return (
    <article className="panel transactions-panel">
      <div className="panel-heading">
        <div>
          <h2>Transações recentes</h2>
          <p>Suas últimas movimentações</p>
        </div>

        <button className="text-button" onClick={onViewAll}>
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
                {item.category} · {item.date.split("-").reverse().join("/")}
              </small>
            </div>

            <strong className={item.type === "income" ? "positive" : ""}>
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
  );
}

export default RecentTransactions;