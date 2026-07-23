import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useData } from '../hooks/useData';
import { KeyRound, User, UserPlus, ChevronRight, Trash2 } from 'lucide-react';
import { db } from '../firebase';
import { collection, getDocs, writeBatch } from 'firebase/firestore';

const Login = () => {
  const { loginAsOwner, loginAsWorker } = useAuth();
  const { workers, registerWorker } = useData();
  const [mode, setMode] = useState(null); // null | 'owner' | 'worker' | 'register'
  const [code, setCode] = useState('');
  const [pin, setPin] = useState('');
  const [registerForm, setRegisterForm] = useState({ displayName: '', phone: '', pin: '' });
  const [registerSuccess, setRegisterSuccess] = useState('');
  const [error, setError] = useState('');

  const handleOwnerLogin = async (e) => {
    e.preventDefault();
    if (!code.trim()) return;
    const ok = await loginAsOwner(code.trim());
    if (!ok) { setError('Sai mật khẩu'); return; }
  };

  const handleWorkerLogin = async (e) => {
    e.preventDefault();
    if (!code.trim() || !pin.trim()) return;
    const w = await loginAsWorker(code.trim().toUpperCase(), pin.trim());
    if (w && w.error) { setError(w.error); return; }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!registerForm.displayName || !registerForm.phone || !registerForm.pin) return;
    if (registerForm.pin.length < 6) {
      setError('Mã PIN phải từ 6 ký tự trở lên');
      return;
    }
    const res = await registerWorker({ displayName: registerForm.displayName, phone: registerForm.phone, pin: registerForm.pin });
    if (res?.error) {
      setError(res.error);
      return;
    }
    setRegisterSuccess(res);
  };

  const clearDatabase = async () => {
    if (!window.confirm("CẢNH BÁO: Hành động này sẽ xóa toàn bộ dữ liệu (trừ cấu hình tóc chuẩn). Bạn có chắc không?")) return;
    try {
      const collections = ['workers', 'batches', 'requests', 'distributions', 'returns', 'payrolls', 'inventory'];
      for (const colName of collections) {
        const colRef = collection(db, colName);
        const snapshot = await getDocs(colRef);
        const batch = writeBatch(db);
        snapshot.docs.forEach(doc => batch.delete(doc.ref));
        await batch.commit();
      }
      alert("Đã xóa sạch dữ liệu!");
      window.location.reload();
    } catch (e) {
      alert("Lỗi khi xóa: " + e.message);
    }
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

          <button className="card" onClick={() => { setMode('register'); setRegisterSuccess(''); setError(''); setRegisterForm({displayName: '', phone: '', pin: ''}); }}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--warning-bg)', color: 'var(--warning)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <UserPlus size={24} />
              </div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontWeight: 600, fontSize: '1.05rem' }}>Đăng ký tài khoản</div>
                <div className="text-sm text-muted">Dành cho Thợ mới</div>
              </div>
            </div>
            <ChevronRight size={20} className="text-muted" />
          </button>

          <button className="btn btn-outline" onClick={clearDatabase} style={{ color: 'var(--danger)', borderColor: 'var(--danger)', marginTop: '24px' }}>
            <Trash2 size={16} /> Reset Database (Debug)
          </button>
        </div>
      ) : mode === 'register' ? (
        <div className="card" style={{ padding: '24px' }}>
          <h2 style={{ fontSize: '1.2rem', marginBottom: '16px' }}>📝 Đăng ký Thợ mới</h2>

          {registerSuccess ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: 'var(--success)', marginBottom: '12px', fontSize: '1.1rem' }}>Đăng ký thành công!</div>
              <div style={{ marginBottom: '16px' }}>
                Mã thợ của bạn là: <br/>
                <strong style={{ fontSize: '1.8rem', color: 'var(--primary)' }}>{registerSuccess}</strong>
              </div>
              <p className="text-muted text-sm" style={{ marginBottom: '24px' }}>Vui lòng ghi nhớ mã này và chờ Chủ duyệt để có thể đăng nhập.</p>
              <button className="btn btn-primary" onClick={() => { setMode('worker'); setCode(registerSuccess); setRegisterSuccess(''); }}>Đến trang Đăng nhập</button>
            </div>
          ) : (
            <form onSubmit={handleRegister}>
              <div className="form-group">
                <label className="form-label">Họ và tên</label>
                <input className="form-input" placeholder="VD: Nguyễn Văn A" value={registerForm.displayName} onChange={e => setRegisterForm({...registerForm, displayName: e.target.value})} required autoFocus />
              </div>
              <div className="form-group">
                <label className="form-label">Số điện thoại</label>
                <input className="form-input" type="tel" placeholder="0901234567" value={registerForm.phone} onChange={e => setRegisterForm({...registerForm, phone: e.target.value})} required />
              </div>
              <div className="form-group">
                <label className="form-label">Tạo Mã PIN (Mật khẩu)</label>
                <input className="form-input" type="password" placeholder="VD: 123456" value={registerForm.pin} onChange={e => setRegisterForm({...registerForm, pin: e.target.value})} required />
              </div>

              <button type="submit" className="btn btn-primary" style={{ marginBottom: '12px' }}>Đăng ký</button>
              <button type="button" className="btn btn-outline" onClick={() => { setMode(null); setError(''); }}>← Quay lại</button>
            </form>
          )}
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
                style={{ fontSize: '1.2rem', textAlign: 'center', letterSpacing: mode === 'owner' ? '4px' : '2px', textTransform: mode === 'worker' ? 'uppercase' : 'none' }}
              />
            </div>
            {mode === 'worker' && (
              <div className="form-group" style={{ marginTop: '12px' }}>
                <input
                  className="form-input"
                  type="password"
                  placeholder="Mã PIN"
                  value={pin}
                  onChange={(e) => { setPin(e.target.value); setError(''); }}
                  style={{ fontSize: '1.2rem', textAlign: 'center', letterSpacing: '4px' }}
                />
              </div>
            )}

            {error && <div style={{ color: 'var(--danger)', fontSize: '0.875rem', marginBottom: '12px', textAlign: 'center' }}>{error}</div>}

            <button type="submit" className="btn btn-primary" style={{ marginBottom: '12px' }}>
              Vào
            </button>
            <button type="button" className="btn btn-outline" onClick={() => { setMode(null); setError(''); setCode(''); setPin(''); }}>
              ← Quay lại
            </button>
          </form>


        </div>
      )}
    </div>
  );
};

export default Login;
