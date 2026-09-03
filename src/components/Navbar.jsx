import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { isFirebaseConfigured } from '../utils/firebase';
import {
  Home, Calendar, BookOpen, Clock, Cpu, User, Settings,
  LogOut, LogIn, Menu, X, Zap
} from 'lucide-react';

const NAV_ITEMS = [
  { path: '/',                label: 'Home',           icon: Home },
  { path: '/events',         label: 'Events',          icon: Calendar },
  { path: '/my-bookings',    label: 'My Bookings',     icon: BookOpen },
  { path: '/waiting-list',   label: 'Waiting List',    icon: Clock },
  { path: '/data-structures',label: 'Data Structures', icon: Cpu },
];

export default function Navbar() {
  const { currentUser, logout, firebaseConnected } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close menu on route change
  useEffect(() => { setMenuOpen(false); }, [location.pathname]);

  const go = (path) => { navigate(path); setMenuOpen(false); };

  const isActive = (path) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  return (
    <>
      <nav className={`navbar${scrolled ? ' scrolled' : ''}`}>
        <div className="container">
          {/* Brand */}
          <div className="nav-brand" style={{ cursor: 'pointer' }} onClick={() => go('/')}>
            <div className="nav-brand-icon">🎫</div>
            <div>
              <div className="nav-brand-text text-gradient">EventBook</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                <div style={{
                  width: 7, height: 7, borderRadius: '50%',
                  background: isFirebaseConfigured ? '#4ade80' : '#f59e0b',
                  boxShadow: isFirebaseConfigured ? '0 0 6px #22c55e' : '0 0 6px #f59e0b',
                  flexShrink: 0,
                }} />
                <div className="nav-brand-sub">
                  {isFirebaseConfigured ? 'Firebase Connected' : 'localStorage mode'}
                </div>
              </div>
            </div>
          </div>

          {/* Desktop nav links */}
          <div className="nav-links">
            {NAV_ITEMS.map(({ path, label, icon: Icon }) => (
              <button
                key={path}
                className={`nav-link${isActive(path) ? ' active' : ''}`}
                onClick={() => go(path)}
              >
                <Icon size={15} />
                {label}
              </button>
            ))}
          </div>

          {/* Desktop actions */}
          <div className="nav-actions">
            {currentUser ? (
              <>
                {currentUser.role === 'admin' && (
                  <button
                    className={`nav-link${isActive('/admin') ? ' active' : ''}`}
                    onClick={() => go('/admin')}
                  >
                    <Settings size={15} />
                    Admin
                  </button>
                )}
                <button
                  className={`nav-link${isActive('/profile') ? ' active' : ''}`}
                  onClick={() => go('/profile')}
                >
                  <User size={15} />
                  {currentUser.name.split(' ')[0]}
                </button>
                <button className="btn btn-secondary btn-sm" onClick={logout}>
                  <LogOut size={14} />
                  Logout
                </button>
              </>
            ) : (
              <>
                <button className="btn btn-ghost btn-sm" onClick={() => go('/login')}>
                  <LogIn size={14} />
                  Login
                </button>
                <button className="btn btn-primary btn-sm" onClick={() => go('/register')}>
                  <Zap size={14} />
                  Sign Up
                </button>
              </>
            )}
          </div>

          {/* Hamburger */}
          <button
            className={`hamburger${menuOpen ? ' open' : ''}`}
            onClick={() => setMenuOpen(o => !o)}
            aria-label="Toggle menu"
          >
            <span /><span /><span />
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="mobile-menu">
          {NAV_ITEMS.map(({ path, label, icon: Icon }) => (
            <button
              key={path}
              className={`nav-link${isActive(path) ? ' active' : ''}`}
              onClick={() => go(path)}
              style={{ justifyContent: 'flex-start' }}
            >
              <Icon size={15} />
              {label}
            </button>
          ))}
          {currentUser ? (
            <>
              {currentUser.role === 'admin' && (
                <button className="nav-link" onClick={() => go('/admin')} style={{ justifyContent: 'flex-start' }}>
                  <Settings size={15} /> Admin
                </button>
              )}
              <button className="nav-link" onClick={() => go('/profile')} style={{ justifyContent: 'flex-start' }}>
                <User size={15} /> Profile
              </button>
              <button className="btn btn-secondary btn-sm w-full" onClick={logout} style={{ justifyContent: 'center', marginTop: '0.5rem' }}>
                <LogOut size={14} /> Logout
              </button>
            </>
          ) : (
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
              <button className="btn btn-secondary btn-sm" style={{ flex: 1, justifyContent: 'center' }} onClick={() => go('/login')}>Login</button>
              <button className="btn btn-primary btn-sm" style={{ flex: 1, justifyContent: 'center' }} onClick={() => go('/register')}>Sign Up</button>
            </div>
          )}
        </div>
      )}
    </>
  );
}
