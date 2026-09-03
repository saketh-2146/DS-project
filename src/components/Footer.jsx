import { useNavigate } from 'react-router-dom';
import { Code2, Globe, Share2, Zap } from 'lucide-react';

export default function Footer() {
  const navigate = useNavigate();
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          {/* Brand */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <div className="nav-brand-icon">🎫</div>
              <div>
                <div style={{ fontWeight: 800, fontSize: 'var(--text-lg)' }} className="text-gradient">EventBook DS</div>
                <div style={{ fontSize: '0.65rem', color: 'var(--color-text-3)' }}>Data Structures Project</div>
              </div>
            </div>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-3)', lineHeight: 1.7, marginBottom: '1.25rem' }}>
              Smart Event Booking System demonstrating practical use of Data Structures.
              A college final-year project built with React & Vite.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              {[Code2, Globe, Share2].map((Icon, i) => (
                <a key={i} href="#" style={{ width: 36, height: 36, borderRadius: 'var(--radius)', background: 'var(--color-surface)', border: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-2)', transition: 'all 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.color = 'var(--color-primary-l)'; e.currentTarget.style.borderColor = 'var(--color-primary)'; }}
                  onMouseLeave={e => { e.currentTarget.style.color = 'var(--color-text-2)'; e.currentTarget.style.borderColor = 'var(--color-border)'; }}>
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <div style={{ fontWeight: 700, fontSize: 'var(--text-sm)', marginBottom: '1rem', color: 'var(--color-text)' }}>Quick Links</div>
            {[['Home', '/'], ['Events', '/events'], ['My Bookings', '/my-bookings'], ['Waiting List', '/waiting-list']].map(([label, path]) => (
              <a key={path} className="footer-link" onClick={() => navigate(path)} style={{ cursor: 'pointer' }}>{label}</a>
            ))}
          </div>

          {/* Data Structures */}
          <div>
            <div style={{ fontWeight: 700, fontSize: 'var(--text-sm)', marginBottom: '1rem', color: 'var(--color-text)' }}>Data Structures</div>
            {['Array', 'Linked List', 'Queue', 'Priority Queue', 'Hash Table', 'BST', 'Circular Queue'].map(ds => (
              <a key={ds} className="footer-link" onClick={() => navigate('/data-structures')} style={{ cursor: 'pointer' }}>{ds}</a>
            ))}
          </div>

          {/* Info */}
          <div>
            <div style={{ fontWeight: 700, fontSize: 'var(--text-sm)', marginBottom: '1rem', color: 'var(--color-text)' }}>Project Info</div>
            {[['Login', '/login'], ['Register', '/register'], ['Admin Panel', '/admin'], ['DS Visualizer', '/data-structures']].map(([label, path]) => (
              <a key={path} className="footer-link" onClick={() => navigate(path)} style={{ cursor: 'pointer' }}>{label}</a>
            ))}
          </div>
        </div>

        <div className="footer-bottom">
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-3)' }}>
            © {year} Smart Event Booking System Using Data Structures. Final Year CS Project.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: 'var(--text-xs)', color: 'var(--color-text-3)' }}>
            <Zap size={12} style={{ color: 'var(--color-primary)' }} />
            Built with React + Data Structures
          </div>
        </div>
      </div>
    </footer>
  );
}
