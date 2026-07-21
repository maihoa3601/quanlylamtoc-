import React, { useState } from 'react';
import { useData } from '../../hooks/useData';
import { timeAgo } from '../../utils/formatters';
import { Check, X, Clock, CheckCircle, XCircle } from 'lucide-react';

const ReviewRequests = () => {
  const { requests, approveRequest, rejectRequest } = useData();
  const [filter, setFilter] = useState('pending');
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  const filtered = requests
    .filter(r => filter === 'all' || r.status === filter)
    .sort((a, b) => new Date(b.requestDate) - new Date(a.requestDate));

  const handleReject = (id) => {
    rejectRequest(id, rejectReason || 'Không có lý do');
    setRejectingId(null);
    setRejectReason('');
  };

  const statusIcon = (s) => {
    if (s === 'pending') return <Clock size={16} style={{ color: 'var(--warning)' }} />;
    if (s === 'approved') return <CheckCircle size={16} style={{ color: 'var(--success)' }} />;
    return <XCircle size={16} style={{ color: 'var(--danger)' }} />;
  };

  return (
    <div className="container animate-slide-up">
      <h2 style={{ marginBottom: '16px' }}>📤 Xuất Giao Hàng</h2>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', overflowX: 'auto' }}>
        {[
          { key: 'pending', label: `Chờ giao (${requests.filter(r => r.status === 'pending').length})` },
          { key: 'approved', label: 'Đã giao' },
          { key: 'rejected', label: 'Từ chối' },
          { key: 'all', label: 'Tất cả' },
        ].map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)}
            className={`badge ${filter === f.key ? 'badge-active' : ''}`}
            style={{
              padding: '8px 16px', cursor: 'pointer', whiteSpace: 'nowrap', border: 'none',
              background: filter === f.key ? 'var(--primary)' : 'var(--bg-surface-hover)',
              color: filter === f.key ? 'white' : 'var(--text-secondary)',
              borderRadius: '20px', fontWeight: 500, fontSize: '0.8rem',
            }}
          >{f.label}</button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
          <p className="text-muted">Không có request nào</p>
        </div>
      ) : (
        filtered.map(req => (
          <div key={req.id} className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {statusIcon(req.status)} {req.workerName}
                </div>
                <div className="text-sm text-muted" style={{ marginTop: '4px' }}>
                  {req.workerPhone} • {timeAgo(req.requestDate)}
                </div>
              </div>
              <span className={`badge ${req.status === 'pending' ? 'badge-pending' : req.status === 'approved' ? 'badge-success' : 'badge-danger'}`}>
                {req.status === 'pending' ? 'Chờ giao' : req.status === 'approved' ? 'Đã giao' : 'Từ chối'}
              </span>
            </div>

            <div style={{ marginTop: '12px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {req.items?.map((it, i) => (
                <span key={i} style={{ background: 'var(--bg-surface-hover)', padding: '6px 12px', borderRadius: '8px', fontSize: '0.85rem' }}>
                  {it.hairTypeName}: <strong>{it.quantity}</strong>
                </span>
              ))}
            </div>

            {req.note && <div className="text-sm" style={{ marginTop: '8px', fontStyle: 'italic', color: 'var(--text-secondary)' }}>📝 {req.note}</div>}
            {req.rejectReason && <div className="text-sm" style={{ marginTop: '8px', color: 'var(--danger)' }}>❌ Lý do: {req.rejectReason}</div>}

            {req.status === 'pending' && (
              <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--border)' }}>
                {rejectingId === req.id ? (
                  <div>
                    <input className="form-input" placeholder="Lý do từ chối..." value={rejectReason}
                      onChange={e => setRejectReason(e.target.value)} style={{ marginBottom: '8px' }} />
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button className="btn btn-outline" onClick={() => setRejectingId(null)} style={{ flex: 1 }}>Hủy</button>
                      <button className="btn" onClick={() => handleReject(req.id)}
                        style={{ flex: 1, background: 'var(--danger)', color: 'white' }}>Xác nhận từ chối</button>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="btn" onClick={() => setRejectingId(req.id)}
                      style={{ flex: 1, border: '1px solid var(--danger)', color: 'var(--danger)' }}>
                      <X size={16} /> Từ chối
                    </button>
                    <button className="btn btn-primary" onClick={async () => {
                      const res = await approveRequest(req.id);
                      if (res && !res.success) {
                        alert(res.message);
                      }
                    }} style={{ flex: 1 }}>
                      <Check size={16} /> Giao hàng
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default ReviewRequests;
