import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import EventCard from '../components/EventCard';
import { priorityQueue, eventArray } from '../context/AppContext';
import { ArrowRight, Ticket, Users, Calendar, Zap } from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();
  const { events, bookings } = useApp();
  const [popularEvents, setPopularEvents] = useState([]);
  const [featuredEvents, setFeaturedEvents] = useState([]);
  
  // Overall Stats
  const totalEvents = events.length;
  const totalBookings = bookings.length;
  const totalAvailableSeats = events.reduce((acc, ev) => acc + ev.availableSeats, 0);

  useEffect(() => {
    // Get top 4 popular events using Priority Queue (Max-Heap)
    const top = priorityQueue.getTopN(4);
    setPopularEvents(top);

    // Get featured events using Array filter
    const featured = eventArray.filter(e => e.isFeatured).slice(0, 4);
    setFeaturedEvents(featured);
  }, [events, bookings]);

  return (
    <div className="home-page fade-in">
      {/* Hero Section */}
      <section className="hero">
        <div className="container hero-grid">
          <div>
            <div className="hero-eyebrow">Smart Event Booking System</div>
            <h1 className="hero-title">
              Experience the Power of <span className="text-gradient">Data Structures</span>
            </h1>
            <p className="hero-subtitle">
              Efficient event management, booking, and seat allocation using Arrays, Trees, Queues, Hash Tables, and Linked Lists.
            </p>
            <div className="hero-actions">
              <button className="btn btn-primary btn-lg" onClick={() => navigate('/events')}>
                Explore Events <ArrowRight size={18} />
              </button>
              <button className="btn btn-outline btn-lg" onClick={() => navigate('/data-structures')}>
                <Zap size={18} /> View DS Visualizations
              </button>
            </div>
            
            <div className="hero-stats" style={{ marginTop: 'var(--space-12)' }}>
              <div>
                <div className="hero-stat-value">{totalEvents}</div>
                <div className="hero-stat-label">Events</div>
              </div>
              <div>
                <div className="hero-stat-value">{totalBookings}</div>
                <div className="hero-stat-label">Bookings</div>
              </div>
              <div>
                <div className="hero-stat-value">{totalAvailableSeats}</div>
                <div className="hero-stat-label">Seats</div>
              </div>
            </div>
          </div>
          
          <div className="hero-visual">
             <div className="hero-card-stack">
               <div className="hero-main-card">
                 <img src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80" alt="Concert" />
               </div>
               <div className="hero-badge hero-badge-1">
                 <div style={{ color: 'var(--color-primary)' }}><Ticket size={20} /></div>
                 <div>
                   <div style={{ fontSize: '0.65rem', color: 'var(--color-text-3)' }}>O(1) Access</div>
                   <div>Hash Table Users</div>
                 </div>
               </div>
               <div className="hero-badge hero-badge-2">
                 <div style={{ color: 'var(--color-success)' }}><Users size={20} /></div>
                 <div>
                   <div style={{ fontSize: '0.65rem', color: 'var(--color-text-3)' }}>O(log n) Heap</div>
                   <div>Priority Queue</div>
                 </div>
               </div>
             </div>
          </div>
        </div>
      </section>

      {/* Featured Events (Linear Array Search) */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <div className="eyebrow">Curated Picks</div>
            <h2>Featured Events</h2>
            <p>Hand-picked premium events. Fetched in O(n) using Array filtering.</p>
          </div>
          
          <div className="events-grid">
            {featuredEvents.map(event => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </div>
      </section>

      {/* Popular Events (Priority Queue) */}
      <section className="section" style={{ background: 'var(--color-bg-2)' }}>
        <div className="container">
          <div className="flex-between" style={{ marginBottom: 'var(--space-8)' }}>
            <div>
              <div className="eyebrow" style={{ marginBottom: 'var(--space-2)' }}>Trending Now</div>
              <h2 style={{ fontSize: 'var(--text-3xl)' }}>Most Popular</h2>
              <p style={{ color: 'var(--color-text-2)', fontSize: 'var(--text-sm)', marginTop: 'var(--space-2)' }}>
                Ranked dynamically using a Max-Heap Priority Queue (O(log n) updates).
              </p>
            </div>
            <button className="btn btn-secondary" onClick={() => navigate('/events')}>
              View All <ArrowRight size={16} />
            </button>
          </div>
          
          <div className="events-grid">
            {popularEvents.map(event => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </div>
      </section>
      
      {/* DS Highlight */}
      <section className="section-sm">
        <div className="container">
          <div className="card text-center" style={{ padding: 'var(--space-12) var(--space-8)' }}>
             <Cpu size={48} style={{ color: 'var(--color-primary)', margin: '0 auto var(--space-6)' }} />
             <h2 style={{ marginBottom: 'var(--space-4)' }}>Built for Performance</h2>
             <p style={{ color: 'var(--color-text-2)', maxWidth: '600px', margin: '0 auto var(--space-8)' }}>
               This application demonstrates real-world application of 7 core data structures. 
               From constant-time user authentication to logarithmic event sorting and efficient seat allocation.
             </p>
             <button className="btn btn-primary" onClick={() => navigate('/data-structures')}>
               Explore Data Structures
             </button>
          </div>
        </div>
      </section>
    </div>
  );
}
// Needed for icon
import { Cpu } from 'lucide-react';
