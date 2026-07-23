import React, { useState } from 'react';
import { useData } from '../../hooks/useData';
import { formatDate } from '../../utils/formatters';
import { Calendar, Search } from 'lucide-react';

const Distributions = () => {
  const { distributions } = useData();
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];
  const [startDate, setStartDate] = useState(firstDay);
  const [endDate, setEndDate] = useState(lastDay);

  const sorted = [...distributions]
    .filter(d => filter === 'all' || d.status === filter)
    .filter(d => {
      const dDate = d.distributedDate.split('T')[0];
      return dDate >= startDate && dDate <= endDate;
    })
    .filter(d => {
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      return (d.workerName || '').toLowerCase().includes(term);
    })
    .sort((a, b) => new Date(b.distributedDate) - new Date(a.distributedDate));

  const statusMap = { holding: 'Đang giữ', partial: 'Trả 1 phần', completed: 'Hoàn thành' };
  const badgeMap = { holding: 'badge-pending', partial: 'badge-pending', completed: 'badge-success' };

  return (
    <div className="container animate-slide-up">
      <h2 style={{ marginBottom: '16px' }}>📤 Lịch Sử Giao Hàng</h2>

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

      <div style={{ position: 'relative', marginBottom: '16px' }}>
        <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        <input 
          className="form-input" 
          placeholder="Tìm theo tên thợ..." 
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          style={{ paddingLeft: '38px' }}
        />
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', overflowX: 'auto' }}>
        {[
          { key: 'all', label: 'Tất cả' },
          { key: 'holding', label: 'Đang giữ' },
          { key: 'partial', label: 'Trả 1 phần' },
          { key: 'completed', label: 'Hoàn thành' },
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

      {sorted.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
          <p className="text-muted">Chưa có phiếu giao nào</p>
        </div>
      ) : (
        sorted.map(d => (
          <div key={d.id} className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 600 }}>{d.workerName}</div>
                <div className="text-sm text-muted">{formatDate(d.distributedDate)}</div>
              </div>
              <span className={`badge ${badgeMap[d.status]}`}>{statusMap[d.status]}</span>
            </div>
            <div style={{ marginTop: '12px' }}>
              {d.items.map((it, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', padding: '4px 0' }}>
                  <span>{it.hairTypeName}</span>
                  <span>Giao: <strong>{it.quantityGiven}</strong> → Trả: <strong style={{ color: it.quantityReturned > 0 ? 'var(--success)' : 'var(--text-secondary)' }}>{it.quantityReturned}</strong></span>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default Distributions;
