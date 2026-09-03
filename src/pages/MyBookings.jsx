import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Ticket, Calendar, Clock, MapPin, XCircle, AlertCircle } from 'lucide-react';
import { formatDate, formatCurrency, isEventUpcoming } from '../utils/helpers';
import BookingBadge from '../components/BookingBadge';

export default function MyBookings() {
  const navigate = useNavigate();
  const { currentUser, bookings, cancelBooking, ds } = useApp();
  
  const [activeTab, setActiveTab] = useState('upcoming'); // upcoming, completed, cancelled
  const [userBookings, setUserBookings] = useState({ upcoming: [], completed: [], cancelled: [] });
  const [cancelling, setCancelling] = useState(null); // ID of booking being cancelled

  useEffect(() => {
    if (!currentUser) return;
    
    // Using LinkedList.filterByUser to get O(n) filtering
    // In our AppContext, `bookings` is already an array representation of the linked list
    const myBookings = bookings.filter(b => b.userEmail === currentUser.email);
    
    const categorized = {
      upcoming: myBookings.filter(b => b.status === 'confirmed' && isEventUpcoming(b.eventDate)),
      completed: myBookings.filter(b => b.status === 'confirmed' && !isEventUpcoming(b.eventDate)),
      cancelled: myBookings.filter(b => b.status === 'cancelled'),
    };
    
    setUserBookings(categorized);
  }, [bookings, currentUser]);

  const handleCancel = (bookingId) => {
    if (window.confirm('Are you sure you want to cancel this booking? This action cannot be undone.')) {
      setCancelling(bookingId);
      setTimeout(() => {
        cancelBooking(bookingId);
        setCancelling(null);
      }, 800); // Simulate network delay
    }
  };

  const displayList = userBookings[activeTab];

  return (
    <div className="page fade-in">
      <div className="container" style={{ maxWidth: '900px' }}>
        
        <div className="page-header">
          <h1>My Bookings</h1>
          <p>Manage your tickets and booking history.</p>
        </div>

        <div className="tabs">
          <button 
            className={`tab-btn ${activeTab === 'upcoming' ? 'active' : ''}`}
            onClick={() => setActiveTab('upcoming')}
          >
            Upcoming ({userBookings.upcoming.length})
          </button>
          <button 
            className={`tab-btn ${activeTab === 'completed' ? 'active' : ''}`}
            onClick={() => setActiveTab('completed')}
          >
            Completed ({userBookings.completed.length})
          </button>
          <button 
            className={`tab-btn ${activeTab === 'cancelled' ? 'active' : ''}`}
            onClick={() => setActiveTab('cancelled')}
          >
            Cancelled ({userBookings.cancelled.length})
          </button>
        </div>

        <div>
          {displayList.length === 0 ? (
            <div className="empty-state card">
              <div className="empty-state-icon">🎫</div>
              <h3>No {activeTab} bookings</h3>
              <p>You don't have any {activeTab} bookings to show.</p>
              {activeTab === 'upcoming' && (
                <button className="btn btn-primary" onClick={() => navigate('/events')}>
                  Browse Events
                </button>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              {displayList.map(booking => (
                <div key={booking.id} className="booking-card">
                  
                  <div className="booking-card-img" onClick={() => navigate(`/events/${booking.eventId}`)} style={{ cursor: 'pointer' }}>
                    <img src={booking.eventImage} alt="" onError={e => { e.target.src = `https://picsum.photos/seed/${booking.eventId}/100/100`; }} />
                  </div>
                  
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                      <BookingBadge status={booking.status} />
                      {booking.promotedFromWaitlist && (
                        <span className="badge" style={{ background: 'rgba(139,92,246,0.15)', color: 'var(--color-accent-l)', border: '1px solid rgba(139,92,246,0.3)' }}>
                          Promoted from waitlist
                        </span>
                      )}
                      <span style={{ fontSize: '0.65rem', color: 'var(--color-text-3)', marginLeft: 'auto' }}>
                        ID: {booking.id}
                      </span>
                    </div>
                    
                    <h3 style={{ fontSize: 'var(--text-base)', marginBottom: '0.5rem', cursor: 'pointer' }} onClick={() => navigate(`/events/${booking.eventId}`)}>
                      {booking.eventName}
                    </h3>
                    
                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', fontSize: 'var(--text-xs)', color: 'var(--color-text-2)' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Calendar size={12} /> {formatDate(booking.eventDate)}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Clock size={12} /> {booking.eventTime}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Ticket size={12} /> {booking.seats} Tickets ({formatCurrency(booking.totalAmount)})</span>
                    </div>
                  </div>

                  <div>
                    {activeTab === 'upcoming' && (
                      <button 
                        className="btn btn-outline btn-sm" 
                        onClick={() => handleCancel(booking.id)}
                        disabled={cancelling === booking.id}
                      >
                        {cancelling === booking.id ? <span className="spinner spinner-sm" /> : <><XCircle size={14} /> Cancel</>}
                      </button>
                    )}
                    {activeTab !== 'upcoming' && (
                      <button className="btn btn-secondary btn-sm" onClick={() => navigate(`/events/${booking.eventId}`)}>
                        View Event
                      </button>
                    )}
                  </div>
                  
                </div>
              ))}
            </div>
          )}
        </div>
        
        {activeTab === 'upcoming' && userBookings.upcoming.length > 0 && (
           <div style={{ marginTop: 'var(--space-6)', padding: '1rem', background: 'var(--color-surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
             <AlertCircle size={18} style={{ color: 'var(--color-primary-l)', flexShrink: 0, marginTop: '2px' }} />
             <div style={{ fontSize: 'var(--text-sm)' }}>
               <strong style={{ color: 'var(--color-text)', display: 'block', marginBottom: '0.25rem' }}>Cancellation Policy</strong>
               <span style={{ color: 'var(--color-text-2)' }}>Cancelling an event will automatically free up your seats and assign them to the next person on the waiting list via the Queue data structure.</span>
             </div>
           </div>
        )}
        
      </div>
    </div>
  );
}
