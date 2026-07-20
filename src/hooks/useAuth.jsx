import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

const OWNER_PIN = '030601'; // Owner mật khẩu mặc định, đổi trong cài đặt

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Restore session from localStorage
    const saved = localStorage.getItem('auth_session');
    if (saved) {
      try {
        const { user, role } = JSON.parse(saved);
        setCurrentUser(user);
        setUserRole(role);
      } catch {}
    }
    setLoading(false);
  }, []);

  const loginAsOwner = (pin) => {
    const ownerPin = localStorage.getItem('owner_pin') || OWNER_PIN;
    if (pin !== ownerPin) return false;
    const user = { id: 'owner', displayName: 'Chủ' };
    setCurrentUser(user);
    setUserRole('owner');
    localStorage.setItem('auth_session', JSON.stringify({ user, role: 'owner' }));
    return true;
  };

  const loginAsWorker = (code, workers) => {
    const worker = workers.find(w => w.code === code);
    if (!worker) return null;
    if (worker.status === 'pending') return { error: 'Tài khoản đang chờ Chủ duyệt' };
    if (worker.status !== 'active') return { error: 'Tài khoản đã bị vô hiệu' };
    const user = { id: worker.id, displayName: worker.displayName, code: worker.code };
    setCurrentUser(user);
    setUserRole('worker');
    localStorage.setItem('auth_session', JSON.stringify({ user, role: 'worker' }));
    return worker;
  };

  const logout = () => {
    setCurrentUser(null);
    setUserRole(null);
    localStorage.removeItem('auth_session');
  };

  const value = { currentUser, userRole, loading, loginAsOwner, loginAsWorker, logout };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
