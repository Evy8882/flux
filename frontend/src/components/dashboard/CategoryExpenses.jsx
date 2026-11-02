const categoryData = [
  ["Alimentação", "R$ 850,00", "36%", "food"],
  ["Transporte", "R$ 620,00", "26%", "transport"],
  ["Moradia", "R$ 500,00", "21%", "home"],
  ["Outros", "R$ 380,00", "17%", "other"],
];

function CategoryExpenses() {
  return (
    <article className="panel">
      <div className="panel-heading">
        <div>
          <h2>Despesas por categoria</h2>
          <p>Distribuição dos seus gastos</p>
        </div>
      </div>

      <div className="category-list">
        {categoryData.map(([name, value, percent, type]) => (
          <div className="category-row" key={name}>
            <div className="category-info">
              <span className={`category-dot ${type}`} />
              <span>{name}</span>
              <strong>{value}</strong>
            </div>

            <div className="progress-track">
              <div
                className={`progress-fill ${type}`}
                style={{ width: percent }}
              />
            </div>
          </div>
        ))}
      </div>
    </article>
  );
}

export default CategoryExpenses;