import React from 'react';
import { useData } from '../../hooks/useData';
import { formatVND } from '../../utils/formatters';
import { Package, Users, Clock, AlertCircle, TrendingUp, ArrowDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

const Dashboard = () => {
  const { hairTypes, workers, requests, returns, distributions, batches, getInventory, pendingRequestsCount, pendingReturnsCount } = useData();
  const navigate = useNavigate();
  const inventory = getInventory();

  const totalStock = inventory.reduce((s, i) => s + i.available, 0);
  const totalGiven = inventory.reduce((s, i) => s + i.given, 0);
  const totalReceived = batches.reduce((s, b) => s + b.items.reduce((ss, it) => ss + it.quantity, 0), 0);

  // Tiền công chờ xác nhận
  const pendingWages = returns.filter(r => r.status === 'pending').reduce((s, r) => s + r.totalAmount, 0);
  // Tiền công đã xác nhận (chưa trả lương)
  const confirmedWages = returns.filter(r => r.status === 'confirmed').reduce((s, r) => s + r.totalAmount, 0);

  return (
    <div className="container animate-slide-up">
      <h2 style={{ marginBottom: '20px' }}>📊 Tổng Quan</h2>

      {/* Alert badges */}
      {(pendingRequestsCount > 0 || pendingReturnsCount > 0) && (
        <div className="alert-bar" onClick={() => navigate(pendingRequestsCount > 0 ? '/owner/requests' : '/owner/returns')}>
          <AlertCircle size={18} />
          <span>
            {pendingRequestsCount > 0 && `${pendingRequestsCount} yêu cầu chờ giao`}
            {pendingRequestsCount > 0 && pendingReturnsCount > 0 && ' • '}
            {pendingReturnsCount > 0 && `${pendingReturnsCount} phiếu trả chờ xác nhận`}
          </span>
        </div>
      )}

      {/* Stat cards */}
      <div className="stat-grid">
        <div className="stat-card" onClick={() => navigate('/owner/batches')}>
          <div className="stat-icon" style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
            <ArrowDown size={20} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{totalReceived}</span>
            <span className="stat-label">Tổng nhập</span>
          </div>
        </div>

        <div className="stat-card" onClick={() => navigate('/owner/distributions')}>
          <div className="stat-icon" style={{ background: 'var(--warning-bg)', color: 'var(--warning-text)' }}>
            <Package size={20} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{totalGiven}</span>
            <span className="stat-label">Đang giao</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--success-bg)', color: 'var(--success-text)' }}>
            <TrendingUp size={20} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{totalStock}</span>
            <span className="stat-label">Tồn kho</span>
          </div>
        </div>

        <div className="stat-card" onClick={() => navigate('/owner/workers')}>
          <div className="stat-icon" style={{ background: 'var(--danger-bg)', color: 'var(--danger-text)' }}>
            <Users size={20} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{workers.filter(w => w.status === 'active').length}</span>
            <span className="stat-label">Thợ</span>
          </div>
        </div>
      </div>

      {/* Wages summary */}
      <div className="card" style={{ marginTop: '8px' }}>
        <h3 style={{ fontSize: '1rem', marginBottom: '12px' }}>💰 Tiền Công</h3>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span className="text-muted">Chờ xác nhận</span>
          <span className="badge badge-pending">{formatVND(pendingWages)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span className="text-muted">Đã xác nhận (chưa trả)</span>
          <span className="badge badge-success">{formatVND(confirmedWages)}</span>
        </div>
      </div>

      {/* Inventory */}
      <div className="card" style={{ marginTop: '8px' }}>
        <h3 style={{ fontSize: '1rem', marginBottom: '12px' }}>📦 Tồn Kho Theo Loại</h3>
        {inventory.length === 0 ? (
          <p className="text-muted">Chưa có dữ liệu tồn kho</p>
        ) : (
          <div className="inv-table">
            <div className="inv-row inv-header">
              <span>Loại</span>
              <span>Nhập</span>
              <span>Giao</span>
              <span>Còn</span>
            </div>
            {inventory.map(it => (
              <div key={it.hairTypeId} className="inv-row">
                <span style={{ fontWeight: 600 }}>{it.hairTypeName}</span>
                <span>{it.total}</span>
                <span>{it.given}</span>
                <span style={{ color: it.available <= 0 ? 'var(--danger)' : 'var(--success)' }}>{it.available}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick access */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '16px', paddingBottom: '24px' }}>
        <button className="btn btn-primary" onClick={() => navigate('/owner/batches/new')}>
          + Nhập hàng
        </button>
        <button className="btn btn-outline" onClick={() => navigate('/owner/requests')}>
          Giao hàng {pendingRequestsCount > 0 && `(${pendingRequestsCount})`}
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
