import React from 'react';
import { useData } from '../../hooks/useData';
import { formatDate } from '../../utils/formatters';

const Distributions = () => {
  const { distributions } = useData();

  const sorted = [...distributions].sort((a, b) => new Date(b.distributedDate) - new Date(a.distributedDate));

  const statusMap = { holding: 'Đang giữ', partial: 'Trả 1 phần', completed: 'Hoàn thành' };
  const badgeMap = { holding: 'badge-pending', partial: 'badge-pending', completed: 'badge-success' };

  return (
    <div className="container animate-slide-up">
      <h2 style={{ marginBottom: '16px' }}>📤 Lịch Sử Giao Hàng</h2>

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
