import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useData } from '../../hooks/useData';
import { formatVND } from '../../utils/formatters';
import { Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SubmitReturn = () => {
  const { currentUser } = useAuth();
  const { getWorkerDistributions, getWorkerReturns, hairTypes, submitReturn } = useData();
  const navigate = useNavigate();
  const [selectedDist, setSelectedDist] = useState(null);
  const [returnQtys, setReturnQtys] = useState({});
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const myDists = getWorkerDistributions(currentUser.id).filter(d => d.status === 'holding' || d.status === 'partial');
  const pendingReturns = getWorkerReturns(currentUser.id).filter(r => r.status === 'pending');

  const updateQty = (hairTypeId, value) => {
    setReturnQtys(prev => ({ ...prev, [hairTypeId]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDist) return;
    setError('');

    let hasError = false;
    const items = selectedDist.items
      .filter(it => Number(returnQtys[it.hairTypeId]) > 0)
      .map(it => {
        const qty = Number(returnQtys[it.hairTypeId]);
        
        // Calculate pending quantity for this item
        const pendingQty = pendingReturns
          .filter(r => r.distributionId === selectedDist.id)
          .reduce((sum, r) => {
            const pItem = r.items.find(ri => ri.hairTypeId === it.hairTypeId);
            return sum + (pItem ? Number(pItem.quantity) : 0);
          }, 0);
          
        const remaining = it.quantityGiven - it.quantityReturned - pendingQty;
        if (qty > remaining) {
          hasError = true;
          setError(`Số lượng trả cho "${it.hairTypeName}" vượt quá số lượng đang giữ (${remaining})`);
        }
        const ht = hairTypes.find(h => h.id === it.hairTypeId);
        const unitPrice = ht ? ht.unitPrice : 0;
        return { hairTypeId: it.hairTypeId, hairTypeName: it.hairTypeName, quantity: qty, unitPrice, subtotal: qty * unitPrice };
      });
      
    if (hasError) return;
    if (items.length === 0) {
      setError('Vui lòng nhập số lượng hợp lệ cho ít nhất 1 mặt hàng');
      return;
    }

    try {
      await submitReturn({
        workerId: currentUser.id,
        workerName: currentUser.displayName,
        distributionId: selectedDist.id,
        items,
        totalAmount: items.reduce((s, it) => s + it.subtotal, 0),
      });
      setSuccess(true);
      setTimeout(() => navigate('/worker/my-returns'), 1500);
    } catch (err) {
      setError('Lỗi gửi phiếu trả: ' + err.message);
    }
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
              {d.items.map((it, i) => {
                const pendingQty = pendingReturns
                  .filter(r => r.distributionId === d.id)
                  .reduce((sum, r) => {
                    const pItem = r.items.find(ri => ri.hairTypeId === it.hairTypeId);
                    return sum + (pItem ? Number(pItem.quantity) : 0);
                  }, 0);
                const remaining = it.quantityGiven - it.quantityReturned - pendingQty;
                if (remaining <= 0) return null;
                return (
                  <div key={i} className="text-sm" style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>{it.hairTypeName}</span>
                    <span>Còn: {remaining}</span>
                  </div>
                );
              })}
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
            const pendingQty = pendingReturns
              .filter(r => r.distributionId === selectedDist.id)
              .reduce((sum, r) => {
                const pItem = r.items.find(ri => ri.hairTypeId === it.hairTypeId);
                return sum + (pItem ? Number(pItem.quantity) : 0);
              }, 0);
            const remaining = it.quantityGiven - it.quantityReturned - pendingQty;
            if (remaining <= 0) return null;
            
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

          {error && <div className="card" style={{ marginTop: '16px', background: 'var(--danger-bg)', color: 'var(--danger)', border: '1px solid rgba(239,68,68,0.3)', padding: '12px' }}>{error}</div>}

          <button type="submit" className="btn btn-primary" style={{ marginTop: '16px' }}>
            Gửi phiếu trả
          </button>
        </form>
      )}
    </div>
  );
};

export default SubmitReturn;
