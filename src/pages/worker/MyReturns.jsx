import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useData } from '../../hooks/useData';
import { formatVND, formatDate } from '../../utils/formatters';
import { Clock, CheckCircle, AlertTriangle, Calendar, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MyReturns = () => {
  const { currentUser } = useAuth();
  const { getWorkerReturns } = useData();
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all');

  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];
  const [startDate, setStartDate] = useState(firstDay);
  const [endDate, setEndDate] = useState(lastDay);

  const myReturns = getWorkerReturns(currentUser.id)
    .filter(r => filter === 'all' || r.status === filter)
    .filter(r => {
      const rDate = r.returnDate.split('T')[0];
      return rDate >= startDate && rDate <= endDate;
    })
    .sort((a, b) => new Date(b.returnDate) - new Date(a.returnDate));

  return (
    <div className="container animate-slide-up">
      <h2 style={{ marginBottom: '16px' }}>📋 Phiếu Trả Của Tôi</h2>

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
          { key: 'pending', label: 'Chờ xác nhận' },
          { key: 'confirmed', label: 'Đã xác nhận' },
          { key: 'paid', label: 'Đã thanh toán' },
          { key: 'disputed', label: 'Tranh chấp' },
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
                {ret.status === 'paid' && <CheckCircle size={14} style={{ color: 'var(--success)' }} />}
                {ret.status === 'disputed' && <AlertTriangle size={14} style={{ color: 'var(--danger)' }} />}
                {formatDate(ret.returnDate)}
              </div>
              <span className={`badge ${ret.status === 'pending' ? 'badge-pending' : (ret.status === 'confirmed' || ret.status === 'paid') ? 'badge-success' : 'badge-danger'}`}>
                {ret.status === 'pending' ? 'Chờ xác nhận' : ret.status === 'confirmed' ? 'Đã xác nhận' : ret.status === 'paid' ? 'Đã thanh toán' : 'Tranh chấp'}
              </span>
            </div>
            <div style={{ marginTop: '10px' }}>
              {ret.items.map((it, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', padding: '3px 0' }}>
                  <span>{it.hairTypeName} × {it.quantity}</span>
                  <span>{formatVND(Number(it.subtotal) || 0)}</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, borderTop: '1px solid var(--border)', marginTop: '6px', paddingTop: '6px' }}>
                <span>Tổng</span>
                <span style={{ color: 'var(--success)' }}>{formatVND(Number(ret.totalAmount) || 0)}</span>
              </div>
            </div>
            {ret.disputeReason && <p className="text-sm" style={{ marginTop: '8px', color: 'var(--danger)' }}>⚠️ {ret.disputeReason}</p>}
            {ret.status === 'disputed' && (
              <button 
                className="btn btn-outline" 
                onClick={() => navigate('/worker/return')}
                style={{ marginTop: '12px', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                <RefreshCw size={14} /> Gửi lại phiếu trả
              </button>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default MyReturns;
