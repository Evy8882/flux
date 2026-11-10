function FinancialChart() {
  const chartData = [45, 70, 52, 85, 60, 95, 65, 78, 48, 88, 58, 75];

  return (
    <article className="panel chart-panel">
      <div className="panel-heading">
        <div>
          <h2>Fluxo financeiro</h2>
          <p>Receitas e despesas cadastradas</p>
        </div>

        <span className="period-label">Geral</span>
      </div>

      <div className="chart-placeholder">
        <div className="chart-bars">
          {chartData.map((height, index) => (
            <div className="bar-group" key={index}>
              <div
                className="bar income-bar"
                style={{ height: `${height}%` }}
              />

              <div
                className="bar expense-bar"
                style={{ height: `${height * 0.55}%` }}
              />
            </div>
          ))}
        </div>

        <div className="chart-legend">
          <span>
            <i className="legend-dot blue-dot" /> Receitas
          </span>

          <span>
            <i className="legend-dot purple-dot" /> Despesas
          </span>
        </div>
      </div>
    </article>
  );
}

export default FinancialChart;