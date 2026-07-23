import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useData } from '../../hooks/useData';
import { X, Check, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CustomSelect from '../../components/CustomSelect';

const CreateRequest = () => {
  const { currentUser } = useAuth();
  const { hairTypes, createRequest, workers } = useData();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [note, setNote] = useState('');
  const [success, setSuccess] = useState(false);

  const addItem = () => {
    if (hairTypes.length === 0) return;
    setItems([...items, { 
      hairTypeId: hairTypes[0].id, 
      hairTypeName: `${hairTypes[0].size} (${hairTypes[0].technique})`, 
      quantity: '',
      selectedSize: hairTypes[0].size,
      selectedTechnique: hairTypes[0].technique
    }]);
  };

  const updateItem = (idx, field, value) => {
    const newItems = [...items];
    if (field === 'selectedSize') {
      newItems[idx].selectedSize = value;
      const validTechs = hairTypes.filter(h => h.size === value);
      if (validTechs.length > 0) {
        newItems[idx].selectedTechnique = validTechs[0].technique;
        newItems[idx].hairTypeId = validTechs[0].id;
        newItems[idx].hairTypeName = `${validTechs[0].size} (${validTechs[0].technique})`;
      }
    } else if (field === 'selectedTechnique') {
      newItems[idx].selectedTechnique = value;
      const ht = hairTypes.find(h => h.size === newItems[idx].selectedSize && h.technique === value);
      if (ht) {
        newItems[idx].hairTypeId = ht.id;
        newItems[idx].hairTypeName = `${ht.size} (${ht.technique})`;
      }
    } else {
      newItems[idx][field] = value;
    }
    setItems(newItems);
  };

  const removeItem = (idx) => setItems(items.filter((_, i) => i !== idx));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validItems = items.filter(it => Number(it.quantity) > 0);
    if (validItems.length === 0) return;
    
    // Merge duplicate hair types to avoid double-counting on returns
    const mergedItemsMap = {};
    validItems.forEach(it => {
      if (!mergedItemsMap[it.hairTypeId]) {
        mergedItemsMap[it.hairTypeId] = { ...it, quantity: Number(it.quantity) };
      } else {
        mergedItemsMap[it.hairTypeId].quantity += Number(it.quantity);
      }
    });
    const mergedItems = Object.values(mergedItemsMap);

    try {
      await createRequest({
        workerId: currentUser.id,
        workerName: currentUser.displayName,
        workerPhone: workers.find(w => w.id === currentUser.id)?.phone || '',
        items: mergedItems,
        note,
      });
      setSuccess(true);
      setTimeout(() => navigate('/worker/my-requests'), 1500);
    } catch (err) {
      alert('Lỗi gửi yêu cầu: ' + err.message);
    }
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
            <div key={idx} className="batch-item-row" style={{ position: 'relative', zIndex: items.length - idx }}>
              <div className="size-select">
                <CustomSelect 
                  value={it.selectedSize} 
                  onChange={e => updateItem(idx, 'selectedSize', e.target.value)}
                  options={[...new Set(hairTypes.map(h => h.size))].map(s => ({ value: s, label: s }))}
                />
              </div>
              <div className="tech-select">
                <CustomSelect 
                  value={it.selectedTechnique} 
                  onChange={e => updateItem(idx, 'selectedTechnique', e.target.value)}
                  options={hairTypes.filter(h => h.size === it.selectedSize).map(h => ({ value: h.technique, label: h.technique }))}
                />
              </div>
              <div className="qty-input">
                <input className="form-input" type="number" placeholder="Số lượng" value={it.quantity}
                  onChange={e => updateItem(idx, 'quantity', e.target.value)} />
              </div>
              <div className="action-btn">
                <button type="button" className="btn-icon" onClick={() => removeItem(idx)} style={{ color: 'var(--danger)' }}>
                  <X size={16} />
                </button>
              </div>
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
