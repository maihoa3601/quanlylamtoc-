import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useData } from '../../hooks/useData';
import { useTheme } from '../../hooks/useTheme';
import { Scissors, Users, Package, FileText, BarChart3, RefreshCw, LogOut, ChevronRight } from 'lucide-react';

const OwnerMenu = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { pendingRequestsCount, pendingReturnsCount } = useData();

  const items = [
    { icon: <Scissors size={20} />, label: 'Loại tóc & Giá', path: '/owner/hair-types', color: 'var(--primary)' },
    { icon: <Users size={20} />, label: 'Quản lý thợ', path: '/owner/workers', color: 'var(--success)' },
    { icon: <Package size={20} />, label: 'Lịch sử giao hàng', path: '/owner/distributions', color: 'var(--warning)' },
    { icon: <FileText size={20} />, label: 'Tính lương', path: '/owner/payroll', color: '#8B5CF6' },
    { icon: <BarChart3 size={20} />, label: 'Thống kê', path: '/owner/statistics', color: '#EC4899' },
  ];

  return (
    <div className="container animate-slide-up">
      <h2 style={{ marginBottom: '16px' }}>☰ Menu</h2>

      {items.map((it, i) => (
        <div key={i} className="card" onClick={() => navigate(it.path)}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', padding: '14px 16px', marginBottom: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: `${it.color}20`, color: it.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {it.icon}
            </div>
            <span style={{ fontWeight: 500 }}>{it.label}</span>
          </div>
          <ChevronRight size={18} className="text-muted" />
        </div>
      ))}

      <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <button className="btn" onClick={logout} style={{ color: 'var(--danger)', border: '1px solid var(--danger)' }}>
          <LogOut size={16} /> Đăng xuất
        </button>
      </div>
    </div>
  );
};

export default OwnerMenu;
