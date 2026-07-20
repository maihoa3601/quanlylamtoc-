import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import { Package, FileText, ClipboardList, Banknote, LogOut, ChevronRight } from 'lucide-react';

const WorkerMenu = () => {
  const navigate = useNavigate();
  const { logout, currentUser } = useAuth();

  const items = [
    { icon: <ClipboardList size={20} />, label: 'Request của tôi', path: '/worker/my-requests', color: 'var(--primary)' },
    { icon: <FileText size={20} />, label: 'Phiếu trả của tôi', path: '/worker/my-returns', color: 'var(--warning)' },
    { icon: <Package size={20} />, label: 'Hàng đang giữ', path: '/worker/inventory', color: 'var(--success)' },
    { icon: <Banknote size={20} />, label: 'Lương của tôi', path: '/worker/payroll', color: '#8B5CF6' },
  ];

  return (
    <div className="container animate-slide-up">
      <h2 style={{ marginBottom: '4px' }}>☰ Menu</h2>
      <p className="text-muted text-sm" style={{ marginBottom: '16px' }}>{currentUser.displayName} • Mã: {currentUser.code}</p>

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

export default WorkerMenu;
