import { getSeatStatusColor, getSeatStatusLabel, getSeatPercentage } from '../utils/helpers';

export default function SeatsProgress({ available, total }) {
  const color = getSeatStatusColor(available, total);
  const label = getSeatStatusLabel(available, total);
  const percentage = getSeatPercentage(available, total);

  return (
    <div className="progress-bar-wrap" style={{ marginTop: '0.5rem' }}>
      <div className="progress-bar-label">
        <span style={{ color, fontWeight: 600 }}>{label}</span>
        <span>{available} / {total} Available</span>
      </div>
      <div className="progress-bar-track">
        <div 
          className="progress-bar-fill" 
          style={{ width: `${percentage}%`, background: color }} 
        />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: 'var(--color-text-3)', marginTop: '0.25rem' }}>
        <span>0%</span>
        <span>Booked: {percentage}%</span>
        <span>100%</span>
      </div>
    </div>
  );
}
