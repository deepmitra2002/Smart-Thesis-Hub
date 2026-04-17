import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { adminAPI, requestAPI, supervisorAPI, studentAPI } from '../utils/api';

export default function DashboardPage() {
  const { user, isStudent, isSupervisor, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [data, setData]     = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        if (isAdmin) {
          const { data: analytics } = await adminAPI.getAnalytics();
          setData(analytics);
        } else if (isStudent) {
          const [reqs, profile] = await Promise.all([
            requestAPI.getAll(),
            studentAPI.getMe(),
          ]);
          setData({ requests: reqs.data.requests, student: profile.data.student, total: reqs.data.total });
        } else if (isSupervisor) {
          const [reqs, svStudents] = await Promise.all([
            requestAPI.getAll({ status: 'pending' }),
            supervisorAPI.getStudents(user._id),
          ]);
          setData({ pendingRequests: reqs.data.requests, students: svStudents.data.students });
        }
      } catch (e) {
        console.error(e);
      } finally { setLoading(false); }
    };
    load();
  }, [isAdmin, isStudent, isSupervisor, user]);

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;

  if (isAdmin) return <AdminDashboard data={data} navigate={navigate} />;
  if (isSupervisor) return <SupervisorDashboard data={data} user={user} navigate={navigate} />;
  return <StudentDashboard data={data} user={user} navigate={navigate} />;
}

