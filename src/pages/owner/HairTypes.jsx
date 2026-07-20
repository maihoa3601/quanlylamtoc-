import React, { useState } from 'react';
import { useData } from '../../hooks/useData';
import { formatVND } from '../../utils/formatters';
import { Plus, Edit3, Trash2, X, Check } from 'lucide-react';
import CustomSelect from '../../components/CustomSelect';

const SIZES = ['2x4', '2x6', '4x4', '5x5', '6x6', '7x7', '9x6', '13x4', '13x6'];
const TECHNIQUES = ['Đi 1 bỏ 3', 'Đi 1 bỏ 2', 'Rích rắc'];

const HairTypes = () => {
  const { hairTypes, addHairType, updateHairType, deleteHairType } = useData();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ size: SIZES[0], technique: TECHNIQUES[0], unitPrice: '', unit: 'bó' });
  const [viewMode, setViewMode] = useState('matrix'); // 'matrix' | 'list'

  const resetForm = () => {
    setForm({ size: SIZES[0], technique: TECHNIQUES[0], unitPrice: '', unit: 'bó' });
    setEditing(null);
    setShowForm(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.size || !form.technique || !form.unitPrice) return;
    const data = { ...form, unitPrice: Number(form.unitPrice) };
    if (editing) {
      updateHairType(editing, data);
    } else {
      addHairType(data);
    }
    resetForm();
  };

  const startEdit = (ht) => {
    setForm({ size: ht.size, technique: ht.technique, unitPrice: ht.unitPrice, unit: ht.unit });
    setEditing(ht.id);
    setShowForm(true);
  };

  // Helper to find price item for (size, technique)
  const getPriceFor = (size, technique) => {
    return hairTypes.find(h => h.size === size && h.technique === technique) || null;
  };

  const startAddForCell = (size, technique) => {
    setForm({ size, technique, unitPrice: '', unit: 'bó' });
    setEditing(null);
    setShowForm(true);
  };

  const formatShortK = (val) => {
    if (!val) return '-';
    return (val / 1000) + 'k';
  };

  return (
    <div className="container animate-slide-up">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h2>✂️ Bảng Giá Gia Công</h2>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            className="btn-outline" 
            onClick={() => setViewMode(viewMode === 'matrix' ? 'list' : 'matrix')} 
            style={{ padding: '6px 12px', fontSize: '0.85rem', borderRadius: '12px' }}
          >
            {viewMode === 'matrix' ? '📋 Xem Danh Sách' : '📊 Xem Bảng Giá'}
          </button>
          <button className="btn-icon" onClick={() => { resetForm(); setShowForm(!showForm); }} style={{ background: 'var(--primary)', color: 'white' }}>
            {showForm ? <X size={20} /> : <Plus size={20} />}
          </button>
        </div>
      </div>

      {/* Ma trận bảng giá giống 100% hình chụp của người dùng */}
      {viewMode === 'matrix' && (
        <div className="card" style={{ padding: '16px 8px', overflowX: 'auto', marginBottom: '16px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border)', background: 'var(--bg-surface-hover)' }}>
                <th style={{ padding: '12px 6px', textAlign: 'left', fontWeight: 700, color: 'var(--text-secondary)' }}>Kích thước</th>
                {TECHNIQUES.map(tech => (
                  <th key={tech} style={{ padding: '12px 6px', fontWeight: 700, color: 'var(--text-secondary)' }}>{tech}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {SIZES.map(size => (
                <tr key={size} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '14px 6px', textAlign: 'left', fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>{size}</td>
                  {TECHNIQUES.map(tech => {
                    const item = getPriceFor(size, tech);
                    return (
                      <td key={tech} style={{ padding: '14px 6px' }}>
                        {item ? (
                          <span 
                            onClick={() => startEdit(item)}
                            style={{ 
                              fontWeight: 700, 
                              color: 'var(--primary)', 
                              cursor: 'pointer',
                              padding: '6px 10px',
                              borderRadius: '8px',
                              background: 'var(--primary-light)',
                              display: 'inline-block',
                              fontSize: '0.95rem'
                            }}
                            title="Bấm để sửa giá"
                          >
                            {formatShortK(item.unitPrice)}
                          </span>
                        ) : (
                          <span 
                            onClick={() => startAddForCell(size, tech)}
                            style={{ 
                              color: 'var(--text-secondary)', 
                              fontWeight: 500, 
                              cursor: 'pointer',
                              padding: '6px 10px',
                              display: 'inline-block'
                            }}
                            title="Bấm để thêm giá mới"
                          >
                            -
                          </span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
          <div className="text-xs text-muted" style={{ textAlign: 'center', marginTop: '12px' }}>
            💡 Chạm vào bất kỳ ô giá nào (VD: 70k) để chỉnh sửa giá gia công
          </div>
        </div>
      )}

      {showForm && (
        <form className="card" onSubmit={handleSubmit} style={{ marginBottom: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label">Kích thước</label>
              <CustomSelect 
                value={form.size} 
                onChange={e => setForm({ ...form, size: e.target.value })} 
                options={SIZES.map(s => ({ value: s, label: s }))}
                disabled={editing}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Quy cách</label>
              <CustomSelect 
                value={form.technique} 
                onChange={e => setForm({ ...form, technique: e.target.value })} 
                options={TECHNIQUES.map(t => ({ value: t, label: t }))}
                disabled={editing}
              />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label">Giá gia công (đ)</label>
              <input className="form-input" type="number" placeholder="70000" value={form.unitPrice} onChange={e => setForm({ ...form, unitPrice: e.target.value })} required />
            </div>
            <div className="form-group">
              <label className="form-label">Đơn vị</label>
              <input className="form-input" placeholder="bó, lạng..." value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })} />
            </div>
          </div>
          <button type="submit" className="btn btn-primary">
            <Check size={18} /> {editing ? 'Cập nhật' : 'Thêm mới'}
          </button>
        </form>
      )}

      {viewMode === 'list' && (
        hairTypes.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
            <p className="text-muted">Chưa có loại tóc nào</p>
          </div>
        ) : (
          hairTypes.map(ht => (
            <div key={ht.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>{ht.size} ({ht.technique})</div>
                <div className="text-sm text-muted" style={{ marginTop: '4px' }}>
                  Gia công: <span style={{ color: 'var(--success)' }}>{formatVND(ht.unitPrice)}</span>/{ht.unit}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="btn-icon" onClick={() => startEdit(ht)}><Edit3 size={16} /></button>
                <button className="btn-icon" onClick={() => { if (confirm('Xóa loại tóc này?')) deleteHairType(ht.id); }} style={{ color: 'var(--danger)' }}>
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        )
      )}
    </div>
  );
};

export default HairTypes;
