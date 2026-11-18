import { formatCurrency } from "../../utils/formatCurrency";

function CategoryExpenses({ categoriesData = [] }) {
  const totalExpenseSum = categoriesData.reduce((acc, cat) => acc + Number(cat.total || 0), 0);

  return (
    <article className="panel">
      <div className="panel-heading">
        <div>
          <h2>Despesas por categoria</h2>
          <p>Distribuição dos seus gastos</p>
        </div>
      </div>

      <div className="category-list">
        {categoriesData.length === 0 ? (
          <p>Nenhuma despesa registrada por categoria.</p>
        ) : (
          categoriesData.map((cat) => {
            const percentage = totalExpenseSum > 0 ? Math.round((cat.total / totalExpenseSum) * 100) : 0;

            return (
              <div className="category-row" key={cat.id || cat.name}>
                <div className="category-info">
                  <span
                    className="category-dot"
                    style={{ backgroundColor: cat.color || "#3b82f6" }}
                  />
                  <span>{cat.name}</span>
                  <strong>{formatCurrency(cat.total)}</strong>
                </div>

                <div className="progress-track">
                  <div
                    className="progress-fill"
                    style={{
                      width: `${percentage}%`,
                      backgroundColor: cat.color || "#3b82f6",
                    }}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>
    </article>
  );
}

export default CategoryExpenses;