import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useData } from '../../hooks/useData';

const MyInventory = () => {
  const { currentUser } = useAuth();
  const { getWorkerDistributions } = useData();
  const myDists = getWorkerDistributions(currentUser.id).filter(d => d.status === 'holding' || d.status === 'partial');

  // Aggregate
  const agg = {};
  myDists.forEach(d => {
    d.items.forEach(it => {
      const remaining = it.quantityGiven - it.quantityReturned;
      if (remaining <= 0) return;
      if (!agg[it.hairTypeName]) agg[it.hairTypeName] = { given: 0, returned: 0, remaining: 0 };
      agg[it.hairTypeName].given += it.quantityGiven;
      agg[it.hairTypeName].returned += it.quantityReturned;
      agg[it.hairTypeName].remaining += remaining;
    });
  });

  const totalRemaining = Object.values(agg).reduce((s, v) => s + v.remaining, 0);

  return (
    <div className="container animate-slide-up">
      <h2 style={{ marginBottom: '16px' }}>📦 Hàng Đang Giữ</h2>

      <div className="card" style={{ textAlign: 'center', marginBottom: '16px', background: 'var(--warning-bg)', border: '1px solid rgba(245,158,11,0.3)' }}>
        <div className="text-sm text-muted">Tổng đang giữ</div>
        <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--warning-text)' }}>{totalRemaining}</div>
      </div>

      {Object.keys(agg).length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
          <p className="text-muted">Không có hàng đang giữ</p>
        </div>
      ) : (
        <div className="card">
          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr', padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
            <span>Loại</span>
            <span>Nhận</span>
            <span>Đã trả</span>
            <span>Còn</span>
          </div>
          {Object.entries(agg).map(([name, data]) => (
            <div key={name} style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr', padding: '10px 0', borderBottom: '1px solid var(--border)', fontSize: '0.9rem' }}>
              <span style={{ fontWeight: 600 }}>{name}</span>
              <span>{data.given}</span>
              <span>{data.returned}</span>
              <span style={{ fontWeight: 700, color: 'var(--warning)' }}>{data.remaining}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyInventory;
