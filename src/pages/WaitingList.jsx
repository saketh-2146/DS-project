import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Clock, XCircle, Users, ArrowDown } from 'lucide-react';
import { formatDate } from '../utils/helpers';

export default function WaitingList() {
  const navigate = useNavigate();
  const { currentUser, ds, showToast, events } = useApp();

  const [waitlistEntries, setWaitlistEntries] = useState([]);

  useEffect(() => {
    if (!currentUser) return;
    loadWaitlists();
  }, [currentUser, events]);

  const loadWaitlists = () => {
    const entries = [];
    const allEvents = ds.eventArray.getAll();

    allEvents.forEach(event => {
      const queue = ds.waitingQueueMap.getQueue(event.id);
      if (!queue || queue.isEmpty()) return;

      const allItems = queue.getAll(); // full FIFO queue
      const userPos = queue.position(currentUser.email); // -1 if not in queue

      if (userPos !== -1) {
        entries.push({
          event,
          allItems,           // full queue for display
          userPosition: userPos,
          totalWaiting: allItems.length,
          userEntry: allItems.find(i => i.userEmail === currentUser.email),
        });
      }
    });

    entries.sort((a, b) => new Date(a.userEntry?.timestamp) - new Date(b.userEntry?.timestamp));
    setWaitlistEntries(entries);
  };

  const handleLeaveQueue = async (eventId) => {
    if (window.confirm('Are you sure you want to leave the waiting list? You will lose your queue position.')) {
      const queue = ds.waitingQueueMap.getQueue(eventId);
      if (queue.removeUser(currentUser.email)) {
        const { storage } = await import('../utils/localStorage');
        await storage.saveWaitingQueues(ds.waitingQueueMap.serialize());
        showToast('Removed from waiting list.', 'info');
        loadWaitlists();
      }
    }
  };

  if (!currentUser) {
    return (
      <div className="page flex-center">
        <div className="empty-state card">
          <div className="empty-state-icon">🔒</div>
          <h3>Please log in</h3>
          <p>You need to log in to see your waiting list.</p>
          <button className="btn btn-primary" onClick={() => navigate('/login')}>Log In</button>
        </div>
      </div>
    );
  }

  return (
    <div className="page fade-in">
      <div className="container" style={{ maxWidth: '860px' }}>

        <div className="page-header">
          <h1>Waiting List</h1>
          <p>Your position in the <strong>First-Come, First-Served</strong> queue. When a seat opens, the #1 person gets it automatically.</p>
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
            {waitlistEntries.map(({ event, allItems, userPosition, totalWaiting, userEntry }) => (
              <div key={event.id} className="card" style={{ padding: 'var(--space-6)', border: '1px solid var(--color-border)' }}>

                {/* Event Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-4)', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <div>
                    <h2 style={{ fontSize: 'var(--text-xl)', marginBottom: '0.25rem' }}>{event.name}</h2>
                    <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-2)' }}>
                      {formatDate(event.date)} • {event.venue}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="btn btn-secondary btn-sm" onClick={() => navigate(`/events/${event.id}`)}>
                      View Event
                    </button>
                    <button
                      className="btn btn-outline btn-sm"
                      style={{ color: 'var(--color-danger)', borderColor: 'rgba(239,68,68,0.3)' }}
                      onClick={() => handleLeaveQueue(event.id)}
                    >
                      <XCircle size={14} /> Leave Queue
                    </button>
                  </div>
                </div>

                {/* Your position banner */}
                <div style={{
                  background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.1))',
                  border: '1px solid rgba(99,102,241,0.3)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '1rem 1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1.25rem',
                  marginBottom: 'var(--space-5)',
                }}>
                  <div style={{ textAlign: 'center', minWidth: '60px' }}>
                    <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--color-primary-l)', lineHeight: 1 }}>
                      #{userPosition}
                    </div>
                    <div style={{ fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-text-3)', marginTop: '2px' }}>
                      Your Position
                    </div>
                  </div>
                  <div style={{ borderLeft: '1px solid rgba(99,102,241,0.3)', height: '40px' }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text)', fontWeight: 600 }}>
                      {userPosition === 1
                        ? '🎉 You\'re next! You\'ll be auto-confirmed when a seat opens.'
                        : `${userPosition - 1} ${userPosition - 1 === 1 ? 'person is' : 'people are'} ahead of you.`}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-3)', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Clock size={11} />
                      Joined: {userEntry?.timestamp ? new Date(userEntry.timestamp).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' }) : 'N/A'}
                      &nbsp;•&nbsp;{userEntry?.seats} {userEntry?.seats === 1 ? 'ticket' : 'tickets'} requested
                    </div>
                  </div>
                  <div style={{ textAlign: 'center', minWidth: '60px' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-text-2)', lineHeight: 1 }}>
                      {totalWaiting}
                    </div>
                    <div style={{ fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-text-3)', marginTop: '2px' }}>
                      Total in Queue
                    </div>
                  </div>
                </div>

                {/* Full Queue List (FIFO) */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    <Users size={14} style={{ color: 'var(--color-text-3)' }} />
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-2)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Queue Order (First-Come, First-Served)
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {allItems.map((item, idx) => {
                      const isMe = item.userEmail === currentUser.email;
                      const queueNum = idx + 1;
                      return (
                        <div key={item.userEmail + idx} style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.75rem',
                          padding: '0.6rem 0.9rem',
                          borderRadius: 'var(--radius-md)',
                          background: isMe
                            ? 'rgba(99,102,241,0.12)'
                            : 'var(--color-surface)',
                          border: isMe
                            ? '1px solid rgba(99,102,241,0.35)'
                            : '1px solid var(--color-border)',
                          transition: 'all 0.2s ease',
                        }}>
                          {/* Position Number */}
                          <div style={{
                            width: '30px', height: '30px',
                            borderRadius: '50%',
                            background: queueNum === 1
                              ? 'linear-gradient(135deg, #fbbf24, #f59e0b)'
                              : isMe
                                ? 'rgba(99,102,241,0.3)'
                                : 'var(--color-border)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '0.8rem', fontWeight: 700,
                            color: queueNum === 1 ? '#000' : 'var(--color-text)',
                            flexShrink: 0,
                          }}>
                            {queueNum}
                          </div>

                          {/* Name & Time */}
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '0.85rem', fontWeight: isMe ? 700 : 500, color: 'var(--color-text)' }}>
                              {isMe ? `${item.userName} (You)` : item.userName}
                            </div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--color-text-3)' }}>
                              Joined: {item.timestamp ? new Date(item.timestamp).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' }) : '—'}
                            </div>
                          </div>

                          {/* Tickets */}
                          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-2)', textAlign: 'right' }}>
                            <span style={{ fontWeight: 600 }}>{item.seats}</span> {item.seats === 1 ? 'ticket' : 'tickets'}
                          </div>

                          {/* Badge for first */}
                          {queueNum === 1 && (
                            <span className="badge" style={{ background: 'rgba(251,191,36,0.15)', color: '#f59e0b', border: '1px solid rgba(251,191,36,0.3)', fontSize: '0.6rem' }}>
                              Next Up
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {totalWaiting > 1 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.75rem', fontSize: '0.72rem', color: 'var(--color-text-3)' }}>
                      <ArrowDown size={12} />
                      Queue moves up automatically when someone cancels their booking.
                    </div>
                  )}
                </div>

              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
