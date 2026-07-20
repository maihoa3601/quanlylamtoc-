import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useData } from '../../hooks/useData';
import { formatVND, formatDate } from '../../utils/formatters';
import { Clock, CheckCircle, AlertTriangle } from 'lucide-react';

const MyReturns = () => {
  const { currentUser } = useAuth();
  const { getWorkerReturns } = useData();
  const myReturns = getWorkerReturns(currentUser.id).sort((a, b) => new Date(b.returnDate) - new Date(a.returnDate));

  return (
    <div className="container animate-slide-up">
      <h2 style={{ marginBottom: '16px' }}>📋 Phiếu Trả Của Tôi</h2>

      {myReturns.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
          <p className="text-muted">Chưa có phiếu trả nào</p>
        </div>
      ) : (
        myReturns.map(ret => (
          <div key={ret.id} className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div className="text-sm text-muted" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                {ret.status === 'pending' && <Clock size={14} style={{ color: 'var(--warning)' }} />}
                {ret.status === 'confirmed' && <CheckCircle size={14} style={{ color: 'var(--success)' }} />}
                {ret.status === 'disputed' && <AlertTriangle size={14} style={{ color: 'var(--danger)' }} />}
                {formatDate(ret.returnDate)}
              </div>
              <span className={`badge ${ret.status === 'pending' ? 'badge-pending' : ret.status === 'confirmed' ? 'badge-success' : 'badge-danger'}`}>
                {ret.status === 'pending' ? 'Chờ xác nhận' : ret.status === 'confirmed' ? 'Đã xác nhận' : 'Tranh chấp'}
              </span>
            </div>
            <div style={{ marginTop: '10px' }}>
              {ret.items.map((it, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', padding: '3px 0' }}>
                  <span>{it.hairTypeName} × {it.quantity}</span>
                  <span>{formatVND(it.subtotal)}</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, borderTop: '1px solid var(--border)', marginTop: '6px', paddingTop: '6px' }}>
                <span>Tổng</span>
                <span style={{ color: 'var(--success)' }}>{formatVND(ret.totalAmount)}</span>
              </div>
            </div>
            {ret.disputeNote && <p className="text-sm" style={{ marginTop: '8px', color: 'var(--danger)' }}>⚠️ {ret.disputeNote}</p>}
          </div>
        ))
      )}
    </div>
  );
};

export default MyReturns;
