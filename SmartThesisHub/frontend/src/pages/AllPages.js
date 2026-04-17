// ═══ ProjectsPage.js ═══════════════════════════════════
import React, { useEffect, useState, useCallback } from 'react';
import { projectAPI, studentAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const CATS = ['All','AI/ML','IoT','Blockchain','Web Dev','Mobile Dev','Cybersecurity','Robotics','Networks','Big Data','AR/VR','Smart City','Healthcare','EdTech','Game Dev'];

export function ProjectsPage() {
  const { isStudent, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [cat, setCat]           = useState('All');
  const [search, setSearch]     = useState('');
  const [saved, setSaved]       = useState(new Set());
  const [loading, setLoading]   = useState(true);
  const [toast, setToast]       = useState('');

  const showToast = (msg, type='info') => { setToast({msg,type}); setTimeout(()=>setToast(''),3000); };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (cat !== 'All') params.category = cat;
      if (search) params.search = search;
      const { data } = await projectAPI.getAll(params);
      setProjects(data.projects || []);
      if (isStudent) {
        const { data: me } = await studentAPI.getMe();
        setSaved(new Set(me.student?.savedProjects?.map(p => p._id || p)));
      }
    } catch { setProjects([]); }
    finally { setLoading(false); }
  }, [cat, search, isStudent]);

  useEffect(() => { load(); }, [load]);

  const toggleSave = async (id, e) => {
    e.stopPropagation();
    try {
      await studentAPI.toggleSaveProject(id);
      setSaved(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });
      showToast(saved.has(id) ? 'Project removed' : '✅ Project saved!', 'success');
    } catch (err) { showToast('❌ ' + (err.response?.data?.error || 'Error'), 'error'); }
  };

  const deleteProject = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Remove this project?')) return;
    try { await projectAPI.delete(id); load(); showToast('✅ Project removed', 'success'); }
    catch { showToast('❌ Error removing project', 'error'); }
  };

  return (
    <>
      <div className="page-header">
        <h2>Project Ideas</h2>
        <p>{projects.length} project ideas across CSE, SWE, ICT and more departments</p>
      </div>

      <div style={{ display:'flex', gap:10, marginBottom:14, flexWrap:'wrap', alignItems:'center' }}>
        <div style={{ position:'relative', flex:1, maxWidth:300 }}>
          <span className="search-icon">🔍</span>
          <input className="form-control" style={{ paddingLeft:34 }} placeholder="Search projects…" value={search} onChange={e=>setSearch(e.target.value)} />
        </div>
        {isAdmin && <button className="btn btn-primary btn-sm" onClick={() => navigate('/projects/new')}>+ Add Project</button>}
      </div>

      <div className="filter-bar">
        {CATS.map(c => <div key={c} className={`filter-chip ${cat===c?'active':''}`} onClick={()=>setCat(c)}>{c}</div>)}
      </div>

      {loading ? <div className="loading-screen" style={{ minHeight:200 }}><div className="spinner" /></div> : (
        <div className="card-grid">
          {projects.length===0 ? (
            <div className="empty-state card" style={{ gridColumn:'1/-1' }}>
              <div className="empty-icon">📁</div><div className="empty-title">No projects found</div>
              <p className="empty-desc">Try a different category or search term.</p>
            </div>
          ) : projects.map(p => (
            <div key={p._id} className="card">
              <div className="card-header" style={{ marginBottom:10 }}>
                <div style={{ minWidth:0 }}>
                  <div style={{ fontSize:14.5, fontWeight:600, marginBottom:2 }}>{p.title}</div>
                  <div style={{ fontSize:12, color:'var(--lav-600)', cursor:'pointer' }} onClick={() => navigate(`/supervisors?highlight=${p.supervisorId?._id}`)}>
                    👨‍🏫 {p.supervisorId?.userId?.name || 'Unknown Supervisor'} →
                  </div>
                </div>
                <span className={`tag ${p.difficulty==='Advanced'?'tag-rose':p.difficulty==='Intermediate'?'tag-amber':'tag-mint'}`} style={{ flexShrink:0 }}>{p.difficulty}</span>
              </div>
              <div className="tags-row" style={{ marginBottom:10 }}>
                {p.tags?.map(t=><span key={t} className="tag tag-lav">{t}</span>)}
              </div>
              <div style={{ fontSize:12, color:'var(--text-muted)', display:'flex', gap:10, marginBottom:12, flexWrap:'wrap' }}>
                <span>👁 {p.views}</span>
                <span>👥 {p.availableSlots} slots</span>
                <span className="tag tag-sky">{p.category}</span>
              </div>
              <div style={{ display:'flex', gap:7, flexWrap:'wrap' }}>
                {isStudent && <>
                  <button className={`btn btn-sm ${saved.has(p._id)?'btn-success':'btn-primary'}`} onClick={e=>toggleSave(p._id,e)}>
                    {saved.has(p._id)?'✓ Saved':'📌 Save'}
                  </button>
                  <button className="btn btn-outline btn-sm" onClick={() => navigate(`/supervisors`)}>Request Supervisor</button>
                </>}
                {isAdmin && <>
                  <button className="btn btn-outline btn-sm">✏️ Edit</button>
                  <button className="btn btn-danger btn-sm" onClick={e=>deleteProject(p._id,e)}>🗑 Delete</button>
                </>}
              </div>
            </div>
          ))}
        </div>
      )}
      {toast && <div className="toast-container"><div className={`toast toast-${toast.type}`}>{toast.msg}</div></div>}
    </>
  );
}

