import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useData } from '../../hooks/useData';
import { timeAgo } from '../../utils/formatters';
import { Clock, CheckCircle, XCircle } from 'lucide-react';

const MyRequests = () => {
  const { currentUser } = useAuth();
  const { getWorkerRequests } = useData();
  const myRequests = getWorkerRequests(currentUser.id).sort((a, b) => new Date(b.requestDate) - new Date(a.requestDate));

  return (
    <div className="container animate-slide-up">
      <h2 style={{ marginBottom: '16px' }}>📋 Request Của Tôi</h2>

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
