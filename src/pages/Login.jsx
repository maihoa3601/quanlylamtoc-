import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useData } from '../hooks/useData';
import { KeyRound, User, ChevronRight } from 'lucide-react';

const Login = () => {
  const { loginAsOwner, loginAsWorker } = useAuth();
  const { workers } = useData();
  const [mode, setMode] = useState(null); // null | 'owner' | 'worker'
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  const handleOwnerLogin = (e) => {
    e.preventDefault();
    if (!code.trim()) return;
    const ok = loginAsOwner(code.trim());
    if (!ok) { setError('Sai mật khẩu'); return; }
  };

  const handleWorkerLogin = (e) => {
    e.preventDefault();
    if (!code.trim()) return;
    const w = loginAsWorker(code.trim(), workers);
    if (!w) { setError('Mã không hợp lệ hoặc tài khoản đã bị vô hiệu'); return; }
  };

  return (
    <div className="container" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <div style={{ fontSize: '3rem', marginBottom: '8px' }}>✂️</div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Quản Lý Tóc</h1>
        <p className="text-muted">Hệ thống phân phối & gia công</p>
      </div>

      {!mode ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <button className="card" onClick={() => { setMode('owner'); setCode(''); setError(''); }}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <KeyRound size={24} />
              </div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontWeight: 600, fontSize: '1.05rem' }}>Chủ (Owner)</div>
                <div className="text-sm text-muted">Đăng nhập bằng mật khẩu</div>
              </div>
            </div>
            <ChevronRight size={20} className="text-muted" />
          </button>

          <button className="card" onClick={() => { setMode('worker'); setCode(''); setError(''); }}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--success-bg)', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <User size={24} />
              </div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontWeight: 600, fontSize: '1.05rem' }}>Thợ (Worker)</div>
                <div className="text-sm text-muted">Vào bằng mã thợ</div>
              </div>
            </div>
            <ChevronRight size={20} className="text-muted" />
          </button>
        </div>
      ) : (
        <div className="card" style={{ padding: '24px' }}>
          <h2 style={{ fontSize: '1.2rem', marginBottom: '16px' }}>
            {mode === 'owner' ? '🔑 Nhập mật khẩu' : '👷 Nhập mã thợ'}
          </h2>

          <form onSubmit={mode === 'owner' ? handleOwnerLogin : handleWorkerLogin}>
            <div className="form-group">
              <input
                className="form-input"
                type={mode === 'owner' ? 'password' : 'text'}
                placeholder={mode === 'owner' ? 'Mật khẩu...' : 'Mã thợ (VD: TH01)'}
                value={code}
                onChange={(e) => { setCode(e.target.value); setError(''); }}
                autoFocus
                style={{ fontSize: '1.2rem', textAlign: 'center', letterSpacing: mode === 'owner' ? '4px' : '2px' }}
              />
            </div>

            {error && <div style={{ color: 'var(--danger)', fontSize: '0.875rem', marginBottom: '12px', textAlign: 'center' }}>{error}</div>}

            <button type="submit" className="btn btn-primary" style={{ marginBottom: '12px' }}>
              Vào
            </button>
            <button type="button" className="btn btn-outline" onClick={() => { setMode(null); setError(''); setCode(''); }}>
              ← Quay lại
            </button>
          </form>

          {mode === 'owner' && (
            <div className="text-xs text-muted" style={{ marginTop: '16px', textAlign: 'center' }}>
              Mật khẩu mặc định: <strong>1234</strong>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Login;
