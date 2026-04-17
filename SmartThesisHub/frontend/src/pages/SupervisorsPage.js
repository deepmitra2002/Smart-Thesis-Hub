import React, { useEffect, useState, useCallback } from 'react';
import { supervisorAPI, requestAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';

const DEPTS = ['All','CSE','SWE','ICT','ICE','ETE','MCT'];

export default function SupervisorsPage() {
  const { isStudent } = useAuth();
  const [supervisors, setSupervisors] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [dept, setDept]               = useState('All');
  const [search, setSearch]           = useState('');
  const [selected, setSelected]       = useState(null);
  const [msgModal, setMsgModal]       = useState(false);
  const [reqForm, setReqForm]         = useState({ message:'', researchArea:'' });
  const [sending, setSending]         = useState(false);
  const [toast, setToast]             = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (dept !== 'All') params.dept = dept;
      if (search) params.search = search;
      const { data } = await supervisorAPI.getAll(params);
      setSupervisors(data.supervisors || []);
    } catch { setSupervisors([]); }
    finally { setLoading(false); }
  }, [dept, search]);

  useEffect(() => { load(); }, [load]);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const sendRequest = async () => {
    if (reqForm.message.trim().length < 15) { showToast('❌ Message must be at least 15 characters.'); return; }
    if (!reqForm.researchArea.trim()) { showToast('❌ Please enter a research area.'); return; }
    setSending(true);
    try {
      await requestAPI.create({ supervisorId: selected.userId?._id || selected._id, message: reqForm.message, researchArea: reqForm.researchArea });
      setMsgModal(false); setSelected(null); setReqForm({ message:'', researchArea:'' });
      showToast('✅ Request sent successfully!');
    } catch (err) {
      showToast('❌ ' + (err.response?.data?.error || 'Failed to send request.'));
    } finally { setSending(false); }
  };

  return (
    <>
      <div className="page-header">
        <h2>Find Your Supervisor</h2>
        <p>{supervisors.length} supervisors across DIU departments · Filter by department or search by name/area</p>
      </div>

      {/* Search + Filter */}
      <div style={{ display:'flex', gap:12, marginBottom:18, flexWrap:'wrap', alignItems:'center' }}>
        <div style={{ position:'relative', flex:1, maxWidth:320 }}>
          <span className="search-icon">🔍</span>
          <input className="form-control" style={{ paddingLeft:34 }} placeholder="Search by name or research area…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="filter-bar" style={{ marginBottom:0 }}>
          {DEPTS.map(d => (
            <div key={d} className={`filter-chip ${dept===d?'active':''}`} onClick={() => setDept(d)}>{d}</div>
          ))}
        </div>
      </div>

      {loading ? <div className="loading-screen" style={{ minHeight:200 }}><div className="spinner" /></div> : (
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          {supervisors.length === 0 ? (
            <div className="empty-state card"><div className="empty-icon">🔍</div><div className="empty-title">No supervisors found</div><p className="empty-desc">Try a different department or search term.</p></div>
          ) : supervisors.map(sv => {
            const avail = sv.availableSlots ?? (sv.maxSlots - (sv.assignedStudents?.length || 0));
            return (
              <div key={sv._id} className="card card-clickable" style={{ display:'flex', gap:16, alignItems:'flex-start' }} onClick={() => setSelected(sv)}>
                <div style={{ width:52, height:52, background:'var(--lav-100)', borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, flexShrink:0 }}>👨‍🏫</div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:14.5, fontWeight:600, marginBottom:2 }}>{sv.userId?.name || sv.name}</div>
                  <div style={{ fontSize:12, color:'var(--text-muted)', marginBottom:7 }}>{sv.title} · {sv.department} · Daffodil International University</div>
                  <div style={{ display:'flex', gap:12, fontSize:12, color:'var(--text-muted)', marginBottom:8, flexWrap:'wrap' }}>
                    <span>⭐ {sv.rating}</span>
                    <span>📚 {sv.publications} pubs</span>
                    <span>🎓 {sv.assignedStudents?.length || 0}/{sv.maxSlots} students</span>
                    <span>⏳ {sv.experience}y exp</span>
                  </div>
                  <div className="tags-row" style={{ marginBottom:8 }}>
                    {sv.researchAreas?.slice(0,3).map(a => <span key={a} className="tag tag-lav">{a}</span>)}
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                    <div style={{ flex:1 }}>
                      <div className="progress-bar"><div className="progress-fill" style={{ width:`${((sv.assignedStudents?.length||0)/sv.maxSlots)*100}%` }} /></div>
                      <div style={{ fontSize:11, color:'var(--text-muted)', marginTop:2 }}>Capacity: {sv.assignedStudents?.length||0}/{sv.maxSlots}</div>
                    </div>
                    <span className={`tag ${avail>0?'tag-mint':'tag-rose'}`} style={{ flexShrink:0 }}>
                      {avail>0 ? `${avail} slot${avail>1?'s':''} open` : 'Full'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Supervisor Detail Modal */}
      {selected && !msgModal && (
        <div className="modal-backdrop" onClick={() => setSelected(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">{selected.userId?.name || selected.name}</div>
              <button className="modal-close" onClick={() => setSelected(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div style={{ display:'flex', gap:14, marginBottom:18 }}>
                <div style={{ width:60, height:60, background:'var(--lav-100)', borderRadius:14, display:'flex', alignItems:'center', justifyContent:'center', fontSize:26, flexShrink:0 }}>👨‍🏫</div>
                <div>
                  <div style={{ fontSize:16, fontWeight:600, marginBottom:2 }}>{selected.userId?.name || selected.name}</div>
                  <div style={{ fontSize:13, color:'var(--text-muted)' }}>{selected.title} · {selected.department} · DIU</div>
                  <div style={{ marginTop:4, fontSize:13, color:'var(--amber)' }}>{'★'.repeat(Math.round(selected.rating))} {selected.rating}</div>
                </div>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8, marginBottom:16 }}>
                {[['📚',selected.publications,'Publications'],['⏳',selected.experience+'y','Experience'],['🪑',selected.availableSlots ?? (selected.maxSlots-(selected.assignedStudents?.length||0)),'Open Slots']].map(([ic,v,l])=>(
                  <div key={l} style={{ background:'var(--bg2)', borderRadius:'var(--r2)', padding:12, textAlign:'center' }}>
                    <div style={{ fontFamily:'var(--ff2)', fontSize:20, color:'var(--lav-700)' }}>{v}</div>
                    <div style={{ fontSize:11, color:'var(--text-muted)' }}>{l}</div>
                  </div>
                ))}
              </div>
              <div style={{ marginBottom:14 }}>
                <div style={{ fontSize:11.5, fontWeight:600, color:'var(--text-muted)', textTransform:'uppercase', marginBottom:7 }}>Research Areas</div>
                <div className="tags-row">{selected.researchAreas?.map(a => <span key={a} className="tag tag-lav">{a}</span>)}</div>
              </div>
              {selected.bio && <div style={{ fontSize:13.5, color:'var(--text-muted)', lineHeight:1.7 }}>{selected.bio}</div>}
              <div style={{ marginTop:14, fontSize:13, color:'var(--text-muted)' }}>
                📧 {selected.userId?.email || selected.email}
                {selected.phone && <> · 📞 {selected.phone}</>}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline btn-sm" onClick={() => setSelected(null)}>Close</button>
              {isStudent && (selected.availableSlots ?? (selected.maxSlots-(selected.assignedStudents?.length||0))) > 0 && (
                <button className="btn btn-primary btn-sm" onClick={() => setMsgModal(true)}>📨 Send Request</button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Request Form Modal */}
      {selected && msgModal && (
        <div className="modal-backdrop" onClick={() => { setMsgModal(false); }}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">Request — {selected.userId?.name || selected.name}</div>
              <button className="modal-close" onClick={() => setMsgModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Research Interest Area</label>
                <input className="form-control" placeholder="e.g. Machine Learning, IoT, Blockchain…" value={reqForm.researchArea} onChange={e => setReqForm(f=>({...f,researchArea:e.target.value}))} />
              </div>
              <div className="form-group">
                <label>Your Message <span style={{ color:'var(--rose-d)' }}>*</span></label>
                <textarea className="form-control" rows={5} placeholder="Introduce yourself, describe your project idea, and explain why you want this supervisor (min. 15 characters)…" value={reqForm.message} onChange={e => setReqForm(f=>({...f,message:e.target.value}))} />
                <div style={{ fontSize:11.5, color:'var(--text-muted)', marginTop:4 }}>{reqForm.message.length} / 1000 characters</div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline btn-sm" onClick={() => setMsgModal(false)}>Cancel</button>
              <button className="btn btn-primary btn-sm" onClick={sendRequest} disabled={sending}>
                {sending ? 'Sending…' : '📨 Send Request'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && <div className="toast-container"><div className={`toast ${toast.startsWith('✅')?'toast-success':'toast-error'}`}>{toast}</div></div>}
    </>
  );
}
