import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useData } from '../../hooks/useData';
import { formatVND } from '../../utils/formatters';
import { Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SubmitReturn = () => {
  const { currentUser } = useAuth();
  const { getWorkerDistributions, hairTypes, submitReturn } = useData();
  const navigate = useNavigate();
  const [selectedDist, setSelectedDist] = useState(null);
  const [returnQtys, setReturnQtys] = useState({});
  const [success, setSuccess] = useState(false);

  const myDists = getWorkerDistributions(currentUser.id).filter(d => d.status === 'holding' || d.status === 'partial');

  const updateQty = (hairTypeId, value) => {
    setReturnQtys(prev => ({ ...prev, [hairTypeId]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedDist) return;
    const items = selectedDist.items
      .filter(it => Number(returnQtys[it.hairTypeId]) > 0)
      .map(it => {
        const qty = Number(returnQtys[it.hairTypeId]);
        const ht = hairTypes.find(h => h.id === it.hairTypeId);
        const unitPrice = ht ? ht.unitPrice : 0;
        return { hairTypeId: it.hairTypeId, hairTypeName: it.hairTypeName, quantity: qty, unitPrice, subtotal: qty * unitPrice };
      });
    if (items.length === 0) return;

    submitReturn({
      workerId: currentUser.id,
      workerName: currentUser.displayName,
      distributionId: selectedDist.id,
      items,
      totalAmount: items.reduce((s, it) => s + it.subtotal, 0),
    });
    setSuccess(true);
    setTimeout(() => navigate('/worker/my-returns'), 1500);
  };

  if (success) {
    return (
      <div className="container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--success-bg)', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
          <Check size={32} />
        </div>
        <h2>Đã gửi phiếu trả!</h2>
        <p className="text-muted">Chờ chủ xác nhận...</p>
      </div>
    );
  }

  return (
    <div className="container animate-slide-up">
      <h2 style={{ marginBottom: '16px' }}>📥 Báo Trả Hàng</h2>

      {myDists.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
          <p className="text-muted">Không có hàng đang giữ để trả</p>
        </div>
      ) : !selectedDist ? (
        <>
          <p className="text-muted" style={{ marginBottom: '12px' }}>Chọn phiếu giao để trả:</p>
          {myDists.map(d => (
            <div key={d.id} className="card" onClick={() => { setSelectedDist(d); setReturnQtys({}); }}
              style={{ cursor: 'pointer' }}>
              <div style={{ fontWeight: 600, marginBottom: '8px' }}>Phiếu giao #{d.id.slice(-5)}</div>
              {d.items.map((it, i) => (
                <div key={i} className="text-sm" style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>{it.hairTypeName}</span>
                  <span>Còn: {it.quantityGiven - it.quantityReturned}</span>
                </div>
              ))}
            </div>
          ))}
        </>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="card" style={{ marginBottom: '16px', background: 'var(--bg-surface-hover)' }}>
            <div className="text-sm text-muted" style={{ marginBottom: '8px' }}>Phiếu giao #{selectedDist.id.slice(-5)}</div>
            <button type="button" className="text-sm" onClick={() => setSelectedDist(null)}
              style={{ color: 'var(--primary)', background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}>← Chọn phiếu khác</button>
          </div>

          {selectedDist.items.map((it, i) => {
            const remaining = it.quantityGiven - it.quantityReturned;
            const qty = Number(returnQtys[it.hairTypeId]) || 0;
            const ht = hairTypes.find(h => h.id === it.hairTypeId);
            const unitPrice = ht ? ht.unitPrice : 0;

            return (
              <div key={i} className="card" style={{ marginBottom: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontWeight: 600 }}>{it.hairTypeName}</span>
                  <span className="text-sm text-muted">Còn: {remaining}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <input className="form-input" type="number" min="0" max={remaining}
                    placeholder="0" value={returnQtys[it.hairTypeId] || ''}
                    onChange={e => updateQty(it.hairTypeId, e.target.value)} style={{ flex: 1 }} />
                  <span className="text-sm" style={{ color: 'var(--success)', whiteSpace: 'nowrap', fontWeight: 600 }}>
                    = {formatVND(qty * unitPrice)}
                  </span>
                </div>
              </div>
            );
          })}

          {/* Total */}
          <div className="card" style={{ background: 'var(--success-bg)', border: '1px solid rgba(16,185,129,0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '1.1rem' }}>
              <span>Tổng tiền công</span>
              <span style={{ color: 'var(--success)' }}>
                {formatVND(selectedDist.items.reduce((s, it) => {
                  const qty = Number(returnQtys[it.hairTypeId]) || 0;
                  const ht = hairTypes.find(h => h.id === it.hairTypeId);
                  return s + qty * (ht ? ht.unitPrice : 0);
                }, 0))}
              </span>
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ marginTop: '16px' }}>
            Gửi phiếu trả
          </button>
        </form>
      )}
    </div>
  );
};

export default SubmitReturn;
