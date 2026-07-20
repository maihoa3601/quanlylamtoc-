import React from 'react';
import { useData } from '../../hooks/useData';
import { formatVND } from '../../utils/formatters';

const Statistics = () => {
  const { batches, returns, distributions, workers, hairTypes } = useData();

  const totalImportCost = batches.reduce((s, b) => 
    s + b.items.reduce((ss, it) => ss + (it.quantity * it.unitPrice), 0)
  , 0);

  const totalPaidWages = returns
    .filter(r => r.status === 'confirmed')
    .reduce((s, r) => s + r.totalAmount, 0);

  // Thống kê theo loại tóc (đã nhập, đã giao, đã hoàn thành)
  const hairStats = hairTypes.map(ht => {
    let imported = 0;
    batches.forEach(b => b.items.forEach(it => { if(it.hairTypeId === ht.id) imported += it.quantity; }));

    let given = 0;
    distributions.forEach(d => d.items.forEach(it => { if(it.hairTypeId === ht.id) given += it.quantityGiven; }));

    let returned = 0;
    returns.filter(r => r.status === 'confirmed').forEach(r => {
      r.items.forEach(it => { if(it.hairTypeId === ht.id) returned += it.quantity; });
    });

    return { ...ht, imported, given, returned };
  });

  return (
    <div className="container animate-slide-up">
      <h2 style={{ marginBottom: '16px' }}>📈 Thống Kê</h2>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
        <div className="card" style={{ textAlign: 'center' }}>
          <div className="text-sm text-muted">Tổng chi phí nhập</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--danger)' }}>{formatVND(totalImportCost)}</div>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <div className="text-sm text-muted">Tổng tiền công</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--success)' }}>{formatVND(totalPaidWages)}</div>
        </div>
      </div>

      <div className="card">
        <h3 style={{ fontSize: '1rem', marginBottom: '12px' }}>Hoạt Động Theo Loại Tóc</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr 1fr', padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          <span>Loại</span>
          <span>Nhập</span>
          <span>Giao</span>
          <span>Thành phẩm</span>
        </div>
        {hairStats.map(s => (
          <div key={s.id} style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr 1fr', padding: '10px 0', borderBottom: '1px solid var(--border)', fontSize: '0.9rem' }}>
            <span style={{ fontWeight: 600 }}>{s.name}</span>
            <span>{s.imported}</span>
            <span>{s.given}</span>
            <span style={{ color: 'var(--success)', fontWeight: 600 }}>{s.returned}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Statistics;
