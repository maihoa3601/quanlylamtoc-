import React, { useState } from 'react';
import { useData } from '../../hooks/useData';
import { formatDate } from '../../utils/formatters';
import { Check, X, Clock, CheckCircle, AlertTriangle, Calendar } from 'lucide-react';

const Returns = () => {
  const { returns, confirmReturn, disputeReturn } = useData();
  const [filter, setFilter] = useState('pending');
  const [disputingId, setDisputingId] = useState(null);
  const [disputeNote, setDisputeNote] = useState('');
  
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];
  const [startDate, setStartDate] = useState(firstDay);
  const [endDate, setEndDate] = useState(lastDay);

  const filtered = returns
    .filter(r => filter === 'all' || r.status === filter)
    .filter(r => {
      const rDate = r.returnDate.split('T')[0];
      return rDate >= startDate && rDate <= endDate;
    })
    .sort((a, b) => new Date(b.returnDate) - new Date(a.returnDate));

  const handleDispute = (id) => {
    disputeReturn(id, disputeNote || 'Số lượng không khớp');
    setDisputingId(null);
    setDisputeNote('');
  };

  return (
    <div className="container animate-slide-up">
      <h2 style={{ marginBottom: '16px' }}>📥 Xác Nhận Trả Hàng</h2>

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
          { key: 'pending', label: `Chờ (${returns.filter(r => r.status === 'pending').length})` },
          { key: 'confirmed', label: 'Đã xác nhận' },
          { key: 'paid', label: 'Đã thanh toán' },
          { key: 'disputed', label: 'Tranh chấp' },
          { key: 'all', label: 'Tất cả' },
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

      {filtered.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
          <p className="text-muted">Không có phiếu trả nào</p>
        </div>
      ) : (
        filtered.map(ret => (
          <div key={ret.id} className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {ret.status === 'pending' && <Clock size={16} style={{ color: 'var(--warning)' }} />}
                  {ret.status === 'confirmed' && <CheckCircle size={16} style={{ color: 'var(--success)' }} />}
                  {ret.status === 'paid' && <CheckCircle size={16} style={{ color: 'var(--success)' }} />}
                  {ret.status === 'disputed' && <AlertTriangle size={16} style={{ color: 'var(--danger)' }} />}
                  {ret.workerName || 'Không rõ'}
                </div>
                <div className="text-sm text-muted" style={{ marginTop: '4px' }}>
                  {formatDate(ret.returnDate)}
                </div>
              </div>
              <span className={`badge ${ret.status === 'pending' ? 'badge-pending' : (ret.status === 'confirmed' || ret.status === 'paid') ? 'badge-success' : 'badge-danger'}`}>
                {ret.status === 'pending' ? 'Chờ xác nhận' : ret.status === 'confirmed' ? 'Đã xác nhận' : ret.status === 'paid' ? 'Đã thanh toán' : 'Tranh chấp'}
              </span>
            </div>

            <div style={{ marginTop: '12px' }}>
              {ret.items?.map((it, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '0.9rem' }}>
                  <span>{it.hairTypeName} × {it.quantity}</span>
                  <span style={{ fontWeight: 600 }}>{new Intl.NumberFormat('vi-VN').format(Number(it.subtotal) || 0)}đ</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderTop: '1px solid var(--border)', marginTop: '4px', fontWeight: 700 }}>
                <span>Tổng tiền công</span>
                <span style={{ color: 'var(--success)' }}>{new Intl.NumberFormat('vi-VN').format(Number(ret.totalAmount) || 0)}đ</span>
              </div>
            </div>

            {ret.disputeReason && <div className="text-sm" style={{ marginTop: '8px', color: 'var(--danger)' }}>⚠️ {ret.disputeReason}</div>}

            {ret.status === 'pending' && (
              <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--border)' }}>
                {disputingId === ret.id ? (
                  <div>
                    <input className="form-input" placeholder="Ghi chú tranh chấp..." value={disputeNote}
                      onChange={e => setDisputeNote(e.target.value)} style={{ marginBottom: '8px' }} />
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button className="btn btn-outline" onClick={() => setDisputingId(null)} style={{ flex: 1 }}>Hủy</button>
                      <button className="btn" onClick={() => handleDispute(ret.id)}
                        style={{ flex: 1, background: 'var(--danger)', color: 'white' }}>Gửi tranh chấp</button>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="btn" onClick={() => setDisputingId(ret.id)}
                      style={{ flex: 1, border: '1px solid var(--danger)', color: 'var(--danger)' }}>
                      <AlertTriangle size={16} /> Tranh chấp
                    </button>
                    <button className="btn btn-primary" onClick={async () => {
                      const res = await confirmReturn(ret.id);
                      if (res && !res.success) alert(res.message);
                    }} style={{ flex: 1 }}>
                      <Check size={16} /> Xác nhận
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

export default Returns;
