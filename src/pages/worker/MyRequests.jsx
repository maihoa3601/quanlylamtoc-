import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useData } from '../../hooks/useData';
import { timeAgo } from '../../utils/formatters';
import { Clock, CheckCircle, XCircle, Calendar } from 'lucide-react';

const MyRequests = () => {
  const { currentUser } = useAuth();
  const { getWorkerRequests } = useData();
  const [filter, setFilter] = useState('all');

  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];
  const [startDate, setStartDate] = useState(firstDay);
  const [endDate, setEndDate] = useState(lastDay);

  const myRequests = getWorkerRequests(currentUser.id)
    .filter(r => filter === 'all' || r.status === filter)
    .filter(r => {
      const rDate = r.requestDate.split('T')[0];
      return rDate >= startDate && rDate <= endDate;
    })
    .sort((a, b) => new Date(b.requestDate) - new Date(a.requestDate));

  return (
    <div className="container animate-slide-up">
      <h2 style={{ marginBottom: '16px' }}>📋 Request Của Tôi</h2>

      <div className="card" style={{ marginBottom: '16px', display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Calendar size={20} className="text-muted" />
          <input 
            type="date" 
            className="form-input" 
            value={startDate} 
            onChange={e => setStartDate(e.target.value)} 
            style={{ padding: '8px 10px' }}
          />
          <span className="text-muted">-</span>
          <input 
            type="date" 
            className="form-input" 
            value={endDate} 
            onChange={e => setEndDate(e.target.value)} 
            style={{ padding: '8px 10px' }}
          />
        </div>
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', overflowX: 'auto' }}>
        {[
          { key: 'all', label: 'Tất cả' },
          { key: 'pending', label: 'Chờ duyệt' },
          { key: 'approved', label: 'Đã duyệt' },
          { key: 'rejected', label: 'Từ chối' },
        ].map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)}
            style={{
              padding: '8px 16px', cursor: 'pointer', whiteSpace: 'nowrap', border: 'none',
              background: filter === f.key ? 'var(--primary)' : 'var(--bg-surface-hover)',
              color: filter === f.key ? 'white' : 'var(--text-secondary)',
              borderRadius: '20px', fontWeight: 500, fontSize: '0.8rem',
            }}
          >{f.label}</button>
        ))}
      </div>

      {myRequests.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
          <p className="text-muted">Chưa có request nào</p>
        </div>
      ) : (
        myRequests.map(req => (
          <div key={req.id} className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {req.status === 'pending' && <Clock size={16} style={{ color: 'var(--warning)' }} />}
                {req.status === 'approved' && <CheckCircle size={16} style={{ color: 'var(--success)' }} />}
                {req.status === 'rejected' && <XCircle size={16} style={{ color: 'var(--danger)' }} />}
                <span className="text-sm text-muted">{timeAgo(req.requestDate)}</span>
              </div>
              <span className={`badge ${req.status === 'pending' ? 'badge-pending' : req.status === 'approved' ? 'badge-success' : 'badge-danger'}`}>
                {req.status === 'pending' ? 'Chờ duyệt' : req.status === 'approved' ? 'Đã duyệt' : 'Từ chối'}
              </span>
            </div>
            <div style={{ marginTop: '10px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {req.items?.map((it, i) => (
                <span key={i} style={{ background: 'var(--bg-surface-hover)', padding: '4px 10px', borderRadius: '6px', fontSize: '0.85rem' }}>
                  {it.hairTypeName}: <strong>{it.quantity}</strong>
                </span>
              ))}
            </div>
            {req.note && <p className="text-sm text-muted" style={{ marginTop: '8px' }}>📝 {req.note}</p>}
            {req.rejectReason && <p className="text-sm" style={{ marginTop: '8px', color: 'var(--danger)' }}>❌ {req.rejectReason}</p>}
          </div>
        ))
      )}
    </div>
  );
};

export default MyRequests;
