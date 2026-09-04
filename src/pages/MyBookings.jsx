import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { XCircle, AlertCircle } from 'lucide-react';
import { isEventUpcoming } from '../utils/helpers';
import BookingBadge from '../components/BookingBadge';

export default function MyBookings() {
  const navigate = useNavigate();
  const { currentUser, bookings, cancelSeats } = useApp();

  const [activeTab, setActiveTab] = useState('upcoming');
  const [userBookings, setUserBookings] = useState({ upcoming: [], completed: [], cancelled: [] });

  // Cancel modal state
  const [cancelModal, setCancelModal] = useState(null);   // { booking }
  const [selectedSeats, setSelectedSeats] = useState([]); // seat numbers chosen
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (!currentUser) return;
    const myBookings = bookings.filter(b => b.userEmail === currentUser.email);
    setUserBookings({
      upcoming:  myBookings.filter(b => b.status === 'confirmed' && isEventUpcoming(b.eventDate)),
      completed: myBookings.filter(b => b.status === 'confirmed' && !isEventUpcoming(b.eventDate)),
      cancelled: myBookings.filter(b => b.status === 'cancelled'),
    });
  }, [bookings, currentUser]);

  const openCancelModal = (booking) => {
    setCancelModal(booking);
    setSelectedSeats([]);
  };

  const toggleSeat = (seatNumber) => {
    setSelectedSeats(prev =>
      prev.includes(seatNumber) ? prev.filter(s => s !== seatNumber) : [...prev, seatNumber]
    );
  };

  const handleCancelSelected = async () => {
    if (!selectedSeats.length) return;
    setCancelling(true);
    await cancelSeats(cancelModal.id, selectedSeats);
    setCancelling(false);
    setCancelModal(null);
    setSelectedSeats([]);
  };

  const displayList = userBookings[activeTab];

  return (
    <div className="page fade-in">
      <div className="container" style={{ maxWidth: '900px' }}>

        <div className="page-header">
          <h1>My Bookings</h1>
          <p>Manage your tickets and booking history.</p>
        </div>

        {/* Tabs */}
        <div className="tabs">
          {['upcoming', 'completed', 'cancelled'].map(tab => (
            <button
              key={tab}
              className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)} ({userBookings[tab].length})
            </button>
          ))}
        </div>

        {/* List */}
        <div>
          {displayList.length === 0 ? (
            <div className="empty-state card">
              <div className="empty-state-icon">🎫</div>
              <h3>No {activeTab} bookings</h3>
              <p>You don't have any {activeTab} bookings to show.</p>
              {activeTab === 'upcoming' && (
                <button className="btn btn-primary" onClick={() => navigate('/events')}>Browse Events</button>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              {displayList.map(booking => (
                <div key={booking.id} className="booking-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                      <BookingBadge status={booking.status} />
                    </div>
                    <h3 style={{ fontSize: 'var(--text-lg)', marginBottom: '0.25rem' }}>{booking.eventName}</h3>
                    <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-2)' }}>
                      <strong>Seat(s):</strong>{' '}
                      {booking.attendees && booking.attendees.length > 0
                        ? booking.attendees.map(a => `#${a.seatNumber}`).filter(Boolean).join(', ') || 'N/A'
                        : 'N/A'}
                    </div>
                  </div>

                  <div>
                    {activeTab === 'upcoming' && (
                      <button
                        className="btn btn-outline btn-sm"
                        onClick={() => openCancelModal(booking)}
                        style={{ color: 'var(--color-danger)', borderColor: 'rgba(239,68,68,0.3)' }}
                      >
                        <XCircle size={14} /> Cancel Ticket
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Cancellation Policy note */}
        {activeTab === 'upcoming' && userBookings.upcoming.length > 0 && (
          <div style={{ marginTop: 'var(--space-6)', padding: '1rem', background: 'var(--color-surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
            <AlertCircle size={18} style={{ color: 'var(--color-primary-l)', flexShrink: 0, marginTop: '2px' }} />
            <div style={{ fontSize: 'var(--text-sm)' }}>
              <strong style={{ color: 'var(--color-text)', display: 'block', marginBottom: '0.25rem' }}>Cancellation Policy</strong>
              <span style={{ color: 'var(--color-text-2)' }}>Select specific seat(s) to cancel. Freed seats are auto-assigned to the next person on the waiting list.</span>
            </div>
          </div>
        )}

      </div>

      {/* ── Seat Selection Cancel Modal ── */}
      {cancelModal && (
        <div className="modal-overlay" style={{ zIndex: 1000 }}>
          <div className="modal" style={{ maxWidth: '420px' }}>
            <h2 style={{ marginBottom: '0.5rem' }}>Cancel Tickets</h2>
            <p style={{ color: 'var(--color-text-2)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-5)' }}>
              Select which seat(s) you want to cancel for <strong>{cancelModal.eventName}</strong>.
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: 'var(--space-6)' }}>
              {(cancelModal.attendees || []).map((a, idx) => {
                const sn = a.seatNumber;
                const selected = selectedSeats.includes(sn);
                return (
                  <button
                    key={idx}
                    onClick={() => toggleSeat(sn)}
                    style={{
                      width: '64px', height: '64px',
                      borderRadius: 'var(--radius)',
                      border: selected ? '2px solid var(--color-danger)' : '2px solid var(--color-border)',
                      background: selected ? 'rgba(239,68,68,0.12)' : 'var(--color-surface)',
                      cursor: 'pointer',
                      display: 'flex', flexDirection: 'column',
                      alignItems: 'center', justifyContent: 'center',
                      transition: 'all 0.2s ease',
                      fontWeight: 700,
                      fontSize: '1.1rem',
                      color: selected ? 'var(--color-danger)' : 'var(--color-text)',
                    }}
                  >
                    {sn || '—'}
                    <span style={{ fontSize: '0.45rem', fontWeight: 400, opacity: 0.6, letterSpacing: '0.05em', marginTop: '2px' }}>
                      {selected ? 'CANCEL' : 'SEAT'}
                    </span>
                  </button>
                );
              })}
            </div>

            {selectedSeats.length > 0 && (
              <div style={{ padding: '0.6rem 0.75rem', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 'var(--radius)', fontSize: '0.8rem', color: 'var(--color-danger)', marginBottom: 'var(--space-4)' }}>
                ⚠️ You are cancelling seat{selectedSeats.length > 1 ? 's' : ''}: {selectedSeats.map(s => `#${s}`).join(', ')}
              </div>
            )}

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                className="btn btn-secondary w-full"
                style={{ justifyContent: 'center' }}
                onClick={() => setCancelModal(null)}
                disabled={cancelling}
              >
                Keep Tickets
              </button>
              <button
                className="btn btn-outline w-full"
                style={{ justifyContent: 'center', color: 'var(--color-danger)', borderColor: 'rgba(239,68,68,0.4)' }}
                onClick={handleCancelSelected}
                disabled={!selectedSeats.length || cancelling}
              >
                {cancelling ? <span className="spinner spinner-sm" /> : <><XCircle size={14} /> Confirm Cancel</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
