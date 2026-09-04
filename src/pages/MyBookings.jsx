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
                <div key={booking.id} className="booking-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
                  
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                      <BookingBadge status={booking.status} />
                    </div>
                    
                    <h3 style={{ fontSize: 'var(--text-lg)', marginBottom: '0.25rem' }}>
                      {booking.eventName}
                    </h3>
                    
                    <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-2)' }}>
                      <strong>Seat Number(s):</strong> {booking.attendees && booking.attendees.length > 0 
                        ? (booking.attendees.map(a => a.seatNumber).filter(Boolean).join(', ') || 'Waitlisted')
                        : 'Waitlisted'}
                    </div>
                  </div>

                  <div>
                    {activeTab === 'upcoming' && (
                      <button 
                        className="btn btn-outline btn-sm" 
                        onClick={() => handleCancel(booking.id)}
                        disabled={cancelling === booking.id}
                        style={{ color: 'var(--color-danger)', borderColor: 'rgba(239,68,68,0.3)' }}
                      >
                        {cancelling === booking.id ? <span className="spinner spinner-sm" /> : <><XCircle size={14} /> Cancel</>}
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
