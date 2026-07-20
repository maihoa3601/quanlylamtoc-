import React, { useState } from 'react';
import { useData } from '../../hooks/useData';
import { formatVND } from '../../utils/formatters';

const Statistics = () => {
  const { batches, returns, distributions, workers, hairTypes, requests } = useData();
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const filterByDateRange = (dateStr) => {
    if (!dateStr) return false;
    const itemDate = new Date(dateStr.split('T')[0]); // Chỉ so sánh phần ngày (YYYY-MM-DD)
    itemDate.setHours(0, 0, 0, 0);

    if (fromDate) {
      const from = new Date(fromDate);
      from.setHours(0, 0, 0, 0);
      if (itemDate < from) return false;
    }
    
    if (toDate) {
      const to = new Date(toDate);
      to.setHours(23, 59, 59, 999);
      if (itemDate > to) return false;
    }
    
    return true;
  };

  const filteredBatches = batches.filter(b => filterByDateRange(b.receivedDate));
  const filteredReturns = returns.filter(r => filterByDateRange(r.returnDate));
  const filteredDistributions = distributions.filter(d => filterByDateRange(d.distributedDate));
  const filteredRequests = requests.filter(r => filterByDateRange(r.requestDate));

  // 1. KPI Calculations
  const totalImportCost = filteredBatches.reduce((s, b) => 
    s + b.items.reduce((ss, it) => ss + (it.quantity * it.unitPrice), 0)
  , 0);

  const totalPaidWages = filteredReturns
    .filter(r => r.status === 'confirmed')
    .reduce((s, r) => s + r.totalAmount, 0);

  let totalHairImported = 0;
  filteredBatches.forEach(b => b.items.forEach(it => { totalHairImported += it.quantity; }));
  
  const activeWorkersCount = workers.filter(w => w.status === 'active').length;

  // 2. Hair Types Stats
  const hairStats = hairTypes.map(ht => {
    let imported = 0;
    filteredBatches.forEach(b => b.items.forEach(it => { if(it.hairTypeId === ht.id) imported += it.quantity; }));

    let given = 0;
    filteredDistributions.forEach(d => d.items.forEach(it => { if(it.hairTypeId === ht.id) given += it.quantityGiven; }));

    let returned = 0;
    filteredReturns.filter(r => r.status === 'confirmed').forEach(r => {
      r.items.forEach(it => { if(it.hairTypeId === ht.id) returned += it.quantity; });
    });

    const completionRate = given > 0 ? Math.min(100, Math.round((returned / given) * 100)) : 0;

    return { ...ht, name: `${ht.size} (${ht.technique})`, imported, given, returned, completionRate };
  }).filter(h => h.imported > 0 || h.given > 0); // Only show active hair types in this period

  // 3. Worker Stats
  const workerStats = workers.map(w => {
    let totalRequests = 0;
    filteredRequests.filter(r => r.workerId === w.id).forEach(() => { totalRequests += 1; });

    let totalGiven = 0;
    filteredDistributions.filter(d => d.workerId === w.id).forEach(d => {
      d.items.forEach(it => { totalGiven += it.quantityGiven; });
    });

    let totalReturned = 0;
    let totalWages = 0;
    filteredReturns.filter(r => r.workerId === w.id && r.status === 'confirmed').forEach(r => {
      totalWages += r.totalAmount;
      r.items.forEach(it => { totalReturned += it.quantity; });
    });

    const productivityRate = totalGiven > 0 ? Math.min(100, Math.round((totalReturned / totalGiven) * 100)) : 0;

    return { ...w, totalRequests, totalGiven, totalReturned, totalWages, productivityRate };
  }).filter(w => w.totalGiven > 0 || w.totalRequests > 0); // Only show active workers

  return (
    <div className="container animate-slide-up" style={{ maxWidth: '800px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
        <h2 style={{ margin: 0, fontSize: '1.5rem' }}>📊 Dashboard Thống Kê</h2>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: 'var(--bg-surface)', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Lọc theo thời gian:</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: '1 1 140px' }}>
              <span className="text-xs text-muted">Từ:</span>
              <input 
                type="date" 
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                style={{ flex: 1, border: '1px solid var(--border)', outline: 'none', background: 'var(--bg-surface-solid)', padding: '6px 10px', borderRadius: '6px', color: 'var(--text-primary)', fontFamily: 'inherit', fontSize: '0.9rem' }}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: '1 1 140px' }}>
              <span className="text-xs text-muted">Đến:</span>
              <input 
                type="date" 
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                min={fromDate}
                style={{ flex: 1, border: '1px solid var(--border)', outline: 'none', background: 'var(--bg-surface-solid)', padding: '6px 10px', borderRadius: '6px', color: 'var(--text-primary)', fontFamily: 'inherit', fontSize: '0.9rem' }}
              />
            </div>
            {(fromDate || toDate) && (
              <button 
                onClick={() => { setFromDate(''); setToDate(''); }} 
                style={{ color: 'var(--danger)', fontSize: '0.8rem', fontWeight: 600, padding: '8px 12px', borderRadius: '6px', background: 'var(--danger-bg)', whiteSpace: 'nowrap', flex: '0 0 auto' }}
              >
                Xoá lọc
              </button>
            )}
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px', marginBottom: '24px' }}>
        <div className="stat-card">
          <div className="stat-title">Chi phí nhập</div>
          <div className="stat-value" style={{ color: 'var(--danger)' }}>{formatVND(totalImportCost)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-title">Tổng tiền công</div>
          <div className="stat-value" style={{ color: 'var(--success)' }}>{formatVND(totalPaidWages)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-title">Tóc đã nhập</div>
          <div className="stat-value" style={{ color: 'var(--primary)' }}>{totalHairImported} <span style={{fontSize:'0.9rem', color:'var(--text-secondary)'}}>bó</span></div>
        </div>
        <div className="stat-card">
          <div className="stat-title">Thợ tham gia</div>
          <div className="stat-value" style={{ color: 'var(--warning)' }}>{activeWorkersCount} <span style={{fontSize:'0.9rem', color:'var(--text-secondary)'}}>người</span></div>
        </div>
      </div>

      {/* Tóc đang xử lý */}
      <div className="card" style={{ marginBottom: '32px', overflow: 'hidden' }}>
        <h3 style={{ fontSize: '1.1rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          ✂️ Phân Tích Theo Loại Tóc
        </h3>
        
        {hairStats.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-secondary)' }}>Không có dữ liệu trong kỳ này.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {hairStats.map(s => (
              <div key={s.id} style={{ paddingBottom: '16px', borderBottom: '1px solid var(--border-light)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '4px', marginBottom: '8px' }}>
                  <div style={{ fontWeight: 600, minWidth: '100px' }}>{s.name}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <span>Nhập: <strong>{s.imported}</strong></span>
                    <span>Giao: <strong>{s.given}</strong></span>
                    <span>Trả: <strong style={{color: 'var(--success)'}}>{s.returned}</strong></span>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div className="progress-bg" style={{ flex: 1, margin: 0 }}>
                    <div 
                      className={`progress-bar ${s.completionRate === 100 ? 'success' : s.completionRate > 50 ? 'primary' : 'warning'}`} 
                      style={{ width: `${s.completionRate}%` }}
                    />
                  </div>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, width: '40px', textAlign: 'right' }}>
                    {s.completionRate}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Hiệu suất thợ */}
      <div className="card">
        <h3 style={{ fontSize: '1.1rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          👥 Năng Suất Thợ Gia Công
        </h3>
        
        {workerStats.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-secondary)' }}>Không có hoạt động thợ trong kỳ này.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {workerStats.map(ws => (
              <div key={ws.id} style={{ padding: '12px', background: 'rgba(0,0,0,0.02)', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '20px', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1.2rem', flexShrink: 0 }}>
                      {ws.displayName.charAt(0)}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600 }}>{ws.displayName}</div>
                      <div className="text-xs text-muted">{ws.code} • {ws.totalRequests} yêu cầu</div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', flexGrow: 1 }}>
                    <div style={{ fontWeight: 700, color: 'var(--success)' }}>{formatVND(ws.totalWages)}</div>
                    <div className="text-xs text-muted">Tiền công</div>
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '4px' }}>
                    <span className="text-muted">Tiến độ gia công ({ws.totalReturned}/{ws.totalGiven} bó)</span>
                    <span style={{ fontWeight: 600 }}>{ws.productivityRate}%</span>
                  </div>
                  <div className="progress-bg" style={{ margin: 0, height: '6px' }}>
                    <div 
                      className={`progress-bar ${ws.productivityRate === 100 ? 'success' : ws.productivityRate > 50 ? 'primary' : 'warning'}`} 
                      style={{ width: `${ws.productivityRate}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Statistics;
