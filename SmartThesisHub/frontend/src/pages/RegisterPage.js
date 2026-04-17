// This file exports stub pages. Each imports from its own file in a real setup.
// For the standalone delivery these are all exported from here.

// ─────────────────────────────────────────────────────
// pages/RegisterPage.js
// ─────────────────────────────────────────────────────
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState('student');
  const [form, setForm] = useState({ name:'', email:'', password:'', confirmPassword:'', rollNo:'', department:'CSE', year:1, title:'Lecturer', accessCode:'' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) { setError('Passwords do not match.'); return; }
    if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setError(''); setLoading(true);
    try {
      await register({ ...form, role });
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed.');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(135deg,#f5f3ff,#ede9fe,#fdf4ff)', display:'flex', alignItems:'center', justifyContent:'center', padding:24 }}>
      <div style={{ background:'#fff', border:'1px solid var(--border)', borderRadius:20, padding:40, width:'100%', maxWidth:480, boxShadow:'var(--shadow2)' }}>
        <div style={{ fontFamily:'var(--ff2)', fontSize:20, fontWeight:500, color:'var(--lav-800)', textAlign:'center', marginBottom:4 }}>
          Smart<span style={{ color:'var(--lav-500)' }}>Thesis</span>Hub
        </div>
        <div style={{ fontSize:12, color:'var(--text-muted)', textAlign:'center', marginBottom:20 }}>Create your account · Daffodil International University</div>

        <div style={{ display:'flex', background:'var(--bg2)', borderRadius:10, padding:3, gap:2, marginBottom:22 }}>
          {['student','supervisor'].map(r => (
            <button key={r} onClick={() => setRole(r)} style={{ flex:1, padding:8, border:'none', background:role===r?'#fff':'none', borderRadius:8, fontFamily:'var(--ff)', fontSize:13, color:role===r?'var(--lav-700)':'var(--text-muted)', cursor:'pointer', fontWeight:500, boxShadow:role===r?'0 1px 4px rgba(109,40,217,.12)':'none' }}>
              {r === 'student' ? '🎓 Student' : '👨‍🏫 Supervisor'}
            </button>
          ))}
        </div>

        <form onSubmit={submit}>
          <div className="form-row">
            <div className="form-group"><label>Full Name</label><input className="form-control" name="name" placeholder="Your full name" value={form.name} onChange={handle} required /></div>
            <div className="form-group"><label>Department</label>
              <select className="form-control" name="department" value={form.department} onChange={handle}>
                {['CSE','SWE','ICT','ICE','ETE','MCT','EEE','ME'].map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
          </div>
          <div className="form-group"><label>University Email</label><input className="form-control" name="email" type="email" placeholder={role==='student'?'roll@s.diu.edu.bd':'name@diu.edu.bd'} value={form.email} onChange={handle} required /></div>
          {role === 'student' && (
            <div className="form-row">
              <div className="form-group"><label>Roll Number</label><input className="form-control" name="rollNo" placeholder="191-35-XXXX" value={form.rollNo} onChange={handle} required /></div>
              <div className="form-group"><label>Year</label>
                <select className="form-control" name="year" value={form.year} onChange={handle}>
                  {[1,2,3,4].map(y => <option key={y} value={y}>Year {y}</option>)}
                </select>
              </div>
            </div>
          )}
          {role === 'supervisor' && (
            <>
              <div className="form-group"><label>Designation</label>
                <select className="form-control" name="title" value={form.title} onChange={handle}>
                  {['Professor','Associate Professor','Assistant Professor','Senior Lecturer','Lecturer'].map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div className="form-group"><label>Supervisor Access Code <span style={{ color:'var(--rose-d)' }}>*</span></label>
                <input className="form-control" name="accessCode" type="password" placeholder="Code provided by DIU admin" value={form.accessCode} onChange={handle} />
                <div className="form-hint">🔐 Contact DIU IT department for your access code.</div>
              </div>
            </>
          )}
          <div className="form-row">
            <div className="form-group"><label>Password</label><input className="form-control" name="password" type="password" placeholder="Min 6 characters" value={form.password} onChange={handle} required /></div>
            <div className="form-group"><label>Confirm Password</label><input className="form-control" name="confirmPassword" type="password" placeholder="Repeat password" value={form.confirmPassword} onChange={handle} required /></div>
          </div>
          {error && <div className="alert alert-error">{error}</div>}
          <button type="submit" className="btn btn-primary" style={{ width:'100%', justifyContent:'center', padding:13 }} disabled={loading}>
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <div style={{ textAlign:'center', marginTop:16, fontSize:13, color:'var(--text-muted)' }}>
          Already have an account? <Link to="/login" style={{ color:'var(--lav-600)', fontWeight:500 }}>Sign in</Link>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
