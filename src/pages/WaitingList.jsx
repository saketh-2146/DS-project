import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Clock, ArrowRight, XCircle } from 'lucide-react';
import { formatDate } from '../utils/helpers';
import BookingBadge from '../components/BookingBadge';

export default function WaitingList() {
  const navigate = useNavigate();
  const { currentUser, ds, showToast } = useApp();
  
  const [waitlistEntries, setWaitlistEntries] = useState([]);

  useEffect(() => {
    if (!currentUser) return;
    loadWaitlists();
  }, [currentUser]);

  const loadWaitlists = () => {
    // Collect all waitlist info for the current user
    const entries = [];
    const allEvents = ds.eventArray.getAll();
    
    allEvents.forEach(event => {
      const pos = ds.waitingQueueMap.getPosition(event.id, currentUser.email);
      if (pos !== -1) {
        // Find how many total people are waiting
        const queue = ds.waitingQueueMap.getQueue(event.id);
        const totalWaiting = queue.length;
        
        // Find user's exact entry
        const entry = queue.items.find(i => i.userEmail === currentUser.email);
        
        entries.push({
          event,
          position: pos,
          totalWaiting,
          seats: entry.seats,
          timestamp: entry.timestamp
        });
      }
    });
    
    // Sort by timestamp
    entries.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    setWaitlistEntries(entries);
  };

  const handleLeaveQueue = (eventId) => {
    if (window.confirm('Are you sure you want to leave the waiting list? You will lose your position.')) {
      const queue = ds.waitingQueueMap.getQueue(eventId);
      if (queue.removeUser(currentUser.email)) {
        // Save state
        const { storage } = require('../utils/localStorage');
        storage.saveWaitingQueues(ds.waitingQueueMap.serialize());
        showToast('Removed from waiting list.', 'info');
        loadWaitlists();
      }
    }
  };

  return (
    <div className="page fade-in">
      <div className="container" style={{ maxWidth: '800px' }}>
        
        <div className="page-header">
          <h1>Waiting List</h1>
          <p>Track your position in the First-In-First-Out (FIFO) queue for sold-out events.</p>
        </div>

        {waitlistEntries.length === 0 ? (
          <div className="empty-state card">
            <div className="empty-state-icon">⏳</div>
            <h3>No Active Waitlists</h3>
            <p>You are not currently on any waiting lists.</p>
            <button className="btn btn-primary" onClick={() => navigate('/events')}>
              Find Events
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            {waitlistEntries.map(({ event, position, totalWaiting, seats }) => (
              <div key={event.id} className="waiting-card" style={{ display: 'flex', gap: 'var(--space-6)', alignItems: 'center' }}>
                
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
                  <div className="queue-position">
                    {position}
                  </div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--color-text-3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Position
                  </div>
                </div>
                
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <BookingBadge status="waiting" />
                    <span style={{ fontSize: '0.7rem', color: 'var(--color-text-3)' }}>
                      Requested {seats} {seats === 1 ? 'Seat' : 'Seats'}
                    </span>
                  </div>
                  <h3 style={{ fontSize: 'var(--text-lg)', marginBottom: '0.25rem' }}>{event.name}</h3>
                  <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-2)' }}>
                    {formatDate(event.date)} • {event.venue}
                  </div>
                  <div style={{ marginTop: '0.75rem', fontSize: '0.75rem', color: 'var(--color-text-3)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Clock size={12} />
                    {totalWaiting} {totalWaiting === 1 ? 'person' : 'people'} currently in queue
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <button className="btn btn-secondary btn-sm" onClick={() => navigate(`/events/${event.id}`)}>
                    View Event
                  </button>
                  <button className="btn btn-outline btn-sm" style={{ color: 'var(--color-danger)', borderColor: 'rgba(239,68,68,0.3)' }} onClick={() => handleLeaveQueue(event.id)}>
                    <XCircle size={14} /> Leave Queue
                  </button>
                </div>

              </div>
            ))}
          </div>
        )}
        
      </div>
    </div>
  );
}
