import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Clock, Users } from 'lucide-react';
import { formatDate, formatCurrency, getSeatStatusColor, getSeatStatusLabel, getCategoryColor, daysUntil } from '../utils/helpers';

export default function EventCard({ event }) {
  const navigate = useNavigate();
  const cat = getCategoryColor(event.category);
  const seatColor = getSeatStatusColor(event.availableSeats, event.totalSeats);
  const seatPct = Math.round(((event.totalSeats - event.availableSeats) / event.totalSeats) * 100);
  const days = daysUntil(event.date);

  return (
    <div className="event-card" onClick={() => navigate(`/events/${event.id}`)}>
      {/* Image */}
      <div className="event-card-img">
        <img
          src={event.image}
          alt={event.name}
          loading="lazy"
          onError={e => { e.target.src = `https://picsum.photos/seed/${event.id}/800/400`; }}
        />
        <div className="event-card-img-overlay" />
        <div className="event-card-badges">
          <span className="badge badge-primary" style={{ background: `${cat.bg}`, color: cat.text, border: `1px solid ${cat.border}` }}>
            {event.category}
          </span>
          {event.isFeatured && <span className="badge badge-warning">⭐ Featured</span>}
          {days <= 7 && days >= 0 && <span className="badge badge-danger">🔥 Soon</span>}
        </div>
        <div className="event-card-price">{formatCurrency(event.price)}</div>
      </div>

      {/* Body */}
      <div className="event-card-body">
        <h3 className="event-card-title">{event.name}</h3>
        <div className="event-card-meta">
          <div className="event-card-meta-item"><Calendar size={12} /> {formatDate(event.date)}</div>
          <div className="event-card-meta-item"><Clock size={12} /> {event.time}</div>
          <div className="event-card-meta-item"><MapPin size={12} /> {event.venue}</div>
        </div>

        {/* Seat availability */}
        <div style={{ marginTop: 'auto' }}>
          <div className="progress-bar-wrap">
            <div className="progress-bar-label">
              <span style={{ color: seatColor, fontWeight: 600, fontSize: '0.7rem' }}>
                {getSeatStatusLabel(event.availableSeats, event.totalSeats)}
              </span>
              <span style={{ color: 'var(--color-text-3)', fontSize: '0.7rem' }}>
                {event.availableSeats}/{event.totalSeats} seats
              </span>
            </div>
            <div className="progress-bar-track">
              <div className="progress-bar-fill" style={{ width: `${seatPct}%`, background: seatColor }} />
            </div>
          </div>
        </div>

        <div className="event-card-footer">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: 'var(--text-xs)', color: 'var(--color-text-3)' }}>
            <Users size={12} />
            {event.bookingsCount || 0} booked
          </div>
          <span style={{ fontSize: 'var(--text-xs)', color: days < 0 ? 'var(--color-danger)' : days <= 7 ? 'var(--color-warning)' : 'var(--color-text-3)' }}>
            {days < 0 ? 'Past' : days === 0 ? 'Today!' : `${days}d left`}
          </span>
        </div>
      </div>
    </div>
  );
}
