import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, CheckSquare, PackagePlus, FileDown, Menu } from 'lucide-react';
import { useData } from '../hooks/useData';
import './BottomNav.css';

const OwnerBottomNav = () => {
  const { pendingRequestsCount, pendingReturnsCount } = useData();
  const totalPending = pendingRequestsCount + pendingReturnsCount;

  return (
    <nav className="bottom-nav">
      <NavLink to="/owner/dashboard" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
        <LayoutDashboard size={24} />
        <span className="nav-label">Tổng quan</span>
      </NavLink>
      
      <NavLink to="/owner/requests" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
        <div className="nav-icon-wrapper">
          <CheckSquare size={24} />
          {pendingRequestsCount > 0 && <span className="nav-badge">{pendingRequestsCount}</span>}
        </div>
        <span className="nav-label">Duyệt</span>
      </NavLink>
      
      <NavLink to="/owner/batches" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
        <PackagePlus size={24} />
        <span className="nav-label">Nhập hàng</span>
      </NavLink>

      <NavLink to="/owner/returns" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
        <div className="nav-icon-wrapper">
          <FileDown size={24} />
          {pendingReturnsCount > 0 && <span className="nav-badge">{pendingReturnsCount}</span>}
        </div>
        <span className="nav-label">Trả hàng</span>
      </NavLink>
      
      <NavLink to="/owner/menu" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
        <Menu size={24} />
        <span className="nav-label">Menu</span>
      </NavLink>
    </nav>
  );
};

export default OwnerBottomNav;
