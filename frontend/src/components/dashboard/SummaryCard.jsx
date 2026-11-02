function SummaryCard({ title, value, subtitle, icon: Icon, type }) {
  return (
    <article className={`summary-card ${type === "balance" ? "balance-card" : ""}`}>
      {type === "balance" ? (
        <>
          <span>{title}</span>
          <div className="balance-value">{value}</div>
          <small className="positive">{subtitle}</small>
          <div className="card-decoration">R$</div>
        </>
      ) : (
        <>
          <div className="card-heading">
            <span>{title}</span>
            <div className={`metric-icon ${type}`}>
              {Icon && <Icon size={19} />}
            </div>
          </div>

          <div className="metric-value">{value}</div>

          <small className={type === "income" ? "positive" : "negative"}>
            {subtitle}
          </small>
        </>
      )}
    </article>
  );
}

export default SummaryCard;