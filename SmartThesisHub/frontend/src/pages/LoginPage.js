import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ROLES = [
  { id: 'student',    label: '🎓 Student',    hint: 'demo@s.diu.edu.bd / student123' },
  { id: 'supervisor', label: '👨‍🏫 Supervisor', hint: 'ariful@diu.edu.bd / super123 · Code: DIU@2024' },
  { id: 'admin',      label: '🛠️ Admin',       hint: 'admin@diu.edu.bd / admin123 · Code: ADMIN#DIU' },
];

export default function LoginPage() {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const [role, setRole]       = useState('student');
  const [form, setForm]       = useState({ email: '', password: '', accessCode: '' });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  const handle = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.email || !form.password) { setError('Email and password are required.'); return; }
    if ((role === 'supervisor' || role === 'admin') && !form.accessCode) {
      setError('Access code is required for this role.'); return;
    }
    setLoading(true);
    try {
      await login({ email: form.email, password: form.password, role, accessCode: form.accessCode });
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Check your credentials.');
    } finally { setLoading(false); }
  };

  const activeHint = ROLES.find(r => r.id === role)?.hint;

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg,#f5f3ff,#ede9fe,#fdf4ff)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 20, padding: 40, width: '100%', maxWidth: 450, boxShadow: 'var(--shadow2)' }}>
        <div style={{ fontFamily: 'var(--ff2)', fontSize: 20, fontWeight: 500, color: 'var(--lav-800)', textAlign: 'center', marginBottom: 2 }}>
          Smart<span style={{ color: 'var(--lav-500)' }}>Thesis</span>Hub
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', marginBottom: 6 }}>Daffodil International University</div>
        <div style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', marginBottom: 24 }}>Sign in to your portal</div>

        {/* Role tabs */}
        <div style={{ display: 'flex', background: 'var(--bg2)', borderRadius: 10, padding: 3, gap: 2, marginBottom: 22 }}>
          {ROLES.map(r => (
            <button key={r.id} onClick={() => setRole(r.id)} style={{ flex: 1, padding: '8px 4px', border: 'none', background: role === r.id ? '#fff' : 'none', borderRadius: 8, fontFamily: 'var(--ff)', fontSize: 12.5, color: role === r.id ? 'var(--lav-700)' : 'var(--text-muted)', cursor: 'pointer', fontWeight: 500, boxShadow: role === r.id ? '0 1px 4px rgba(109,40,217,.12)' : 'none', transition: 'all .18s' }}>
              {r.label}
            </button>
          ))}
        </div>

        <form onSubmit={submit}>
          <div className="form-group">
            <label>University Email</label>
            <input className="form-control" name="email" type="email" placeholder={role === 'student' ? 'yourroll@s.diu.edu.bd' : 'yourname@diu.edu.bd'} value={form.email} onChange={handle} />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input className="form-control" name="password" type="password" placeholder="••••••••" value={form.password} onChange={handle} />
          </div>
          {(role === 'supervisor' || role === 'admin') && (
            <div className="form-group">
              <label>{role === 'supervisor' ? 'Teacher Access Code' : 'Admin Code'} <span style={{ color: 'var(--rose-d)' }}>*</span></label>
              <input className="form-control" name="accessCode" type="password" placeholder="Enter your access code" value={form.accessCode} onChange={handle} />
              <div className="form-hint">🔐 This code is issued by DIU administration only.</div>
            </div>
          )}

          {error && <div className="alert alert-error" style={{ marginBottom: 14 }}>{error}</div>}

          <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: 13 }} disabled={loading}>
            {loading ? 'Signing in…' : 'Sign In Securely'}
          </button>
        </form>

        <div style={{ background: 'var(--lav-50)', border: '1px solid var(--lav-200)', borderRadius: 8, padding: '10px 12px', marginTop: 14, fontSize: 12, color: 'var(--lav-700)' }}>
          <b>Demo:</b> {activeHint}
        </div>

        <div style={{ textAlign: 'center', marginTop: 18, fontSize: 13, color: 'var(--text-muted)' }}>
          Don't have an account? <Link to="/register" style={{ color: 'var(--lav-600)', fontWeight: 500 }}>Register here</Link>
        </div>
        <div style={{ textAlign: 'center', marginTop: 10, fontSize: 13 }}>
          <Link to="/" style={{ color: 'var(--lav-500)' }}>← Back to home</Link>
        </div>
      </div>
    </div>
  );
}
