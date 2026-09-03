import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { ArrowLeft, Ticket, CreditCard, Clock, User, AlertCircle } from 'lucide-react';
import { formatDate, formatCurrency } from '../utils/helpers';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Booking() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { ds, bookEvent, currentUser } = useApp();
  
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  
  // Form State
  const [seats, setSeats] = useState(1);
  const [attendees, setAttendees] = useState([{ name: currentUser?.name || '', phone: currentUser?.phone || '' }]);
  const [error, setError] = useState('');

  useEffect(() => {
    setAttendees(prev => {
      if (prev.length === seats) return prev;
      if (prev.length < seats) {
        return [...prev, ...Array.from({ length: seats - prev.length }, () => ({ name: '', phone: '' }))];
      }
      return prev.slice(0, seats);
    });
  }, [seats]);

  useEffect(() => {
    // Find event
    const found = ds.eventArray.findById(id);
    if (found) {
      setEvent(found);
    }
    setLoading(false);
  }, [id, ds]);

  if (loading) return <LoadingSpinner fullScreen />;
  
  if (!event) {
    return (
      <div className="page container flex-center flex-col">
        <h3>Event Not Found</h3>
        <button className="btn btn-primary mt-4" onClick={() => navigate('/events')}>Go Back</button>
      </div>
    );
  }

  const isSoldOut = event.availableSeats === 0;
  const maxSeats = isSoldOut ? 4 : Math.min(event.availableSeats, 10); // allow up to 4 on waiting list
  const totalAmount = event.price * seats;

  const handleBook = (e) => {
    e.preventDefault();
    setError('');
    setProcessing(true);

    // Simulate payment processing / network
    setTimeout(() => {
      const res = bookEvent(event.id, seats, attendees);
      
      setProcessing(false);
      
      if (res.success) {
        if (res.waitlisted) {
          navigate('/waiting-list');
        } else {
          // Success! Show confirmation animation or go to bookings
          navigate('/my-bookings');
        }
      } else {
        setError(res.error);
      }
    }, 1500);
  };

  return (
    <div className="page fade-in">
      <div className="container" style={{ maxWidth: '900px' }}>
        
        <button className="btn btn-ghost btn-sm" style={{ marginBottom: 'var(--space-6)' }} onClick={() => navigate(-1)}>
          <ArrowLeft size={16} /> Back to Event
        </button>

        <div className="page-header">
          <h1>{isSoldOut ? 'Join Waiting List' : 'Complete Booking'}</h1>
          <p>Please review your details and confirm your ticket.</p>
        </div>

        {error && (
          <div className="badge badge-danger w-full" style={{ padding: '1rem', marginBottom: 'var(--space-6)', fontSize: 'var(--text-sm)', justifyContent: 'flex-start' }}>
            <AlertCircle size={16} /> {error}
          </div>
        )}

        <div className="booking-layout">
          {/* Main Form */}
          <div>
            <form onSubmit={handleBook} id="booking-form">
              
              <div className="card card-body" style={{ marginBottom: 'var(--space-6)' }}>
                <h3 style={{ marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Ticket size={18} className="text-muted" /> Select Seats
                </h3>
                
                <div className="form-group">
                  <label className="form-label">Number of Tickets</label>
                  <select 
                    className="form-input" 
                    value={seats} 
                    onChange={e => setSeats(Number(e.target.value))}
                    style={{ maxWidth: '200px' }}
                  >
                    {Array.from({ length: maxSeats }, (_, i) => i + 1).map(num => (
                      <option key={num} value={num}>{num} {num === 1 ? 'Ticket' : 'Tickets'}</option>
                    ))}
                  </select>
                </div>
                
                {isSoldOut && (
                  <div style={{ marginTop: 'var(--space-4)', padding: '0.75rem', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 'var(--radius)', fontSize: '0.75rem', color: '#fbbf24' }}>
                    <p><strong>Note:</strong> You are joining a First-In-First-Out (FIFO) queue. If {seats} {seats === 1 ? 'seat becomes' : 'seats become'} available due to cancellation, you will be automatically booked.</p>
                  </div>
                )}
              </div>

              {attendees.map((attendee, idx) => (
                <div key={idx} className="card card-body" style={{ marginBottom: 'var(--space-6)' }}>
                  <h3 style={{ marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <User size={18} className="text-muted" /> Attendee {idx + 1} Details
                  </h3>
                  
                  <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
                    <label className="form-label">Full Name</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={attendee.name}
                      onChange={e => {
                        const newAttendees = [...attendees];
                        newAttendees[idx].name = e.target.value;
                        setAttendees(newAttendees);
                      }}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Mobile Number</label>
                    <input 
                      type="tel" 
                      className="form-input" 
                      value={attendee.phone}
                      onChange={e => {
                        const newAttendees = [...attendees];
                        newAttendees[idx].phone = e.target.value;
                        setAttendees(newAttendees);
                      }}
                      required
                    />
                  </div>
                  
                  {idx === 0 && (
                    <div style={{ marginTop: 'var(--space-4)', fontSize: '0.75rem', color: 'var(--color-text-3)' }}>
                      Tickets will be sent to <strong>{currentUser?.email}</strong>.
                    </div>
                  )}
                </div>
              ))}
              
            </form>
          </div>

          {/* Summary Sidebar */}
          <div>
            <div className="booking-summary">
              <h3 style={{ marginBottom: 'var(--space-4)' }}>Order Summary</h3>
              
              <div style={{ display: 'flex', gap: '1rem', marginBottom: 'var(--space-4)' }}>
                <div style={{ width: 60, height: 60, borderRadius: 'var(--radius)', overflow: 'hidden', flexShrink: 0 }}>
                  <img src={event.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)', lineHeight: 1.3, marginBottom: '0.25rem' }}>{event.name}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--color-text-2)' }}>{formatDate(event.date)} at {event.time}</div>
                </div>
              </div>
              
              <div className="divider" style={{ margin: 'var(--space-4) 0' }} />
              
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-2)', fontSize: 'var(--text-sm)' }}>
                <span className="text-muted">{formatCurrency(event.price)} x {seats} Tickets</span>
                <span>{formatCurrency(totalAmount)}</span>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-4)', fontSize: 'var(--text-sm)' }}>
                <span className="text-muted">Booking Fee</span>
                <span>FREE</span>
              </div>
              
              <div className="booking-total flex-between">
                <span style={{ fontWeight: 600 }}>Total</span>
                <span style={{ fontSize: 'var(--text-xl)', fontWeight: 800, color: 'var(--color-primary-l)' }}>{formatCurrency(totalAmount)}</span>
              </div>

              <button 
                type="submit" 
                form="booking-form" 
                className={`btn ${isSoldOut ? 'btn-warning' : 'btn-success'} btn-lg w-full`} 
                style={{ marginTop: 'var(--space-6)', justifyContent: 'center' }}
                disabled={processing}
              >
                {processing ? (
                  <><span className="spinner spinner-sm" /> Processing...</>
                ) : (
                  <>
                    {isSoldOut ? <Clock size={18} /> : <CreditCard size={18} />}
                    {isSoldOut ? 'Join Waiting List' : 'Confirm & Pay'}
                  </>
                )}
              </button>
              
              <div style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.65rem', color: 'var(--color-text-3)' }}>
                By clicking confirm, you agree to our Terms & Conditions.
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
