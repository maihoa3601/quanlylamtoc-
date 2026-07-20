import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useData } from '../../hooks/useData';
import { formatVND } from '../../utils/formatters';
import { Package, Clock, CheckCircle, Banknote } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const WorkerHome = () => {
  const { currentUser } = useAuth();
  const { getWorkerDistributions, getWorkerRequests, getWorkerReturns } = useData();
  const navigate = useNavigate();

  const myDists = getWorkerDistributions(currentUser.id);
  const myRequests = getWorkerRequests(currentUser.id);
  const myReturns = getWorkerReturns(currentUser.id);

  const holdingItems = myDists.filter(d => d.status === 'holding' || d.status === 'partial');
  const totalHolding = holdingItems.reduce((s, d) => s + d.items.reduce((ss, it) => ss + (it.quantityGiven - it.quantityReturned), 0), 0);
  const pendingRequests = myRequests.filter(r => r.status === 'pending').length;
  const pendingReturns = myReturns.filter(r => r.status === 'pending').length;
  const confirmedEarnings = myReturns.filter(r => r.status === 'confirmed').reduce((s, r) => s + r.totalAmount, 0);

  return (
    <div className="container animate-slide-up">
      <h2 style={{ marginBottom: '4px' }}>Xin chào, {currentUser.displayName}! 👋</h2>
      <p className="text-muted" style={{ marginBottom: '20px' }}>Mã thợ: <strong>{currentUser.code}</strong></p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
        <div className="card" style={{ textAlign: 'center' }} onClick={() => navigate('/worker/inventory')}>
          <Package size={24} style={{ color: 'var(--warning)', marginBottom: '8px' }} />
          <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{totalHolding}</div>
          <div className="text-xs text-muted">Đang giữ</div>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <Banknote size={24} style={{ color: 'var(--success)', marginBottom: '8px' }} />
          <div style={{ fontSize: '1.2rem', fontWeight: 700 }}>{formatVND(confirmedEarnings)}</div>
          <div className="text-xs text-muted">Đã nhận</div>
        </div>
      </div>

      {pendingRequests > 0 && (
        <div className="card" onClick={() => navigate('/worker/my-requests')}
          style={{ background: 'var(--warning-bg)', border: '1px solid rgba(245,158,11,0.3)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Clock size={18} style={{ color: 'var(--warning)' }} />
          <span style={{ color: 'var(--warning-text)' }}>{pendingRequests} request đang chờ duyệt</span>
        </div>
      )}

      {pendingReturns > 0 && (
        <div className="card" onClick={() => navigate('/worker/my-returns')}
          style={{ background: 'var(--primary-light)', border: '1px solid rgba(99,102,241,0.3)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Clock size={18} style={{ color: 'var(--primary)' }} />
          <span>{pendingReturns} phiếu trả chờ xác nhận</span>
        </div>
      )}

      {/* Hàng đang giữ */}
      <h3 style={{ marginTop: '20px', marginBottom: '12px', fontSize: '1rem' }}>📦 Hàng đang giữ</h3>
      {holdingItems.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '32px' }}>
          <p className="text-muted">Không có hàng đang giữ</p>
        </div>
      ) : (
        holdingItems.map(d => (
          <div key={d.id} className="card">
            {d.items.map((it, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: '0.9rem' }}>
                <span style={{ fontWeight: 500 }}>{it.hairTypeName}</span>
                <span>Còn: <strong style={{ color: 'var(--warning)' }}>{it.quantityGiven - it.quantityReturned}</strong> / {it.quantityGiven}</span>
              </div>
            ))}
          </div>
        ))
      )}

      <div style={{ marginTop: '16px', paddingBottom: '24px' }}>
        <button className="btn btn-primary" onClick={() => navigate('/worker/request')} style={{ marginBottom: '8px' }}>
          + Xin lấy hàng
        </button>
        <button className="btn btn-outline" onClick={() => navigate('/worker/return')}>
          Báo trả hàng
        </button>
      </div>
    </div>
  );
};

export default WorkerHome;