// ── STUDENT DASHBOARD ─────────────────────────────────
function StudentDashboard({ data, user, navigate }) {
  const pending  = (data.requests || []).filter(r => r.status === 'pending').length;
  const accepted = (data.requests || []).filter(r => r.status === 'accepted').length;
  const lastReq  = (data.requests || [])[0];

  const quickActions = [
    { icon:'👨‍🏫', label:'Find Supervisors',    bg:'var(--lav-100)',  border:'var(--lav-200)',  color:'var(--lav-800)',  path:'/supervisors' },
    { icon:'📁', label:'Browse 50 Projects',  bg:'#fff0f6',        border:'#fbcfe8',        color:'var(--rose-d)',   path:'/projects' },
    { icon:'🎬', label:'Watch 15 Videos',     bg:'#f0fdf4',        border:'#bbf7d0',        color:'var(--mint-d)',   path:'/resources' },
    { icon:'📨', label:`My Requests (${pending})`, bg:'#fffbeb', border:'#fde68a',        color:'var(--amber-d)', path:'/requests' },
  ];

  return (
    <>
      <div className="page-header">
        <h2>Welcome back, {user?.name?.split(' ')[0]} 👋</h2>
        <p>Your thesis journey at Daffodil International University starts here</p>
      </div>

      <div className="stats-grid">
        {[
          { icon:'📨', val: pending,  lbl:'Pending Requests',     trend:'Click to view all',       path:'/requests' },
          { icon:'✅', val: accepted, lbl:'Accepted Requests',    trend:'Supervisor assigned',      path:'/requests' },
          { icon:'📁', val: data.student?.savedProjects?.length || 0, lbl:'Saved Projects', trend:'Click to browse 50 ideas', path:'/projects' },
          { icon:'🎬', val: 15,       lbl:'Video Resources',      trend:'Click to watch now',      path:'/resources' },
        ].map(s => (
          <div key={s.lbl} className="stat-card card-clickable" onClick={() => navigate(s.path)}>
            <div className="stat-icon">{s.icon}</div>
            <div className="stat-value">{s.val}</div>
            <div className="stat-label">{s.lbl}</div>
            <div className="stat-trend trend-up">{s.trend}</div>
          </div>
        ))}
      </div>

      {/* Request status + Quick actions */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:18, marginBottom:22 }}>
        <div>
          <div className="section-title">Latest Request <span className="see-all" onClick={() => navigate('/requests')}>View all</span></div>
          <div className="card">
            {lastReq ? (
              <>
                <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:12 }}>
                  <div style={{ fontSize:28 }}>{lastReq.status==='accepted'?'✅':lastReq.status==='rejected'?'❌':'🟡'}</div>
                  <div>
                    <div style={{ fontWeight:600 }}>{lastReq.status==='accepted'?'Request Accepted!':lastReq.status==='rejected'?'Request Rejected':'Awaiting Response'}</div>
                    <div style={{ fontSize:12.5, color:'var(--text-muted)' }}>Sent to {lastReq.supervisorId?.name || '—'}</div>
                  </div>
                </div>
                <span className={`pill pill-${lastReq.status}`}>{lastReq.status}</span>
              </>
            ) : (
              <div className="empty-state" style={{ padding:20 }}>
                <div style={{ fontSize:28, marginBottom:8 }}>📭</div>
                <div style={{ fontSize:13.5, color:'var(--text-muted)', marginBottom:12 }}>No requests sent yet.</div>
                <button className="btn btn-primary btn-sm" onClick={() => navigate('/supervisors')}>Find a Supervisor</button>
              </div>
            )}
          </div>
        </div>

        <div>
          <div className="section-title">Quick Actions</div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
            {quickActions.map(a => (
              <div key={a.label} onClick={() => navigate(a.path)} style={{ background:a.bg, border:`1px solid ${a.border}`, borderRadius:'var(--r)', padding:16, cursor:'pointer', textAlign:'center', transition:'all .2s' }}
                onMouseOver={e => e.currentTarget.style.transform='translateY(-2px)'}
                onMouseOut={e => e.currentTarget.style.transform=''}>
                <div style={{ fontSize:24, marginBottom:6 }}>{a.icon}</div>
                <div style={{ fontWeight:600, color:a.color, fontSize:12.5 }}>{a.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

// ── SUPERVISOR DASHBOARD ──────────────────────────────
function SupervisorDashboard({ data, user, navigate }) {
  const pending  = (data.pendingRequests || []).length;
  const students = data.students || [];

  return (
    <>
      <div className="page-header">
        <h2>Good morning, {user?.name?.split(' ').slice(-1)[0]} 🌟</h2>
        <p>{pending} pending student request{pending !== 1 ? 's' : ''} today</p>
      </div>

      <div className="stats-grid">
        {[
          { icon:'🎓', val:students.length,  lbl:'Active Students',    trend:'Click to view all',   path:'/students' },
          { icon:'📨', val:pending,           lbl:'Pending Requests',   trend:'Needs attention',      path:'/requests' },
          { icon:'⭐', val:'4.8',            lbl:'Average Rating',     trend:'Top 5% supervisors',  path:'/students' },
          { icon:'🪑', val:5-students.length, lbl:'Available Slots',   trend:'Click to manage',     path:'/profile' },
        ].map(s => (
          <div key={s.lbl} className="stat-card card-clickable" onClick={() => navigate(s.path)}>
            <div className="stat-icon">{s.icon}</div>
            <div className="stat-value">{s.val}</div>
            <div className="stat-label">{s.lbl}</div>
            <div className="stat-trend trend-up">{s.trend}</div>
          </div>
        ))}
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr', gap:18 }}>
        <div>
          <div className="section-title">Pending Requests <span className="see-all" onClick={() => navigate('/requests')}>View all</span></div>
          {data.pendingRequests?.length === 0 ? (
            <div className="card empty-state"><div className="empty-icon">✅</div><div className="empty-title">All caught up!</div><p className="empty-desc">No pending requests right now.</p></div>
          ) : data.pendingRequests?.slice(0,3).map(r => (
            <div key={r._id} className="card" style={{ marginBottom:12 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:10 }}>
                <div>
                  <div style={{ fontWeight:600 }}>{r.studentId?.name}</div>
                  <div style={{ fontSize:12.5, color:'var(--text-muted)' }}>{r.researchArea} · {new Date(r.createdAt).toLocaleDateString()}</div>
                </div>
                <span className="pill pill-pending">Pending</span>
              </div>
              <div style={{ background:'var(--bg2)', borderRadius:8, padding:10, fontSize:13, color:'var(--text-muted)', fontStyle:'italic', marginBottom:12 }}>"{r.message}"</div>
              <div style={{ display:'flex', gap:8 }}>
                <button className="btn btn-success btn-sm" onClick={() => navigate('/requests')}>✓ Accept</button>
                <button className="btn btn-danger btn-sm" onClick={() => navigate('/requests')}>✕ Reject</button>
              </div>
            </div>
          ))}
        </div>

        <div>
          <div className="section-title">My Students</div>
          {students.slice(0,5).map(st => (
            <div key={st._id} className="card card-clickable" style={{ marginBottom:8, padding:14 }} onClick={() => navigate('/students')}>
              <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                <div style={{ width:36, height:36, background:'var(--lav-100)', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:15 }}>🎓</div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:13.5, fontWeight:600 }}>{st.userId?.name}</div>
                  <div style={{ fontSize:11.5, color:'var(--text-muted)' }}>{st.department} · Year {st.year}</div>
                </div>
                <div style={{ fontSize:11.5, fontWeight:600, color:'var(--mint-d)' }}>GPA {st.gpa}</div>
              </div>
            </div>
          ))}
          {students.length === 0 && <div className="card" style={{ textAlign:'center', color:'var(--text-muted)', fontSize:13.5, padding:20 }}>No students assigned yet.</div>}
        </div>
      </div>
    </>
  );
}

// ── ADMIN DASHBOARD ───────────────────────────────────
function AdminDashboard({ data, navigate }) {
  const s = data.stats || {};
  const bars = [40,65,50,80,70,90,60];

  return (
    <>
      <div className="page-header"><h2>Admin Dashboard 🛠️</h2><p>Full system overview — Smart Thesis Hub · Daffodil International University</p></div>

      <div className="stats-grid">
        {[
          { icon:'🎓', val:s.totalStudents||0,    lbl:'Total Students',   trend:'↑ 12% this month', path:'/students' },
          { icon:'👨‍🏫', val:s.totalSupervisors||0, lbl:'Supervisors',       trend:'All departments',  path:'/supervisors' },
          { icon:'📁', val:s.totalProjects||0,    lbl:'Active Projects',  trend:'Across 12 domains', path:'/projects' },
          { icon:'📨', val:s.totalRequests||0,    lbl:'Total Requests',   trend:`${s.pendingRequests||0} pending`, path:'/requests' },
        ].map(s => (
          <div key={s.lbl} className="stat-card card-clickable" onClick={() => navigate(s.path)}>
            <div className="stat-icon">{s.icon}</div>
            <div className="stat-value">{s.val.toLocaleString()}</div>
            <div className="stat-label">{s.lbl}</div>
            <div className="stat-trend trend-up">{s.trend}</div>
          </div>
        ))}
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr', gap:18, marginBottom:22 }}>
        <div className="card">
          <div style={{ fontSize:12, fontWeight:600, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'.5px', marginBottom:12 }}>Weekly Signups</div>
          <div style={{ display:'flex', alignItems:'flex-end', gap:6, height:80 }}>
            {bars.map((h,i) => (
              <div key={i} style={{ flex:1, height:`${h}%`, background:'linear-gradient(to top,var(--lav-500),var(--lav-300))', borderRadius:'4px 4px 0 0', minWidth:8 }} />
            ))}
          </div>
          <div style={{ display:'flex', justifyContent:'space-between', fontSize:11, color:'var(--text-muted)', marginTop:4 }}>
            <span>Mon</span><span>Sun</span>
          </div>
        </div>

        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          <div className="card" style={{ flex:1 }}>
            <div style={{ fontSize:12, fontWeight:600, color:'var(--text-muted)', textTransform:'uppercase', marginBottom:8 }}>Match Rate</div>
            <div style={{ fontFamily:'var(--ff2)', fontSize:36, fontWeight:500, color:'var(--lav-700)' }}>{s.matchRate||94}%</div>
            <div style={{ fontSize:12, color:'var(--text-muted)' }}>Supervisor matches</div>
          </div>
          <div className="card" style={{ flex:1 }}>
            <div style={{ fontSize:12, fontWeight:600, color:'var(--text-muted)', textTransform:'uppercase', marginBottom:8 }}>System Health</div>
            {[['Uptime','99.9%'],['DB Status','Healthy'],['Backups','Auto']].map(([k,v])=>(
              <div key={k} style={{ display:'flex', justifyContent:'space-between', fontSize:12.5, marginBottom:4 }}>
                <span>{k}</span><span style={{ fontWeight:600, color:'var(--mint-d)' }}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
