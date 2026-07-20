import React from 'react';
import { Outlet } from 'react-router-dom';
import OwnerBottomNav from './OwnerBottomNav';
import WorkerBottomNav from './WorkerBottomNav';
import { useAuth } from '../hooks/useAuth';
import { LogOut } from 'lucide-react';

const Layout = ({ userRole }) => {
  const { logout, currentUser } = useAuth();
  
  return (
    <div className="app-container">
      <header className="app-header">
        <h1 style={{fontSize: '1.25rem', margin: 0}}>
          {userRole === 'owner' ? 'Quản Lý (Chủ)' : 'Hệ Thống Thợ'}
        </h1>
        <button className="btn-icon" onClick={logout} title="Đăng xuất">
          <LogOut size={20} />
        </button>
      </header>

      <main className="main-content">
        <Outlet />
      </main>
      
      {/* Render appropriate navigation based on role */}
      {userRole === 'owner' ? <OwnerBottomNav /> : <WorkerBottomNav />}
    </div>
  );
};

export default Layout;
