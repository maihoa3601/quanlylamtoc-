import React, { useState } from 'react';
import { useData } from '../../hooks/useData';
import { formatVND, formatDate } from '../../utils/formatters';
import { useNavigate } from 'react-router-dom';
import { Plus, X, Check, ChevronRight, Edit2, Trash2, Search } from 'lucide-react';
import CustomSelect from '../../components/CustomSelect';

const Batches = () => {
  const { batches, hairTypes, addBatch, updateBatch, deleteBatch } = useData();
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ supplier: '', note: '', receivedDate: new Date().toISOString().split('T')[0] });
  const [items, setItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  const addItem = () => {
    if (hairTypes.length === 0) return;
    setItems([...items, { 
      hairTypeId: hairTypes[0].id, 
      hairTypeName: `${hairTypes[0].size} (${hairTypes[0].technique})`, 
      quantity: '', 
      unitPrice: hairTypes[0].unitPrice || 0,
      importPrice: '',
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
        newItems[idx].unitPrice = validTechs[0].unitPrice || 0;
      }
    } else if (field === 'selectedTechnique') {
      newItems[idx].selectedTechnique = value;
      const ht = hairTypes.find(h => h.size === newItems[idx].selectedSize && h.technique === value);
      if (ht) {
        newItems[idx].hairTypeId = ht.id;
        newItems[idx].hairTypeName = `${ht.size} (${ht.technique})`;
        newItems[idx].unitPrice = ht.unitPrice || 0;
      }
    } else {
      newItems[idx][field] = value;
    }
    setItems(newItems);
  };

  const removeItem = (idx) => setItems(items.filter((_, i) => i !== idx));

  const handleEdit = (batch) => {
    setEditingId(batch.id);
    setForm({ 
      supplier: batch.supplier || '', 
      note: batch.note || '', 
      receivedDate: batch.receivedDate ? batch.receivedDate.split('T')[0] : new Date().toISOString().split('T')[0]
    });
    setItems(batch.items.map(it => {
      const ht = hairTypes.find(h => h.id === it.hairTypeId);
      return {
        ...it,
        selectedSize: ht ? ht.size : '',
        selectedTechnique: ht ? ht.technique : ''
      };
    }));
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa đợt nhập này không? Dữ liệu tồn kho sẽ bị ảnh hưởng.")) {
      await deleteBatch(id);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validItems = items.filter(it => Number(it.quantity) > 0);
    if (validItems.length === 0) return;
    
    // BUG-11: Merge duplicate hair types
    const mergedMap = {};
    validItems.forEach(it => {
      if (!mergedMap[it.hairTypeId]) {
        mergedMap[it.hairTypeId] = { 
          hairTypeId: it.hairTypeId, 
          hairTypeName: it.hairTypeName, 
          quantity: Number(it.quantity), 
          unitPrice: Number(it.unitPrice),
          importPrice: Number(it.importPrice) || 0
        };
      } else {
        mergedMap[it.hairTypeId].quantity += Number(it.quantity);
      }
    });

    const batchData = {
      supplier: form.supplier,
      note: form.note,
      receivedDate: new Date(form.receivedDate).toISOString(),
      items: Object.values(mergedMap),
    };

    if (editingId) {
      updateBatch(editingId, batchData);
    } else {
      addBatch(batchData);
    }
    
    setForm({ supplier: '', note: '', receivedDate: new Date().toISOString().split('T')[0] });
    setItems([]);
    setEditingId(null);
    setShowForm(false);
  };

  const cancelEdit = () => {
    setForm({ supplier: '', note: '', receivedDate: new Date().toISOString().split('T')[0] });
    setItems([]);
    setEditingId(null);
    setShowForm(false);
  };

  const sorted = [...batches]
    .filter(b => {
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      const n = (b.note || '').toLowerCase();
      const s = (b.supplier || '').toLowerCase();
      return n.includes(term) || s.includes(term);
    })
    .sort((a, b) => new Date(b.receivedDate) - new Date(a.receivedDate));

  return (
    <div className="container animate-slide-up">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h2>📦 Nhập Hàng</h2>
        <button className="btn-icon" onClick={() => {
          if (showForm) cancelEdit();
          else setShowForm(true);
        }} style={{ background: showForm ? 'var(--bg-surface-hover)' : 'var(--primary)', color: showForm ? 'var(--text-primary)' : 'white' }}>
          {showForm ? <X size={20} /> : <Plus size={20} />}
        </button>
      </div>

      <div style={{ position: 'relative', marginBottom: '16px' }}>
        <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        <input 
          className="form-input" 
          placeholder="Tìm theo nguồn hàng hoặc ghi chú..." 
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          style={{ paddingLeft: '38px' }}
        />
      </div>

      {showForm && (
        <form className="card" onSubmit={handleSubmit} style={{ marginBottom: '16px', position: 'relative', zIndex: 50 }}>
          <h3 style={{ fontSize: '1rem', marginBottom: '12px' }}>{editingId ? 'Sửa Đợt Nhập' : 'Thêm Đợt Nhập Mới'}</h3>
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
                  <input className="form-input" type="number" placeholder="SL" value={it.quantity} onChange={e => updateItem(idx, 'quantity', e.target.value)} />
                </div>
                <div className="qty-input">
                  <input className="form-input" type="number" placeholder="Giá nhập" value={it.importPrice || ''} onChange={e => updateItem(idx, 'importPrice', e.target.value)} />
                </div>
                <div className="action-btn">
                  <button type="button" className="btn-icon" onClick={() => removeItem(idx)} style={{ color: 'var(--danger)' }}><X size={16} /></button>
                </div>
              </div>
            ))}
            {items.length === 0 && <p className="text-sm text-muted">Nhấn + để thêm loại tóc</p>}
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            {editingId && (
              <button type="button" className="btn btn-outline" onClick={cancelEdit} style={{ flex: 1 }}>
                Hủy
              </button>
            )}
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
              <Check size={18} /> {editingId ? 'Cập nhật' : 'Lưu đợt nhập'}
            </button>
          </div>
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
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="btn-icon" onClick={() => handleEdit(b)} style={{ color: 'var(--primary)' }}>
                  <Edit2 size={16} />
                </button>
                <button className="btn-icon" onClick={() => handleDelete(b.id)} style={{ color: 'var(--danger)' }}>
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            <div style={{ marginTop: '12px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {b.items.map((it, i) => (
                <span key={i} className="badge badge-success">{it.hairTypeName}: {it.quantity}</span>
              ))}
            </div>
            <div className="text-sm text-muted" style={{ marginTop: '8px' }}>
              Tổng: {b.items.reduce((s, it) => s + it.quantity, 0)} {' • '}
              Giá trị nhập: {formatVND(b.items.reduce((s, it) => s + it.quantity * (it.importPrice || it.unitPrice), 0))}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default Batches;
