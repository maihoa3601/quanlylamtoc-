import React, { useState } from 'react';
import { useData } from '../../hooks/useData';
import { Plus, X, Check, Phone, MapPin, UserX, UserCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Workers = () => {
  const { workers, addWorker, updateWorker, distributions, returns } = useData();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ displayName: '', phone: '', address: '' });
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.displayName || !form.phone) return;
    addWorker(form);
    setForm({ displayName: '', phone: '', address: '' });
    setShowForm(false);
  };

  const getWorkerStats = (wId) => {
    const wDists = distributions.filter(d => d.workerId === wId);
    const holding = wDists.filter(d => d.status === 'holding' || d.status === 'partial')
      .reduce((s, d) => s + d.items.reduce((ss, it) => ss + (it.quantityGiven - it.quantityReturned), 0), 0);
    const confirmedReturns = returns.filter(r => r.workerId === wId && r.status === 'confirmed');
    const totalEarned = confirmedReturns.reduce((s, r) => s + r.totalAmount, 0);
    return { holding, totalEarned };
  };

  return (
    <div className="container animate-slide-up">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h2>👷 Quản Lý Thợ</h2>
        <button className="btn-icon" onClick={() => setShowForm(!showForm)} style={{ background: 'var(--primary)', color: 'white' }}>
          {showForm ? <X size={20} /> : <Plus size={20} />}
        </button>
      </div>

      {showForm && (
        <form className="card" onSubmit={handleSubmit} style={{ marginBottom: '16px' }}>
          <div className="form-group">
            <label className="form-label">Tên thợ</label>
            <input className="form-input" placeholder="VD: Chị Lan" value={form.displayName} onChange={e => setForm({ ...form, displayName: e.target.value })} required />
          </div>
          <div className="form-group">
            <label className="form-label">Số điện thoại</label>
            <input className="form-input" type="tel" placeholder="0901234567" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} required />
          </div>
          <div className="form-group">
            <label className="form-label">Địa chỉ</label>
            <input className="form-input" placeholder="Xã, Huyện..." value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} />
          </div>
          <button type="submit" className="btn btn-primary"><Check size={18} /> Thêm thợ</button>
        </form>
      )}

      {workers.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
          <p className="text-muted">Chưa có thợ nào</p>
        </div>
      ) : (
        workers.map(w => {
          const stats = getWorkerStats(w.id);
          return (
            <div key={w.id} className="card" onClick={() => navigate(`/owner/workers/${w.id}`)} style={{ cursor: 'pointer' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {w.displayName}
                    <span style={{ background: 'var(--bg-surface-hover)', padding: '2px 8px', borderRadius: '6px', fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 700 }}>
                      {w.code}
                    </span>
                    <span className={`badge ${w.status === 'active' ? 'badge-success' : 'badge-danger'}`}>{w.status === 'active' ? 'Hoạt động' : 'Nghỉ'}</span>
                  </div>
                  <div className="text-sm text-muted" style={{ marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Phone size={12} /> {w.phone}
                  </div>
                  {w.address && (
                    <div className="text-sm text-muted" style={{ marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <MapPin size={12} /> {w.address}
                    </div>
                  )}
                </div>
                <button
                  className="btn-icon"
                  onClick={(e) => { e.stopPropagation(); updateWorker(w.id, { status: w.status === 'active' ? 'inactive' : 'active' }); }}
                  style={{ color: w.status === 'active' ? 'var(--danger)' : 'var(--success)' }}
                  title={w.status === 'active' ? 'Vô hiệu hóa' : 'Kích hoạt'}
                >
                  {w.status === 'active' ? <UserX size={18} /> : <UserCheck size={18} />}
                </button>
              </div>
              <div style={{ display: 'flex', gap: '16px', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--border)' }}>
                <div className="text-sm">
                  <span className="text-muted">Đang giữ: </span>
                  <span style={{ fontWeight: 600, color: stats.holding > 0 ? 'var(--warning)' : 'var(--text-secondary)' }}>{stats.holding}</span>
                </div>
                <div className="text-sm">
                  <span className="text-muted">Tổng thu nhập: </span>
                  <span style={{ fontWeight: 600, color: 'var(--success)' }}>{new Intl.NumberFormat('vi-VN').format(stats.totalEarned)}đ</span>
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};

export default Workers;
