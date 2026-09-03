import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Calendar, MapPin, Clock, Users, ArrowLeft, Tag, Share2, Ticket, AlertCircle } from 'lucide-react';
import { formatDate, formatCurrency, getCategoryColor, daysUntil } from '../utils/helpers';
import SeatsProgress from '../components/SeatsProgress';
import LoadingSpinner from '../components/LoadingSpinner';

export default function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { ds, showToast } = useApp();
  
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate slight loading to show spinner
    setLoading(true);
    setTimeout(() => {
      // Find event using Array.findById (O(n))
      const found = ds.eventArray.findById(id);
      setEvent(found);
      setLoading(false);
    }, 400);
  }, [id, ds]);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: event.name,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      showToast('Link copied to clipboard!', 'success');
    }
  };

  if (loading) return <LoadingSpinner fullScreen />;
  
  if (!event) {
    return (
      <div className="page container flex-center flex-col" style={{ minHeight: '60vh' }}>
        <div className="empty-state-icon">🎟️</div>
        <h3>Event Not Found</h3>
        <p className="text-muted">The event you are looking for does not exist or has been removed.</p>
        <button className="btn btn-primary mt-4" onClick={() => navigate('/events')}>
          Browse Events
        </button>
      </div>
    );
  }

  const catColor = getCategoryColor(event.category);
  const isSoldOut = event.availableSeats === 0;
  const daysLeft = daysUntil(event.date);
  const isPast = daysLeft < 0;

  return (
    <div className="page fade-in" style={{ paddingTop: 'calc(var(--nav-h) + var(--space-4))' }}>
      <div className="container">
        
        {/* Back button */}
        <button 
          className="btn btn-ghost btn-sm" 
          style={{ marginBottom: 'var(--space-4)' }}
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={16} /> Back
        </button>

        <div className="event-detail-hero">
          <img 
            src={event.image} 
            alt={event.name} 
            onError={e => { e.target.src = `https://picsum.photos/seed/${event.id}/1200/600`; }}
          />
          <div className="event-detail-hero-overlay" />
          <div className="event-detail-hero-content">
            <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-4)', flexWrap: 'wrap' }}>
              <span className="badge badge-primary" style={{ background: catColor.bg, color: catColor.text, border: `1px solid ${catColor.border}` }}>
                {event.category}
              </span>
              {event.isFeatured && <span className="badge badge-warning">⭐ Featured</span>}
              {isSoldOut && !isPast && <span className="badge badge-danger">Sold Out</span>}
              {isPast && <span className="badge badge-info">Past Event</span>}
            </div>
            <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', color: '#fff', marginBottom: 'var(--space-2)' }}>
              {event.name}
            </h1>
          </div>
        </div>

        <div className="event-detail-layout">
          {/* Main Info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
            
            <div className="card card-body" style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-6)', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                <div style={{ width: 48, height: 48, borderRadius: 'var(--radius)', background: 'rgba(59,130,246,0.1)', color: 'var(--color-primary-l)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Calendar size={24} />
                </div>
                <div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Date</div>
                  <div style={{ fontWeight: 600 }}>{formatDate(event.date)}</div>
                </div>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                <div style={{ width: 48, height: 48, borderRadius: 'var(--radius)', background: 'rgba(245,158,11,0.1)', color: '#fbbf24', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Clock size={24} />
                </div>
                <div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Time</div>
                  <div style={{ fontWeight: 600 }}>{event.time}</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                <div style={{ width: 48, height: 48, borderRadius: 'var(--radius)', background: 'rgba(34,197,94,0.1)', color: '#4ade80', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <MapPin size={24} />
                </div>
                <div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Location</div>
                  <div style={{ fontWeight: 600 }}>{event.venue}</div>
                </div>
              </div>
            </div>

            <div className="card card-body">
              <h3 style={{ marginBottom: 'var(--space-4)' }}>About this Event</h3>
              <p style={{ color: 'var(--color-text-2)', lineHeight: 1.8, fontSize: 'var(--text-base)', whiteSpace: 'pre-line' }}>
                {event.description}
              </p>
              
              {event.tags && event.tags.length > 0 && (
                <div style={{ marginTop: 'var(--space-6)' }}>
                  <h4 style={{ fontSize: 'var(--text-sm)', marginBottom: 'var(--space-3)', color: 'var(--color-text)' }}>Tags</h4>
                  <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                    {event.tags.map(tag => (
                      <span key={tag} className="badge" style={{ background: 'var(--color-bg-2)', border: '1px solid var(--color-border)', color: 'var(--color-text-2)' }}>
                        <Tag size={10} /> {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
          </div>

          {/* Booking Sidebar */}
          <div>
            <div className="event-booking-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-6)' }}>
                <div>
                  <div style={{ fontSize: 'var(--text-3xl)', fontWeight: 800, color: 'var(--color-text)', lineHeight: 1 }}>
                    {formatCurrency(event.price)}
                  </div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-3)', marginTop: '0.25rem' }}>per ticket</div>
                </div>
                <button className="btn btn-ghost btn-sm" onClick={handleShare}>
                  <Share2 size={16} />
                </button>
              </div>

              <div style={{ marginBottom: 'var(--space-6)' }}>
                <SeatsProgress available={event.availableSeats} total={event.totalSeats} />
              </div>
              
              {isPast ? (
                 <div className="badge badge-info w-full" style={{ padding: '1rem', justifyContent: 'center', fontSize: 'var(--text-sm)' }}>
                   This event has ended
                 </div>
              ) : (
                <button 
                  className={`btn ${isSoldOut ? 'btn-warning' : 'btn-primary'} btn-lg w-full`}
                  style={{ justifyContent: 'center' }}
                  onClick={() => navigate(`/book/${event.id}`)}
                >
                  <Ticket size={18} />
                  {isSoldOut ? 'Join Waiting List' : 'Book Tickets Now'}
                </button>
              )}

              {isSoldOut && !isPast && (
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', padding: '0.75rem', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 'var(--radius)', fontSize: '0.75rem', color: '#fbbf24' }}>
                  <AlertCircle size={16} style={{ flexShrink: 0 }} />
                  <span>Tickets are sold out. You can join the waiting list. If someone cancels, you will automatically get a ticket.</span>
                </div>
              )}

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginTop: '1.5rem', fontSize: 'var(--text-sm)', color: 'var(--color-text-3)' }}>
                <Users size={14} />
                {event.bookingsCount || 0} people have booked this
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
