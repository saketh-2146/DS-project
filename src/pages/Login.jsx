import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Mail, Lock, ArrowRight } from 'lucide-react';

export default function Login() {
  const { login } = useApp();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Simulate slight network delay for effect
    setTimeout(() => {
      const res = login(formData.email, formData.password);
      if (res.success) {
        navigate(res.user.role === 'admin' ? '/admin' : '/');
      } else {
        setError(res.error);
        setLoading(false);
      }
    }, 600);
  };

  return (
    <div className="page flex-center" style={{ minHeight: '80vh', padding: 'var(--space-8)' }}>
      <div className="card card-glass" style={{ width: '100%', maxWidth: '420px', padding: 'var(--space-8)' }}>
        <div className="text-center" style={{ marginBottom: 'var(--space-8)' }}>
          <div className="nav-brand-icon" style={{ margin: '0 auto var(--space-4)', width: 48, height: 48, fontSize: '1.5rem' }}>
            🎫
          </div>
          <h2 style={{ fontSize: 'var(--text-2xl)', marginBottom: 'var(--space-2)' }}>Welcome Back</h2>
          <p style={{ color: 'var(--color-text-2)', fontSize: 'var(--text-sm)' }}>
            Log in to manage your event bookings.
          </p>
        </div>

        {error && (
          <div className="badge badge-danger w-full" style={{ marginBottom: 'var(--space-4)', padding: '0.75rem', justifyContent: 'center' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div className="search-bar">
              <Mail className="search-icon" size={16} />
              <input
                type="email"
                className="form-input"
                placeholder="you@example.com"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="search-bar">
              <Lock className="search-icon" size={16} />
              <input
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={formData.password}
                onChange={e => setFormData({ ...formData, password: e.target.value })}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary w-full" style={{ marginTop: 'var(--space-4)', justifyContent: 'center' }} disabled={loading}>
            {loading ? <span className="spinner spinner-sm" /> : 'Log In'}
            {!loading && <ArrowRight size={16} />}
          </button>
        </form>

        <div className="divider" />
        
        <div className="text-center" style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-2)' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: 'var(--color-primary-l)', fontWeight: 600 }}>Sign up</Link>
        </div>
        
        <div className="text-center" style={{ fontSize: '0.7rem', color: 'var(--color-text-3)', marginTop: 'var(--space-6)' }}>
          <p>Admin Login: admin@eventbook.com / Admin@123</p>
          <p>This is a DS Capstone Project. Data is stored locally.</p>
        </div>
      </div>
    </div>
  );
}
