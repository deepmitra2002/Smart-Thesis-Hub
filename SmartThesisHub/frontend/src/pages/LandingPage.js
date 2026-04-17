import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const STATS = [
  { num: '2,400+', lbl: 'Students Enrolled' },
  { num: '48',     lbl: 'Expert Supervisors' },
  { num: '94%',    lbl: 'Match Success Rate' },
  { num: '8',      lbl: 'Departments' },
];

const ROLES = [
  { icon: '🎓', title: 'For Students',     desc: 'Discover DIU supervisors by department, explore 50+ project ideas, watch learning videos, and submit supervision requests easily.', link: '/register', cta: 'Student Portal →', bg: 'var(--lav-100)' },
  { icon: '👨‍🏫', title: 'For Supervisors', desc: 'Manage student requests, view your assigned groups, update availability slots, and rate your students — all in one place.', link: '/register', cta: 'Supervisor Portal →', bg: '#fdf4ff' },
  { icon: '🛠️', title: 'For Admins',       desc: 'Full system control — manage users, project topics, categories, monitor all activities, and view analytics dashboards.', link: '/login', cta: 'Admin Console →', bg: '#f0fdf4' },
];

export default function LandingPage() {
  const navigate = useNavigate();
  return (
    <div style={{ background: 'linear-gradient(135deg,#f5f3ff 0%,#ede9fe 40%,#fdf4ff 100%)', minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
      {/* Orbs */}
      {[
        { w:500,h:500, bg:'#a78bfa', top:'-120px', right:'-80px' },
        { w:350,h:350, bg:'#f472b6', bottom:'-60px', left:'-60px' },
        { w:250,h:250, bg:'#38bdf8', top:'40%', left:'30%' },
      ].map((o,i)=>(
        <div key={i} style={{ position:'absolute', width:o.w, height:o.h, background:o.bg, borderRadius:'50%', filter:'blur(60px)', opacity:.3, top:o.top, right:o.right, bottom:o.bottom, left:o.left, pointerEvents:'none' }} />
      ))}

      {/* Nav */}
      <nav style={{ position:'relative', zIndex:2, display:'flex', alignItems:'center', justifyContent:'space-between', padding:'20px 48px' }}>
        <div>
          <div style={{ fontFamily:'var(--ff2)', fontSize:22, fontWeight:500, color:'var(--lav-800)' }}>Smart<span style={{ color:'var(--lav-500)' }}>Thesis</span>Hub</div>
          <div style={{ fontSize:11, color:'var(--text-muted)' }}>Daffodil International University</div>
        </div>
        <div style={{ display:'flex', gap:10 }}>
          <Link to="/login" style={{ background:'transparent', color:'var(--lav-700)', border:'1.5px solid var(--lav-300)', padding:'9px 22px', borderRadius:50, fontFamily:'var(--ff)', fontSize:14, fontWeight:500, textDecoration:'none', transition:'all .2s' }}>Sign In</Link>
          <Link to="/register" style={{ background:'var(--lav-600)', color:'#fff', border:'none', padding:'10px 24px', borderRadius:50, fontFamily:'var(--ff)', fontSize:14, fontWeight:500, textDecoration:'none' }}>Register Free</Link>
        </div>
      </nav>

      {/* Hero */}
      <div style={{ position:'relative', zIndex:2, textAlign:'center', padding:'70px 24px 40px' }}>
        <div style={{ display:'inline-flex', alignItems:'center', gap:6, background:'rgba(167,139,250,.15)', border:'1px solid var(--lav-300)', color:'var(--lav-700)', fontSize:12, fontWeight:500, padding:'6px 16px', borderRadius:50, marginBottom:24, textTransform:'uppercase', letterSpacing:'.3px' }}>
          ✦ DIU Official Thesis Management Platform
        </div>
        <h1 style={{ fontFamily:'var(--ff2)', fontSize:'clamp(34px,5vw,60px)', fontWeight:500, lineHeight:1.1, color:'var(--lav-900)', maxWidth:740, margin:'0 auto 16px', letterSpacing:'-.5px' }}>
          Where Great Research Meets <em style={{ fontStyle:'italic', color:'var(--lav-500)' }}>Expert Guidance</em>
        </h1>
        <p style={{ fontSize:16, color:'var(--text-muted)', maxWidth:520, margin:'0 auto 40px', lineHeight:1.65, fontWeight:300 }}>
          The official thesis supervision platform for Daffodil International University — connecting students with expert faculty across CSE, SWE, ICT, ICE, and more.
        </p>
        <div style={{ display:'flex', gap:14, justifyContent:'center', flexWrap:'wrap' }}>
          <button className="btn btn-primary btn-lg" onClick={() => navigate('/register')}>Get Started Free</button>
          <button className="btn btn-outline btn-lg" onClick={() => navigate('/login')}>Sign In →</button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ position:'relative', zIndex:2, display:'flex', justifyContent:'center', gap:48, padding:'32px 24px', flexWrap:'wrap' }}>
        {STATS.map(s => (
          <div key={s.lbl} style={{ textAlign:'center' }}>
            <div style={{ fontFamily:'var(--ff2)', fontSize:34, fontWeight:500, color:'var(--lav-700)' }}>{s.num}</div>
            <div style={{ fontSize:13, color:'var(--text-muted)', marginTop:2 }}>{s.lbl}</div>
          </div>
        ))}
      </div>

      {/* Role Cards */}
      <div style={{ position:'relative', zIndex:2, display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))', gap:20, maxWidth:980, margin:'0 auto', padding:'0 24px 60px' }}>
        {ROLES.map(r => (
          <div key={r.title} onClick={() => navigate(r.link)} style={{ background:'#fff', border:'1px solid var(--border)', borderRadius:'var(--r)', padding:28, cursor:'pointer', transition:'all .22s' }}
            onMouseOver={e => { e.currentTarget.style.transform='translateY(-4px)'; e.currentTarget.style.boxShadow='var(--shadow2)'; e.currentTarget.style.borderColor='var(--lav-400)'; }}
            onMouseOut={e => { e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow=''; e.currentTarget.style.borderColor='var(--border)'; }}>
            <div style={{ width:48, height:48, borderRadius:12, background:r.bg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, marginBottom:16 }}>{r.icon}</div>
            <h3 style={{ fontFamily:'var(--ff2)', fontSize:20, fontWeight:500, color:'var(--lav-900)', marginBottom:8 }}>{r.title}</h3>
            <p style={{ fontSize:13.5, color:'var(--text-muted)', lineHeight:1.6, marginBottom:20 }}>{r.desc}</p>
            <div style={{ fontSize:13, fontWeight:500, color:'var(--lav-600)' }}>{r.cta}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
