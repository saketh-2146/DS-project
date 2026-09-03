import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Mail, Phone, Calendar, Clock, LogOut } from 'lucide-react';
import { formatDate } from '../utils/helpers';

export default function Profile() {
  const { currentUser, bookings, logout } = useApp();
  const [stats, setStats] = useState({ total: 0, upcoming: 0, spent: 0 });

  useEffect(() => {
    if (!currentUser) return;
    
    // Calculate stats from bookings linked list
    const myBookings = bookings.filter(b => b.userEmail === currentUser.email && b.status === 'confirmed');
    
    const upcoming = myBookings.filter(b => new Date(b.eventDate) >= new Date(new Date().toDateString()));
    const spent = myBookings.reduce((sum, b) => sum + b.totalAmount, 0);
    
    setStats({
      total: myBookings.length,
      upcoming: upcoming.length,
      spent
    });
  }, [bookings, currentUser]);

  if (!currentUser) return null;

  return (
    <div className="page fade-in">
      <div className="container" style={{ maxWidth: '800px' }}>
        
        <div className="profile-header">
          <div className="profile-avatar">
            {currentUser.name.charAt(0).toUpperCase()}
          </div>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: 'var(--text-3xl)', marginBottom: '0.25rem' }}>{currentUser.name}</h1>
            <div style={{ display: 'flex', gap: '1rem', color: 'var(--color-text-2)', fontSize: 'var(--text-sm)', flexWrap: 'wrap' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Mail size={14} /> {currentUser.email}</span>
              {currentUser.phone && (
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Phone size={14} /> {currentUser.phone}</span>
              )}
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <Calendar size={14} /> Joined {formatDate(currentUser.createdAt)}
              </span>
              {currentUser.role === 'admin' && (
                <span className="badge badge-purple" style={{ marginLeft: 'auto' }}>Administrator</span>
              )}
            </div>
          </div>
          <div>
            <button className="btn btn-secondary" onClick={logout}>
              <LogOut size={16} /> Logout
            </button>
          </div>
        </div>

        <h3 style={{ marginBottom: 'var(--space-4)' }}>Activity Summary</h3>
        <div className="profile-stats">
          <div className="profile-stat">
            <div style={{ fontSize: 'var(--text-3xl)', fontWeight: 800, color: 'var(--color-primary-l)' }}>{stats.total}</div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-3)', textTransform: 'uppercase', marginTop: '0.25rem' }}>Total Bookings</div>
          </div>
          <div className="profile-stat">
            <div style={{ fontSize: 'var(--text-3xl)', fontWeight: 800, color: 'var(--color-success)' }}>{stats.upcoming}</div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-3)', textTransform: 'uppercase', marginTop: '0.25rem' }}>Upcoming Events</div>
          </div>
          <div className="profile-stat">
            <div style={{ fontSize: 'var(--text-3xl)', fontWeight: 800, color: 'var(--color-warning)' }}>₹{stats.spent.toLocaleString('en-IN')}</div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-3)', textTransform: 'uppercase', marginTop: '0.25rem' }}>Total Spent</div>
          </div>
        </div>
        
      </div>
    </div>
  );
}
