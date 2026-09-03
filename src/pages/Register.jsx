import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { User, Mail, Lock, Phone, ArrowRight } from 'lucide-react';

export default function Register() {
  const { register } = useApp();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', email: '', password: '', phone: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters.');
      setLoading(false);
      return;
    }

    setTimeout(() => {
      const res = register(formData.name, formData.email, formData.password, formData.phone);
      if (res.success) {
        navigate('/login');
      } else {
        setError(res.error);
        setLoading(false);
      }
    }, 600);
  };

  return (
    <div className="page flex-center" style={{ minHeight: '80vh', padding: 'var(--space-8)' }}>
      <div className="card card-glass" style={{ width: '100%', maxWidth: '420px', padding: 'var(--space-8)' }}>
        <div className="text-center" style={{ marginBottom: 'var(--space-6)' }}>
          <h2 style={{ fontSize: 'var(--text-2xl)', marginBottom: 'var(--space-2)' }}>Create Account</h2>
          <p style={{ color: 'var(--color-text-2)', fontSize: 'var(--text-sm)' }}>
            Join EventBook to start booking tickets.
          </p>
        </div>

        {error && (
          <div className="badge badge-danger w-full" style={{ marginBottom: 'var(--space-4)', padding: '0.75rem', justifyContent: 'center' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <div className="search-bar">
              <User className="search-icon" size={16} />
              <input
                type="text"
                className="form-input"
                placeholder="John Doe"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
          </div>
          
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
            <label className="form-label">Mobile Number (Optional)</label>
            <div className="search-bar">
              <Phone className="search-icon" size={16} />
              <input
                type="tel"
                className="form-input"
                placeholder="+91 9876543210"
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
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
                minLength={6}
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary w-full" style={{ marginTop: 'var(--space-4)', justifyContent: 'center' }} disabled={loading}>
            {loading ? <span className="spinner spinner-sm" /> : 'Create Account'}
            {!loading && <ArrowRight size={16} />}
          </button>
        </form>

        <div className="divider" />
        
        <div className="text-center" style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-2)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--color-primary-l)', fontWeight: 600 }}>Log in</Link>
        </div>
      </div>
    </div>
  );
}
