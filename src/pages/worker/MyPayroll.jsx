import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useData } from '../../hooks/useData';
import { formatVND } from '../../utils/formatters';

const MyPayroll = () => {
  const { currentUser } = useAuth();
  const { getWorkerReturns } = useData();
  const confirmed = getWorkerReturns(currentUser.id).filter(r => r.status === 'confirmed' || r.status === 'paid');

  const totalEarned = confirmed.reduce((s, r) => s + (Number(r.totalAmount) || 0), 0);
  const paidAmount = confirmed.filter(r => r.status === 'paid').reduce((s, r) => s + (Number(r.totalAmount) || 0), 0);
  const unpaidAmount = totalEarned - paidAmount;

  // Group by hair type
  const byType = {};
  confirmed.forEach(r => {
    r.items.forEach(it => {
      if (!byType[it.hairTypeName]) byType[it.hairTypeName] = { qty: 0, total: 0, unitPrice: it.unitPrice || 0 };
      byType[it.hairTypeName].qty += (Number(it.quantity) || 0);
      byType[it.hairTypeName].total += (Number(it.subtotal) || 0);
    });
  });

  return (
    <div className="container animate-slide-up">
      <h2 style={{ marginBottom: '16px' }}>💰 Lương Của Tôi</h2>

      <div className="card" style={{ textAlign: 'center', background: 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(99,102,241,0.15))' }}>
        <div className="text-sm text-muted" style={{ marginBottom: '4px' }}>Tổng thu nhập tích lũy</div>
        <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--success)' }}>{formatVND(totalEarned)}</div>
        
        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '12px' }}>
          <div>
            <div className="text-xs text-muted">Đã nhận</div>
            <div style={{ fontWeight: 600, color: 'var(--success)' }}>{formatVND(paidAmount)}</div>
          </div>
          <div>
            <div className="text-xs text-muted">Chủ còn nợ</div>
            <div style={{ fontWeight: 600, color: unpaidAmount > 0 ? 'var(--danger)' : 'var(--text-primary)' }}>{formatVND(unpaidAmount)}</div>
          </div>
        </div>
      </div>

      {Object.keys(byType).length > 0 && (
        <div className="card" style={{ marginTop: '12px' }}>
          <h3 style={{ fontSize: '1rem', marginBottom: '12px' }}>Chi tiết theo loại tóc</h3>
          {Object.entries(byType).map(([name, data]) => (
            <div key={name} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: '0.9rem' }}>
              <div>
                <span style={{ fontWeight: 600 }}>{name}</span>
                <span className="text-muted text-sm"> × {data.qty} ({formatVND(data.unitPrice)}/cái)</span>
              </div>
              <span style={{ fontWeight: 600, color: 'var(--success)' }}>{formatVND(data.total)}</span>
            </div>
          ))}
        </div>
      )}

      {confirmed.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: '40px', marginTop: '12px' }}>
          <p className="text-muted">Chưa có thu nhập nào được xác nhận</p>
        </div>
      )}
    </div>
  );
};

export default MyPayroll;
