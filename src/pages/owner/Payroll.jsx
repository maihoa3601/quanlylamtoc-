import React, { useState } from 'react';
import { useData } from '../../hooks/useData';
import { formatVND, formatDate } from '../../utils/formatters';
import { Calendar, Banknote, Download, Printer } from 'lucide-react';
import CustomSelect from '../../components/CustomSelect';
import './Payroll.css';

const Payroll = () => {
  const { workers, returns, markReturnsPaid } = useData();
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];
  const [startDate, setStartDate] = useState(firstDay);
  const [endDate, setEndDate] = useState(lastDay);
  const [selectedWorkerId, setSelectedWorkerId] = useState('all');

  // Tính lương cho kỳ đã chọn
  const calculatePayroll = () => {
    const payroll = [];
    const targetWorkers = selectedWorkerId === 'all' 
      ? workers 
      : workers.filter(w => w.id === selectedWorkerId);

    targetWorkers.forEach(w => {
      // Lọc các phiếu trả hàng ĐÃ XÁC NHẬN hoặc ĐÃ THANH TOÁN trong khoảng thời gian được chọn
      const wReturns = returns.filter(r => {
        if (r.workerId !== w.id) return false;
        if (r.status !== 'confirmed' && r.status !== 'paid') return false;
        const rDate = r.returnDate.split('T')[0];
        return rDate >= startDate && rDate <= endDate;
      });

      if (wReturns.length > 0) {
        const totalAmount = wReturns.reduce((s, r) => s + r.totalAmount, 0);
        const paidAmount = wReturns.filter(r => r.status === 'paid').reduce((s, r) => s + r.totalAmount, 0);
        const unpaidAmount = totalAmount - paidAmount;
        const unpaidReturnIds = wReturns.filter(r => r.status === 'confirmed').map(r => r.id);

        const details = wReturns.map(r => ({
          date: r.returnDate,
          amount: r.totalAmount,
          id: r.id,
          status: r.status
        }));
        
        const productStats = {};
        wReturns.forEach(r => {
          r.items.forEach(it => {
            if (!productStats[it.hairTypeId]) {
              productStats[it.hairTypeId] = {
                hairTypeName: it.hairTypeName,
                quantity: 0,
                subtotal: 0
              };
            }
            productStats[it.hairTypeId].quantity += it.quantity;
            productStats[it.hairTypeId].subtotal += (it.quantity * it.unitPrice);
          });
        });
        const products = Object.values(productStats).sort((a, b) => b.quantity - a.quantity);
        
        payroll.push({
          worker: w,
          totalAmount,
          paidAmount,
          unpaidAmount,
          unpaidReturnIds,
          details,
          products
        });
      }
    });
    return payroll;
  };

  const payrollData = calculatePayroll();
  const grandTotal = payrollData.reduce((s, p) => s + p.totalAmount, 0);

  const handlePay = (workerName, unpaidReturnIds) => {
    if (confirm(`Xác nhận đã thanh toán toàn bộ lương còn nợ cho ${workerName}?`)) {
      markReturnsPaid(unpaidReturnIds);
    }
  };

  return (
    <div className="container animate-slide-up">
      <h2 style={{ marginBottom: '16px' }}>💸 Tính Lương (Owner)</h2>

      <div className="card no-print" style={{ marginBottom: '16px', display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center', position: 'relative', zIndex: 50 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: '1 1 320px' }}>
          <Calendar size={20} className="text-muted" style={{ flexShrink: 0 }} />
          <input 
            type="date" 
            className="form-input" 
            value={startDate} 
            onChange={e => setStartDate(e.target.value)} 
            style={{ padding: '14px 10px', minWidth: '130px' }}
          />
          <span className="text-muted" style={{ fontWeight: 600 }}>-</span>
          <input 
            type="date" 
            className="form-input" 
            value={endDate} 
            onChange={e => setEndDate(e.target.value)} 
            style={{ padding: '14px 10px', minWidth: '130px' }}
          />
        </div>

        <CustomSelect 
          value={selectedWorkerId} 
          onChange={e => setSelectedWorkerId(e.target.value)}
          options={[
            { value: 'all', label: '👥 Tất cả thợ' },
            ...workers.map(w => ({ value: w.id, label: `${w.displayName} (${w.code})` }))
          ]}
          style={{ flex: '1 1 200px', minWidth: '200px' }}
        />

        <button className="btn-icon" onClick={() => window.print()} style={{ background: 'var(--primary-light)', color: 'var(--primary)' }} title="In bảng lương">
          <Printer size={20} />
        </button>
      </div>

      <div className="card print-header" style={{ textAlign: 'center', marginBottom: '16px', background: 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(99,102,241,0.15))' }}>
        <h1 className="only-print" style={{ marginBottom: '8px' }}>Bảng Lương ({formatDate(startDate)} đến {formatDate(endDate)})</h1>
        <div className="text-sm text-muted">Tổng quỹ lương phát sinh</div>
        <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--success)' }}>{formatVND(grandTotal)}</div>
      </div>

      {payrollData.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
          <p className="text-muted">Chưa có dữ liệu lương từ {formatDate(startDate)} đến {formatDate(endDate)}</p>
        </div>
      ) : (
        payrollData.map((p, i) => (
          <div key={i} className="card" style={{ marginBottom: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>{p.worker.displayName}</div>
                <div className="text-sm text-muted">Mã: {p.worker.code}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 700, color: 'var(--success)', fontSize: '1.2rem' }}>{formatVND(p.totalAmount)}</div>
                {p.paidAmount > 0 && (
                  <div className="text-xs text-muted">Đã trả: {formatVND(p.paidAmount)}</div>
                )}
                {p.unpaidAmount > 0 && (
                  <div className="text-xs" style={{ color: 'var(--danger)' }}>Còn nợ: {formatVND(p.unpaidAmount)}</div>
                )}
              </div>
            </div>
            
            <div style={{ background: 'var(--bg-surface-hover)', padding: '12px', borderRadius: '8px' }}>
              <div className="text-sm" style={{ fontWeight: 600, color: 'var(--primary)', marginBottom: '8px' }}>📦 Tổng hợp sản phẩm gia công:</div>
              {p.products.map((prod, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', padding: '6px 0', borderBottom: idx < p.products.length - 1 ? '1px dashed var(--border)' : 'none' }}>
                  <span>{prod.hairTypeName} <strong style={{ color: 'var(--success)', marginLeft: '4px' }}>x{prod.quantity}</strong></span>
                  <span style={{ fontWeight: 600 }}>{formatVND(prod.subtotal)}</span>
                </div>
              ))}
              
              <div className="text-xs text-muted" style={{ marginTop: '12px', marginBottom: '4px' }}>Chi tiết các phiếu trả ({p.details.length} phiếu):</div>
              {p.details.map((d, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', padding: '4px 0' }}>
                  <span>{formatDate(d.date)} (Mã: #{d.id.slice(-5)})</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>{formatVND(d.amount)}</span>
                    <span style={{ 
                      fontSize: '0.7rem', padding: '2px 6px', borderRadius: '4px',
                      background: d.status === 'paid' ? 'var(--success-bg)' : 'var(--warning-bg)',
                      color: d.status === 'paid' ? 'var(--success)' : 'var(--warning)'
                    }}>
                      {d.status === 'paid' ? 'Đã trả' : 'Chưa trả'}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {p.unpaidAmount > 0 && (
              <button className="btn btn-outline no-print" onClick={() => handlePay(p.worker.displayName, p.unpaidReturnIds)} style={{ width: '100%', marginTop: '12px' }}>
                <Banknote size={16} /> Thanh toán phần còn nợ ({formatVND(p.unpaidAmount)})
              </button>
            )}
            {p.unpaidAmount === 0 && (
              <div className="text-center text-sm" style={{ marginTop: '12px', color: 'var(--success)', fontWeight: 600 }}>
                ✓ Đã thanh toán đầy đủ
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default Payroll;
