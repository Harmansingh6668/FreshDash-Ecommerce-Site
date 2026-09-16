function StatCard({ title, value, icon, description }) {
  return (
    <div className="stat-card">
      <div className="stat-card-top">
        <div>
          <p>{title}</p>
          <h2>{value}</h2>
        </div>

        <div className="stat-icon">{icon}</div>
      </div>

      {description && <span className="stat-description">{description}</span>}
    </div>
  );
}

export default StatCard;