// ═══ ResourcesPage.js ══════════════════════════════════
export function ResourcesPage() {
  const [videos, setVideos]   = useState([]);
  const [cat, setCat]         = useState('All');
  const [loading, setLoading] = useState(true);
  const [playing, setPlaying] = useState(null);
  const { videoAPI } = require('../utils/api');

  const VCATS = ['All','Research Methods','Tools','Planning','AI/ML','Programming','Presentation','Writing'];

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await videoAPI.getAll(cat !== 'All' ? { category: cat } : {});
        setVideos(data.videos || []);
      } catch { setVideos([]); }
      finally { setLoading(false); }
    };
    load();
  }, [cat]);

  const openVideo = async (v) => {
    try { await videoAPI.addView(v._id); } catch {}
    setPlaying(v);
  };

  const colors = ['#7c3aed','#0284c7','#059669','#d97706','#db2777','#7c3aed','#0284c7','#059669'];

  return (
    <>
      <div className="page-header">
        <h2>Video Resources</h2>
        <p>{videos.length} curated YouTube videos on research, programming, and thesis writing — click to watch</p>
      </div>

      <div className="filter-bar">
        {VCATS.map((c,i) => <div key={c} className={`filter-chip ${cat===c?'active':''}`} onClick={()=>setCat(c)}>{c}</div>)}
      </div>

      {loading ? <div className="loading-screen" style={{ minHeight:200 }}><div className="spinner" /></div> : (
        <div className="card-grid">
          {videos.map((v,i) => (
            <div key={v._id} className="video-card" onClick={()=>openVideo(v)}>
              <div className="video-thumb" style={{ background:`linear-gradient(135deg,${colors[i%colors.length]}33,${colors[i%colors.length]}88)` }}>
                {v.thumbnail && <img src={v.thumbnail} alt={v.title} onError={e=>e.target.style.display='none'} />}
                <div className="play-btn">▶</div>
                <div className="video-duration">{v.duration}</div>
              </div>
              <div className="video-info">
                <div className="video-title">{v.title}</div>
                <div className="video-meta">
                  <span className="tag tag-sky" style={{ fontSize:'10.5px' }}>{v.category}</span>
                  <span>👁 {v.views?.toLocaleString()} views</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Video Player Modal */}
      {playing && (
        <div className="modal-backdrop" onClick={()=>setPlaying(null)}>
          <div className="modal-box" style={{ maxWidth:700 }} onClick={e=>e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title" style={{ fontSize:15 }}>▶ {playing.title}</div>
              <button className="modal-close" onClick={()=>setPlaying(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div style={{ position:'relative', paddingBottom:'56.25%', height:0, overflow:'hidden', borderRadius:10 }}>
                <iframe src={`https://www.youtube.com/embed/${playing.youtubeId}?autoplay=1`}
                  style={{ position:'absolute', top:0, left:0, width:'100%', height:'100%', border:'none', borderRadius:10 }}
                  allowFullScreen allow="autoplay; encrypted-media" title={playing.title} />
              </div>
              <div style={{ marginTop:10, textAlign:'center' }}>
                <a href={playing.youtubeUrl} target="_blank" rel="noreferrer" style={{ color:'var(--lav-600)', fontSize:13 }}>🔗 Open on YouTube</a>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ═══ RequestsPage.js ═══════════════════════════════════
export function RequestsPage() {
  const { isStudent, isSupervisor } = useAuth();
  const [requests, setRequests]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [toast, setToast]           = useState('');
  const [filter, setFilter]         = useState('all');
  const { requestAPI: rAPI }        = require('../utils/api');

  const showToast = (msg, type='info') => { setToast({msg,type}); setTimeout(()=>setToast(''),3000); };

  const load = async () => {
    setLoading(true);
    try {
      const params = filter !== 'all' ? { status: filter } : {};
      const { data } = await rAPI.getAll(params);
      setRequests(data.requests || []);
    } catch { setRequests([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [filter]);

  const respond = async (id, status) => {
    try {
      await rAPI.updateStatus(id, { status });
      showToast(`✅ Request ${status}`, 'success');
      load();
    } catch (err) { showToast('❌ ' + (err.response?.data?.error || 'Error'), 'error'); }
  };

  const withdraw = async (id) => {
    if (!window.confirm('Withdraw this request?')) return;
    try { await rAPI.withdraw(id); showToast('✅ Request withdrawn', 'success'); load(); }
    catch { showToast('❌ Error', 'error'); }
  };

  return (
    <>
      <div className="page-header">
        <h2>{isStudent ? 'My Requests' : 'Student Requests'}</h2>
        <p>{requests.length} total requests · {requests.filter(r=>r.status==='pending').length} pending</p>
      </div>

      <div className="filter-bar">
        {['all','pending','accepted','rejected'].map(f=>(
          <div key={f} className={`filter-chip ${filter===f?'active':''}`} onClick={()=>setFilter(f)}>
            {f.charAt(0).toUpperCase()+f.slice(1)}
          </div>
        ))}
      </div>

      {loading ? <div className="loading-screen" style={{ minHeight:200 }}><div className="spinner" /></div> :
        requests.length === 0 ? (
          <div className="card empty-state">
            <div className="empty-icon">📭</div>
            <div className="empty-title">No requests found</div>
            <p className="empty-desc">{isStudent ? 'You haven\'t sent any requests yet.' : 'No student requests received yet.'}</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead><tr>
                <th>{isStudent ? 'Supervisor' : 'Student'}</th>
                <th>Research Area</th>
                <th>Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr></thead>
              <tbody>
                {requests.map(r => (
                  <tr key={r._id}>
                    <td><b>{isStudent ? r.supervisorId?.name : r.studentId?.name}</b></td>
                    <td>{r.researchArea}</td>
                    <td>{new Date(r.createdAt).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'})}</td>
                    <td><span className={`pill pill-${r.status}`}>{r.status.charAt(0).toUpperCase()+r.status.slice(1)}</span></td>
                    <td>
                      <div style={{ display:'flex', gap:6 }}>
                        {r.status==='pending' && isSupervisor && <>
                          <button className="btn btn-success btn-sm" onClick={()=>respond(r._id,'accepted')}>✓ Accept</button>
                          <button className="btn btn-danger btn-sm" onClick={()=>respond(r._id,'rejected')}>✕ Reject</button>
                        </>}
                        {r.status==='pending' && isStudent && (
                          <button className="btn btn-danger btn-sm" onClick={()=>withdraw(r._id)}>Withdraw</button>
                        )}
                        {r.status !== 'pending' && <span style={{ fontSize:12, color:'var(--text-muted)' }}>No action</span>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      }
      {toast && <div className="toast-container"><div className={`toast toast-${toast.type}`}>{toast.msg}</div></div>}
    </>
  );
}

// ═══ StudentsPage.js ═══════════════════════════════════
export function StudentsPage() {
  const { isSupervisor } = useAuth();
  const [students, setStudents] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [selected, setSelected] = useState(null);
  const { studentAPI: sAPI, supervisorAPI: svAPI } = require('../utils/api');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const { data } = await sAPI.getAll();
        setStudents(data.students || []);
      } catch { setStudents([]); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const [rating, setRating] = useState(0);
  const saveRating = async () => {
    if (!rating) return;
    try {
      await svAPI.rateStudent({ studentId: selected._id, rating });
      setSelected(null); setRating(0);
    } catch {}
  };

  return (
    <>
      <div className="page-header">
        <h2>{isSupervisor ? 'My Students' : 'All Students'}</h2>
        <p>{students.length} student{students.length!==1?'s':''} {isSupervisor ? 'under your supervision' : 'in the system'}</p>
      </div>

      {loading ? <div className="loading-screen" style={{ minHeight:200 }}><div className="spinner" /></div> : (
        students.length === 0 ? (
          <div className="card empty-state"><div className="empty-icon">🎓</div><div className="empty-title">No students yet</div></div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Student</th><th>Roll No.</th><th>Dept</th><th>Year</th><th>GPA</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {students.map(st => (
                  <tr key={st._id}>
                    <td>
                      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                        <div style={{ width:30, height:30, background:'var(--lav-100)', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12 }}>🎓</div>
                        <div>
                          <div style={{ fontWeight:600, fontSize:13 }}>{st.userId?.name}</div>
                          <div style={{ fontSize:11, color:'var(--text-muted)' }}>{st.userId?.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ fontFamily:'var(--ffc)', fontSize:12 }}>{st.rollNo}</td>
                    <td>{st.department}</td>
                    <td>Year {st.year}</td>
                    <td><b>{st.gpa}</b></td>
                    <td><span className="pill pill-accepted">Assigned</span></td>
                    <td>
                      <div style={{ display:'flex', gap:5 }}>
                        <button className="btn btn-outline btn-sm" onClick={()=>setSelected(st)}>View</button>
                        {isSupervisor && <button className="btn btn-outline btn-sm" onClick={()=>{setSelected(st);setRating(0);}}>Rate</button>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}

      {selected && (
        <div className="modal-backdrop" onClick={()=>setSelected(null)}>
          <div className="modal-box" onClick={e=>e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">Student Profile</div>
              <button className="modal-close" onClick={()=>setSelected(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:18 }}>
                <div style={{ width:56, height:56, background:'var(--lav-100)', borderRadius:14, display:'flex', alignItems:'center', justifyContent:'center', fontSize:24 }}>🎓</div>
                <div>
                  <div style={{ fontSize:17, fontWeight:600 }}>{selected.userId?.name}</div>
                  <div style={{ fontSize:12.5, color:'var(--text-muted)' }}>{selected.rollNo} · {selected.userId?.email}</div>
                </div>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:16 }}>
                {[['Department',selected.department],['Year',`Year ${selected.year}`],['GPA',selected.gpa+' / 4.00'],['Status','Assigned']].map(([k,v])=>(
                  <div key={k} style={{ background:'var(--bg2)', borderRadius:'var(--r2)', padding:12 }}>
                    <div style={{ fontSize:11, color:'var(--text-muted)' }}>{k}</div>
                    <div style={{ fontWeight:600, marginTop:2 }}>{v}</div>
                  </div>
                ))}
              </div>
              {isSupervisor && (
                <div>
                  <div style={{ fontSize:13, fontWeight:600, marginBottom:8 }}>Rate this student</div>
                  <div className="star-rating">
                    {[1,2,3,4,5].map(i=>(
                      <span key={i} className={i<=rating?'filled':''} onClick={()=>setRating(i)}>★</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline btn-sm" onClick={()=>setSelected(null)}>Close</button>
              {isSupervisor && rating>0 && <button className="btn btn-primary btn-sm" onClick={saveRating}>Save Rating</button>}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ═══ ProfilePage.js ════════════════════════════════════
export function ProfilePage() {
  const { user, isStudent, isSupervisor } = useAuth();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ bio:'', phone:'', interests:'' });

  return (
    <>
      <div className="page-header"><h2>My Profile</h2><p>Manage your account information</p></div>
      <div className="card" style={{ marginBottom:18, overflow:'hidden' }}>
        <div style={{ height:100, background:'linear-gradient(135deg,var(--lav-300),var(--lav-500),var(--rose))', margin:'-20px -20px 0' }} />
        <div style={{ display:'flex', alignItems:'flex-end', gap:16, marginTop:-28, padding:'0 0 20px' }}>
          <div style={{ width:64, height:64, background:'var(--lav-100)', borderRadius:16, display:'flex', alignItems:'center', justifyContent:'center', fontSize:26, border:'4px solid #fff' }}>
            {isStudent?'🎓':isSupervisor?'👨‍🏫':'🛠️'}
          </div>
          <div style={{ paddingBottom:4 }}>
            <div style={{ fontFamily:'var(--ff2)', fontSize:20, fontWeight:500, color:'var(--lav-900)' }}>{user?.name}</div>
            <div style={{ fontSize:13, color:'var(--text-muted)' }}>{user?.email}</div>
          </div>
          <button className="btn btn-primary btn-sm" style={{ marginLeft:'auto', marginBottom:4 }} onClick={()=>setEditing(true)}>✏️ Edit Profile</button>
        </div>
        <div style={{ borderTop:'1px solid var(--border)', paddingTop:16 }}>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(150px,1fr))', gap:12 }}>
            {[['Role',user?.role?.charAt(0).toUpperCase()+user?.role?.slice(1)],['University','Daffodil International University'],['Status',user?.isActive?'Active':'Inactive']].map(([k,v])=>(
              <div key={k}>
                <div style={{ fontSize:11, color:'var(--text-muted)' }}>{k}</div>
                <div style={{ fontWeight:600, fontSize:13.5, marginTop:2 }}>{v}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {editing && (
        <div className="modal-backdrop" onClick={()=>setEditing(false)}>
          <div className="modal-box" onClick={e=>e.stopPropagation()}>
            <div className="modal-header"><div className="modal-title">Edit Profile</div><button className="modal-close" onClick={()=>setEditing(false)}>✕</button></div>
            <div className="modal-body">
              <div className="form-group"><label>Phone</label><input className="form-control" placeholder="+880 17XX-XXXXXX" value={form.phone} onChange={e=>setForm(f=>({...f,phone:e.target.value}))} /></div>
              {isStudent && <div className="form-group"><label>Research Interests</label><input className="form-control" placeholder="Machine Learning, NLP, IoT…" value={form.interests} onChange={e=>setForm(f=>({...f,interests:e.target.value}))} /></div>}
              <div className="form-group"><label>Bio</label><textarea className="form-control" placeholder="Tell us about yourself…" value={form.bio} onChange={e=>setForm(f=>({...f,bio:e.target.value}))} /></div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline btn-sm" onClick={()=>setEditing(false)}>Cancel</button>
              <button className="btn btn-primary btn-sm" onClick={()=>setEditing(false)}>Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ═══ FeedbackPage.js ═══════════════════════════════════
export function FeedbackPage() {
  const { feedbackAPI: fAPI } = require('../utils/api');
  const [form, setForm] = useState({ category:'General', subject:'', body:'', rating:0 });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    if (!form.subject || !form.body) { setError('Subject and message are required.'); return; }
    setLoading(true);
    try { await fAPI.submit(form); setSent(true); }
    catch (err) { setError(err.response?.data?.error || 'Error submitting feedback.'); }
    finally { setLoading(false); }
  };

  if (sent) return (
    <div className="empty-state card" style={{ maxWidth:480, margin:'0 auto' }}>
      <div className="empty-icon">✅</div>
      <div className="empty-title">Feedback Submitted!</div>
      <p className="empty-desc">Thank you for helping us improve Smart Thesis Hub at DIU.</p>
      <button className="btn btn-primary" onClick={()=>setSent(false)}>Submit Another</button>
    </div>
  );

  return (
    <>
      <div className="page-header"><h2>Feedback & Support</h2><p>Help us improve the platform for DIU students and faculty</p></div>
      <div style={{ maxWidth:600 }}>
        <form className="card" onSubmit={submit} style={{ marginBottom:16 }}>
          <div style={{ fontSize:15, fontWeight:600, marginBottom:4 }}>Send Feedback</div>
          <div style={{ fontSize:13, color:'var(--text-muted)', marginBottom:18 }}>Your feedback directly helps improve this platform.</div>
          <div className="form-group"><label>Category</label>
            <select className="form-control" value={form.category} onChange={e=>setForm(f=>({...f,category:e.target.value}))}>
              {['General','Bug Report','Feature Request','Supervisor Issue','Technical Problem'].map(c=><option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="form-group"><label>Subject</label><input className="form-control" placeholder="Brief description" value={form.subject} onChange={e=>setForm(f=>({...f,subject:e.target.value}))} /></div>
          <div className="form-group"><label>Message</label><textarea className="form-control" rows={5} placeholder="Describe your experience or issue…" value={form.body} onChange={e=>setForm(f=>({...f,body:e.target.value}))} /></div>
          <div className="form-group"><label>Rating</label>
            <div className="star-rating">{[1,2,3,4,5].map(i=><span key={i} className={i<=form.rating?'filled':''} onClick={()=>setForm(f=>({...f,rating:i}))}>★</span>)}</div>
          </div>
          {error && <div className="alert alert-error">{error}</div>}
          <button type="submit" className="btn btn-primary" disabled={loading}>{loading?'Sending…':'Send Feedback'}</button>
        </form>
        <div className="card">
          <div style={{ fontSize:15, fontWeight:600, marginBottom:14 }}>Contact DIU Support</div>
          {[['📧','Email','sth-support@diu.edu.bd'],['📞','Help Desk','+880-2-9130039 (9AM–5PM BDT)'],['🌐','Website','www.daffodilvarsity.edu.bd']].map(([ic,l,v])=>(
            <div key={l} style={{ display:'flex', gap:10, alignItems:'center', marginBottom:10 }}>
              <div style={{ width:36, height:36, background:'var(--lav-100)', borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center' }}>{ic}</div>
              <div><div style={{ fontSize:13.5, fontWeight:500 }}>{l}</div><div style={{ fontSize:12.5, color:'var(--text-muted)' }}>{v}</div></div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

// ═══ AdminUsersPage.js ═════════════════════════════════
export function AdminUsersPage() {
  const [users, setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [role, setRole]     = useState('');
  const { adminAPI: aAPI }  = require('../utils/api');

  const load = async () => {
    setLoading(true);
    try { const { data } = await aAPI.getUsers(role?{role}:{}); setUsers(data.users||[]); }
    catch { setUsers([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [role]);

  const toggle = async (id) => { try { await aAPI.toggleActive(id); load(); } catch {} };
  const del    = async (id) => { if(!window.confirm('Delete this user?')) return; try { await aAPI.deleteUser(id); load(); } catch {} };

  return (
    <>
      <div className="page-header"><h2>User Management</h2><p>Manage all platform users — students, supervisors, and admins</p></div>
      <div style={{ display:'flex', gap:10, marginBottom:16, flexWrap:'wrap' }}>
        {['','student','supervisor','admin'].map(r=>(
          <div key={r} className={`filter-chip ${role===r?'active':''}`} onClick={()=>setRole(r)}>
            {r?r.charAt(0).toUpperCase()+r.slice(1):'All Roles'}
          </div>
        ))}
      </div>
      {loading ? <div className="loading-screen" style={{ minHeight:200 }}><div className="spinner" /></div> : (
        <div className="table-wrap">
          <table>
            <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Joined</th><th>Actions</th></tr></thead>
            <tbody>
              {users.map(u=>(
                <tr key={u._id}>
                  <td><b>{u.name}</b></td>
                  <td style={{ fontSize:12.5, color:'var(--text-muted)' }}>{u.email}</td>
                  <td><span className={`tag ${u.role==='admin'?'tag-rose':u.role==='supervisor'?'tag-amber':'tag-lav'}`}>{u.role}</span></td>
                  <td><span className={`pill ${u.isActive?'pill-accepted':'pill-rejected'}`}>{u.isActive?'Active':'Inactive'}</span></td>
                  <td style={{ fontSize:12 }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td><div style={{ display:'flex', gap:5 }}>
                    <button className="btn btn-outline btn-sm" onClick={()=>toggle(u._id)}>{u.isActive?'Deactivate':'Activate'}</button>
                    <button className="btn btn-danger btn-sm" onClick={()=>del(u._id)}>Delete</button>
                  </div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

// ═══ AdminAnalyticsPage.js ═════════════════════════════
export function AdminAnalyticsPage() {
  const [analytics, setAnalytics] = useState(null);
  const { adminAPI: aAPI } = require('../utils/api');

  useEffect(() => {
    aAPI.getAnalytics().then(({data})=>setAnalytics(data)).catch(()=>{});
  }, []);

  const s = analytics?.stats || {};
  const bars = [40,65,50,80,70,90,60];

  return (
    <>
      <div className="page-header"><h2>Analytics Dashboard</h2><p>Real-time system performance and usage statistics</p></div>
      <div className="stats-grid">
        {[
          ['🎓','Total Students',   s.totalStudents||0],
          ['👨‍🏫','Supervisors',      s.totalSupervisors||0],
          ['📁','Projects',         s.totalProjects||0],
          ['📨','Total Requests',   s.totalRequests||0],
          ['⏳','Pending Requests', s.pendingRequests||0],
          ['✅','Accepted',         s.acceptedRequests||0],
          ['📊','Match Rate',       `${s.matchRate||0}%`],
          ['💬','Open Feedback',    s.openFeedback||0],
        ].map(([ic,l,v])=>(
          <div key={l} className="stat-card">
            <div className="stat-icon">{ic}</div>
            <div className="stat-value">{typeof v==='number'?v.toLocaleString():v}</div>
            <div className="stat-label">{l}</div>
          </div>
        ))}
      </div>
      <div className="card">
        <div style={{ fontSize:13, fontWeight:600, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'.5px', marginBottom:14 }}>Weekly User Signups</div>
        <div style={{ display:'flex', alignItems:'flex-end', gap:8, height:100 }}>
          {bars.map((h,i)=><div key={i} style={{ flex:1, height:`${h}%`, background:`linear-gradient(to top,var(--lav-500),var(--lav-300))`, borderRadius:'4px 4px 0 0' }} />)}
        </div>
        <div style={{ display:'flex', justifyContent:'space-between', fontSize:11, color:'var(--text-muted)', marginTop:6 }}>
          {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d=><span key={d}>{d}</span>)}
        </div>
      </div>
    </>
  );
}

// ═══ NotFoundPage.js ═══════════════════════════════════
export function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(135deg,#f5f3ff,#ede9fe)', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ textAlign:'center', padding:40 }}>
        <div style={{ fontFamily:'var(--ff2)', fontSize:80, color:'var(--lav-300)', marginBottom:16 }}>404</div>
        <div style={{ fontFamily:'var(--ff2)', fontSize:26, fontWeight:500, color:'var(--lav-900)', marginBottom:8 }}>Page Not Found</div>
        <p style={{ color:'var(--text-muted)', marginBottom:24 }}>This page doesn't exist or you don't have access.</p>
        <button className="btn btn-primary" onClick={()=>navigate('/')}>← Go Home</button>
      </div>
    </div>
  );
}

export default ProjectsPage;
