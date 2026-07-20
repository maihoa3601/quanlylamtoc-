import React, { useState } from 'react';
import { useData } from '../../hooks/useData';
import { formatVND, formatDate } from '../../utils/formatters';
import { useNavigate } from 'react-router-dom';
import { Plus, X, Check, ChevronRight } from 'lucide-react';
import CustomSelect from '../../components/CustomSelect';

const Batches = () => {
  const { batches, hairTypes, addBatch } = useData();
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ supplier: '', note: '', receivedDate: new Date().toISOString().split('T')[0] });
  const [items, setItems] = useState([]);

  const addItem = () => {
    if (hairTypes.length === 0) return;
    setItems([...items, { hairTypeId: hairTypes[0].id, hairTypeName: `${hairTypes[0].size} (${hairTypes[0].technique})`, quantity: '', unitPrice: '' }]);
  };

  const updateItem = (idx, field, value) => {
    const newItems = [...items];
    newItems[idx][field] = value;
    if (field === 'hairTypeId') {
      const ht = hairTypes.find(h => h.id === value);
      if (ht) { newItems[idx].hairTypeName = `${ht.size} (${ht.technique})`; newItems[idx].unitPrice = ''; }
    }
    setItems(newItems);
  };

  const removeItem = (idx) => setItems(items.filter((_, i) => i !== idx));

  const handleSubmit = (e) => {
    e.preventDefault();
    const validItems = items.filter(it => it.quantity > 0);
    if (validItems.length === 0) return;
    addBatch({
      supplier: form.supplier,
      note: form.note,
      receivedDate: new Date(form.receivedDate).toISOString(),
      items: validItems.map(it => ({ ...it, quantity: Number(it.quantity), unitPrice: Number(it.unitPrice) })),
    });
    setForm({ supplier: '', note: '', receivedDate: new Date().toISOString().split('T')[0] });
    setItems([]);
    setShowForm(false);
  };

  const sorted = [...batches].sort((a, b) => new Date(b.receivedDate) - new Date(a.receivedDate));

  return (
    <div className="container animate-slide-up">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h2>📦 Nhập Hàng</h2>
        <button className="btn-icon" onClick={() => setShowForm(!showForm)} style={{ background: 'var(--primary)', color: 'white' }}>
          {showForm ? <X size={20} /> : <Plus size={20} />}
        </button>
      </div>

      {showForm && (
        <form className="card" onSubmit={handleSubmit} style={{ marginBottom: '16px', position: 'relative', zIndex: 50 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label">Nguồn hàng</label>
              <input className="form-input" placeholder="VD: Nguồn A" value={form.supplier} onChange={e => setForm({ ...form, supplier: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Ngày nhận</label>
              <input className="form-input" type="date" value={form.receivedDate} onChange={e => setForm({ ...form, receivedDate: e.target.value })} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Ghi chú</label>
            <input className="form-input" placeholder="VD: Đợt 15/07" value={form.note} onChange={e => setForm({ ...form, note: e.target.value })} />
          </div>

          <div style={{ marginBottom: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <label className="form-label" style={{ margin: 0 }}>Danh sách hàng</label>
              <button type="button" className="btn-icon" onClick={addItem} style={{ background: 'var(--success-bg)', color: 'var(--success)' }}>
                <Plus size={16} />
              </button>
            </div>
            {items.map((it, idx) => (
              <div key={idx} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: '8px', marginBottom: '8px', alignItems: 'end' }}>
                <CustomSelect 
                  value={it.hairTypeId} 
                  onChange={e => updateItem(idx, 'hairTypeId', e.target.value)}
                  options={hairTypes.map(ht => ({ value: ht.id, label: `${ht.size} (${ht.technique})` }))}
                />
                <input className="form-input" type="number" placeholder="SL" value={it.quantity} onChange={e => updateItem(idx, 'quantity', e.target.value)} />
                <input className="form-input" type="number" placeholder="Giá" value={it.unitPrice} onChange={e => updateItem(idx, 'unitPrice', e.target.value)} />
                <button type="button" className="btn-icon" onClick={() => removeItem(idx)} style={{ color: 'var(--danger)' }}><X size={16} /></button>
              </div>
            ))}
            {items.length === 0 && <p className="text-sm text-muted">Nhấn + để thêm loại tóc</p>}
          </div>

          <button type="submit" className="btn btn-primary"><Check size={18} /> Lưu đợt nhập</button>
        </form>
      )}

      {sorted.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
          <p className="text-muted">Chưa có đợt nhập nào</p>
        </div>
      ) : (
        sorted.map(b => (
          <div key={b.id} className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 600 }}>{b.note || b.supplier || 'Đợt nhập'}</div>
                <div className="text-sm text-muted">{formatDate(b.receivedDate)} {b.supplier && `• ${b.supplier}`}</div>
              </div>
              <ChevronRight size={18} className="text-muted" />
            </div>
            <div style={{ marginTop: '12px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {b.items.map((it, i) => (
                <span key={i} className="badge badge-success">{it.hairTypeName}: {it.quantity}</span>
              ))}
            </div>
            <div className="text-sm text-muted" style={{ marginTop: '8px' }}>
              Tổng: {b.items.reduce((s, it) => s + it.quantity, 0)} {' • '}
              Giá trị: {formatVND(b.items.reduce((s, it) => s + it.quantity * it.unitPrice, 0))}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default Batches;
