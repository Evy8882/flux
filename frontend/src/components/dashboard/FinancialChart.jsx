import { formatCurrency } from "../../utils/formatCurrency";

function FinancialChart({ monthlyData = [] }) {
  // Se não houver dados, exibe um array vazio
  const data = monthlyData.length > 0 ? monthlyData : [];

  // Encontra o maior valor para calcular a proporção percentual da altura das barras
  const maxVal = Math.max(
    ...data.map((item) => Math.max(item.receitas, item.despesas)),
    100
  );

  return (
    <article className="panel chart-panel">
      <div className="panel-heading">
        <div>
          <h2>Fluxo financeiro</h2>
          <p>Evolução de receitas e despesas</p>
        </div>

        <span className="period-label">Últimos meses</span>
      </div>

      <div className="chart-placeholder">
        {data.length === 0 ? (
          <p className="chart-empty">Nenhum dado financeiro registrado ainda.</p>
        ) : (
          <>
            <div className="chart-bars">
              {data.map((item, index) => {
                const incomeHeight = Math.round((item.receitas / maxVal) * 100);
                const expenseHeight = Math.round((item.despesas / maxVal) * 100);

                return (
                  <div className="bar-group" key={index} title={`${item.mes}: Rec: ${formatCurrency(item.receitas)} | Desp: ${formatCurrency(item.despesas)}`}>
                    <div
                      className="bar income-bar"
                      style={{ height: `${Math.max(incomeHeight, 4)}%` }}
                    />
                    <div
                      className="bar expense-bar"
                      style={{ height: `${Math.max(expenseHeight, 4)}%` }}
                    />
                    <span className="bar-label">{item.mes.split("-").reverse().join("/")}</span>
                  </div>
                );
              })}
            </div>

            <div className="chart-legend">
              <span>
                <i className="legend-dot blue-dot" /> Receitas
              </span>
              <span>
                <i className="legend-dot purple-dot" /> Despesas
              </span>
            </div>
          </>
        )}
      </div>
    </article>
  );
}

export default FinancialChart;