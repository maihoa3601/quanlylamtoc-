import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, PlusCircle, ArrowDownUp, Banknote, Menu } from 'lucide-react';
import './BottomNav.css';

const WorkerBottomNav = () => {
  return (
    <nav className="bottom-nav">
      <NavLink to="/worker/home" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
        <Home size={24} />
        <span className="nav-label">Trang chủ</span>
      </NavLink>
      
      <NavLink to="/worker/request" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
        <PlusCircle size={24} />
        <span className="nav-label">Xin hàng</span>
      </NavLink>
      
      <NavLink to="/worker/return" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
        <ArrowDownUp size={24} />
        <span className="nav-label">Trả hàng</span>
      </NavLink>

      <NavLink to="/worker/payroll" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
        <Banknote size={24} />
        <span className="nav-label">Lương</span>
      </NavLink>
      
      <NavLink to="/worker/menu" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
        <Menu size={24} />
        <span className="nav-label">Menu</span>
      </NavLink>
    </nav>
  );
};

export default WorkerBottomNav;
