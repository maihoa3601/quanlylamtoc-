import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useData } from '../../hooks/useData';
import { X, Check, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CustomSelect from '../../components/CustomSelect';

const CreateRequest = () => {
  const { currentUser } = useAuth();
  const { hairTypes, createRequest } = useData();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [note, setNote] = useState('');
  const [success, setSuccess] = useState(false);

  const addItem = () => {
    if (hairTypes.length === 0) return;
    setItems([...items, { hairTypeId: hairTypes[0].id, hairTypeName: `${hairTypes[0].size} (${hairTypes[0].technique})`, quantity: '' }]);
  };

  const updateItem = (idx, field, value) => {
    const newItems = [...items];
    newItems[idx][field] = value;
    if (field === 'hairTypeId') {
      const ht = hairTypes.find(h => h.id === value);
      if (ht) newItems[idx].hairTypeName = `${ht.size} (${ht.technique})`;
    }
    setItems(newItems);
  };

  const removeItem = (idx) => setItems(items.filter((_, i) => i !== idx));

  const handleSubmit = (e) => {
    e.preventDefault();
    const validItems = items.filter(it => Number(it.quantity) > 0);
    if (validItems.length === 0) return;
    createRequest({
      workerId: currentUser.id,
      workerName: currentUser.displayName,
      workerPhone: '',
      items: validItems.map(it => ({ ...it, quantity: Number(it.quantity) })),
      note,
    });
    setSuccess(true);
    setTimeout(() => navigate('/worker/my-requests'), 1500);
  };

  if (success) {
    return (
      <div className="container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--success-bg)', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
          <Check size={32} />
        </div>
        <h2>Đã gửi request!</h2>
        <p className="text-muted">Chờ chủ duyệt...</p>
      </div>
    );
  }

  return (
    <div className="container animate-slide-up">
      <h2 style={{ marginBottom: '16px' }}>✋ Xin Lấy Hàng</h2>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <label className="form-label" style={{ margin: 0 }}>Chọn loại tóc & số lượng</label>
            <button type="button" className="btn-icon" onClick={addItem} style={{ background: 'var(--primary)', color: 'white' }}>
              <Plus size={18} />
            </button>
          </div>

          {items.length === 0 && (
            <div className="card" style={{ textAlign: 'center', padding: '32px' }}>
              <p className="text-muted">Nhấn + để thêm loại tóc cần lấy</p>
            </div>
          )}

          {items.map((it, idx) => (
            <div key={idx} className="card" style={{ display: 'flex', gap: '8px', alignItems: 'center', padding: '12px', marginBottom: '8px', position: 'relative', zIndex: items.length - idx }}>
              <CustomSelect 
                value={it.hairTypeId} 
                onChange={e => updateItem(idx, 'hairTypeId', e.target.value)} 
                options={hairTypes.map(ht => ({ value: ht.id, label: `${ht.size} (${ht.technique})` }))}
                style={{ flex: 2 }}
              />
              <input className="form-input" type="number" placeholder="SL" value={it.quantity}
                onChange={e => updateItem(idx, 'quantity', e.target.value)} style={{ flex: 1 }} />
              <button type="button" className="btn-icon" onClick={() => removeItem(idx)} style={{ color: 'var(--danger)', flexShrink: 0 }}>
                Xoá
              </button>
            </div>
          ))}
        </div>

        <div className="form-group">
          <label className="form-label">Ghi chú (tuỳ chọn)</label>
          <input className="form-input" placeholder="VD: Lấy gấp, cần trong ngày..." value={note} onChange={e => setNote(e.target.value)} />
        </div>

        <button type="submit" className="btn btn-primary" disabled={items.filter(it => Number(it.quantity) > 0).length === 0}>
          Gửi yêu cầu
        </button>
      </form>
    </div>
  );
};

export default CreateRequest;
