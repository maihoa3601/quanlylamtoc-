import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { generateId } from '../utils/formatters';

const DataContext = createContext();
export const useData = () => useContext(DataContext);

// ===== Initial Mock Data =====
const INITIAL_HAIR_TYPES = [
  { id: 'ht1', size: '2x4', technique: 'Đi 1 bỏ 3', unitPrice: 70000, unit: 'bó' },
  { id: 'ht2', size: '2x4', technique: 'Đi 1 bỏ 2', unitPrice: 80000, unit: 'bó' },
  { id: 'ht3', size: '2x6', technique: 'Đi 1 bỏ 3', unitPrice: 105000, unit: 'bó' },
  { id: 'ht4', size: '2x6', technique: 'Đi 1 bỏ 2', unitPrice: 120000, unit: 'bó' },
  { id: 'ht5', size: '4x4', technique: 'Đi 1 bỏ 3', unitPrice: 150000, unit: 'bó' },
  { id: 'ht6', size: '4x4', technique: 'Đi 1 bỏ 2', unitPrice: 155000, unit: 'bó' },
  { id: 'ht7', size: '5x5', technique: 'Đi 1 bỏ 3', unitPrice: 200000, unit: 'bó' },
  { id: 'ht8', size: '5x5', technique: 'Đi 1 bỏ 2', unitPrice: 235000, unit: 'bó' },
  { id: 'ht9', size: '6x6', technique: 'Đi 1 bỏ 3', unitPrice: 280000, unit: 'bó' },
  { id: 'ht10', size: '6x6', technique: 'Đi 1 bỏ 2', unitPrice: 325000, unit: 'bó' },
  { id: 'ht11', size: '7x7', technique: 'Đi 1 bỏ 3', unitPrice: 320000, unit: 'bó' },
  { id: 'ht12', size: '7x7', technique: 'Đi 1 bỏ 2', unitPrice: 425000, unit: 'bó' },
  { id: 'ht13', size: '9x6', technique: 'Đi 1 bỏ 3', unitPrice: 385000, unit: 'bó' },
  { id: 'ht14', size: '9x6', technique: 'Rích rắc', unitPrice: 415000, unit: 'bó' },
  { id: 'ht15', size: '13x4', technique: 'Đi 1 bỏ 3', unitPrice: 370000, unit: 'bó' },
  { id: 'ht16', size: '13x4', technique: 'Đi 1 bỏ 2', unitPrice: 435000, unit: 'bó' },
  { id: 'ht17', size: '13x4', technique: 'Rích rắc', unitPrice: 400000, unit: 'bó' },
  { id: 'ht18', size: '13x6', technique: 'Đi 1 bỏ 3', unitPrice: 490000, unit: 'bó' },
  { id: 'ht19', size: '13x6', technique: 'Đi 1 bỏ 2', unitPrice: 560000, unit: 'bó' },
  { id: 'ht20', size: '13x6', technique: 'Rích rắc', unitPrice: 530000, unit: 'bó' },
];

const INITIAL_WORKERS = [
  { id: 'w1', displayName: 'Chị Lan', phone: '0901234567', address: 'Xã A, Huyện B', code: 'TH01', status: 'active', role: 'worker', createdAt: '2025-01-10T08:00:00Z' },
  { id: 'w2', displayName: 'Chị Hoa', phone: '0912345678', address: 'Xã C, Huyện D', code: 'TH02', status: 'active', role: 'worker', createdAt: '2025-02-15T08:00:00Z' },
  { id: 'w3', displayName: 'Anh Tuấn', phone: '0923456789', address: 'Thôn E, Xã F', code: 'TH03', status: 'active', role: 'worker', createdAt: '2025-03-20T08:00:00Z' },
  { id: 'w4', displayName: 'Chị Mai', phone: '0934567890', address: 'Xã G, Huyện H', code: 'TH04', status: 'active', role: 'worker', createdAt: '2025-04-01T08:00:00Z' },
];

const INITIAL_BATCHES = [
  {
    id: 'b1', receivedDate: '2026-07-10T08:00:00Z', supplier: 'Nguồn An Giang', note: 'Đợt hàng 10/07',
    items: [
      { hairTypeId: 'ht1', hairTypeName: '2x4 (Đi 1 bỏ 3)', quantity: 100, unitPrice: 40000 },
      { hairTypeId: 'ht2', hairTypeName: '2x4 (Đi 1 bỏ 2)', quantity: 80, unitPrice: 45000 },
      { hairTypeId: 'ht5', hairTypeName: '4x4 (Đi 1 bỏ 3)', quantity: 60, unitPrice: 90000 },
    ]
  },
  {
    id: 'b2', receivedDate: '2026-07-18T08:00:00Z', supplier: 'Nguồn Nam Định', note: 'Đợt hàng 18/07',
    items: [
      { hairTypeId: 'ht15', hairTypeName: '13x4 (Đi 1 bỏ 3)', quantity: 50, unitPrice: 220000 },
      { hairTypeId: 'ht16', hairTypeName: '13x4 (Đi 1 bỏ 2)', quantity: 40, unitPrice: 270000 },
    ]
  },
];

const INITIAL_REQUESTS = [
  {
    id: 'req1', workerId: 'w1', workerName: 'Chị Lan', workerPhone: '0901234567',
    requestDate: '2026-07-19T09:00:00Z', status: 'pending',
    items: [{ hairTypeId: 'ht1', hairTypeName: '2x4 (Đi 1 bỏ 3)', quantity: 20 }, { hairTypeId: 'ht2', hairTypeName: '2x4 (Đi 1 bỏ 2)', quantity: 15 }],
    note: 'Lấy làm trong tuần', reviewedBy: null, reviewedAt: null, rejectReason: null
  },
  {
    id: 'req2', workerId: 'w2', workerName: 'Chị Hoa', workerPhone: '0912345678',
    requestDate: '2026-07-19T10:30:00Z', status: 'pending',
    items: [{ hairTypeId: 'ht5', hairTypeName: '4x4 (Đi 1 bỏ 3)', quantity: 10 }],
    note: '', reviewedBy: null, reviewedAt: null, rejectReason: null
  },
];

const INITIAL_DISTRIBUTIONS = [
  {
    id: 'dist1', requestId: 'req3', workerId: 'w3', workerName: 'Anh Tuấn',
    distributedDate: '2026-07-18T15:00:00Z', status: 'holding',
    items: [{ hairTypeId: 'ht1', hairTypeName: '2x4 (Đi 1 bỏ 3)', quantityGiven: 25, quantityReturned: 0 }],
  },
];

const INITIAL_RETURNS = [
  {
    id: 'ret1', workerId: 'w1', workerName: 'Chị Lan', returnDate: '2026-07-20T08:00:00Z',
    distributionId: 'dist2', status: 'confirmed',
    items: [{ hairTypeId: 'ht1', hairTypeName: '2x4 (Đi 1 bỏ 3)', quantity: 10, unitPrice: 70000, subtotal: 700000 }],
    totalAmount: 700000, confirmedBy: 'owner', confirmedAt: '2026-07-20T09:00:00Z', disputeNote: null
  },
];

const INITIAL_PAYROLLS = [];

// ===== localStorage helpers =====
const loadState = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch { return fallback; }
};

const saveState = (key, data) => {
  localStorage.setItem(key, JSON.stringify(data));
};

// ===== Provider =====
export const DataProvider = ({ children }) => {
  const [hairTypes, setHairTypes] = useState(() => {
    const loaded = loadState('hairTypes', INITIAL_HAIR_TYPES);
    // Force upgrade to the official 20 hair types from image if old data is stored, or if it doesn't have the new structure
    if (!Array.isArray(loaded) || loaded.length < 20 || loaded.some(h => !h.size || !h.technique || h.buyPrice !== undefined)) {
      saveState('hairTypes', INITIAL_HAIR_TYPES);
      return INITIAL_HAIR_TYPES;
    }
    return loaded;
  });
  const [workers, setWorkers] = useState(() => loadState('workers', INITIAL_WORKERS));
  const [batches, setBatches] = useState(() => loadState('batches', INITIAL_BATCHES));
  const [requests, setRequests] = useState(() => loadState('requests', INITIAL_REQUESTS));
  const [distributions, setDistributions] = useState(() => loadState('distributions', INITIAL_DISTRIBUTIONS));
  const [returns, setReturns] = useState(() => loadState('returns', INITIAL_RETURNS));
  const [payrolls, setPayrolls] = useState(() => loadState('payrolls', INITIAL_PAYROLLS));

  // Persist on change
  useEffect(() => { saveState('hairTypes', hairTypes); }, [hairTypes]);
  useEffect(() => { saveState('workers', workers); }, [workers]);
  useEffect(() => { saveState('batches', batches); }, [batches]);
  useEffect(() => { saveState('requests', requests); }, [requests]);
  useEffect(() => { saveState('distributions', distributions); }, [distributions]);
  useEffect(() => { saveState('returns', returns); }, [returns]);
  useEffect(() => { saveState('payrolls', payrolls); }, [payrolls]);

  // ===== Hair Types =====
  const addHairType = (ht) => setHairTypes(prev => [...prev, { ...ht, id: generateId() }]);
  const updateHairType = (id, data) => setHairTypes(prev => prev.map(h => h.id === id ? { ...h, ...data } : h));
  const deleteHairType = (id) => setHairTypes(prev => prev.filter(h => h.id !== id));

  // ===== Workers =====
  const addWorker = (w) => {
    const nextNum = workers.length + 1;
    const code = w.code || ('TH' + String(nextNum).padStart(2, '0'));
    setWorkers(prev => [...prev, { ...w, id: generateId(), code, role: 'worker', status: 'active', createdAt: new Date().toISOString() }]);
  };
  const updateWorker = (id, data) => setWorkers(prev => prev.map(w => w.id === id ? { ...w, ...data } : w));

  // ===== Batches =====
  const addBatch = (b) => setBatches(prev => [...prev, { ...b, id: generateId() }]);

  // ===== Requests (Worker creates, Owner approves/rejects) =====
  const createRequest = (req) => setRequests(prev => [...prev, { ...req, id: generateId(), status: 'pending', requestDate: new Date().toISOString(), reviewedBy: null, reviewedAt: null, rejectReason: null }]);

  const approveRequest = useCallback((reqId) => {
    setRequests(prev => prev.map(r => {
      if (r.id !== reqId) return r;
      return { ...r, status: 'approved', reviewedBy: 'owner', reviewedAt: new Date().toISOString() };
    }));
    // Create a distribution automatically
    const req = requests.find(r => r.id === reqId);
    if (req) {
      const dist = {
        id: generateId(),
        requestId: reqId,
        workerId: req.workerId,
        workerName: req.workerName,
        distributedDate: new Date().toISOString(),
        status: 'holding',
        items: req.items.map(it => ({ ...it, quantityGiven: it.quantity, quantityReturned: 0 })),
      };
      setDistributions(prev => [...prev, dist]);
    }
  }, [requests]);

  const rejectRequest = (reqId, reason) => {
    setRequests(prev => prev.map(r => {
      if (r.id !== reqId) return r;
      return { ...r, status: 'rejected', reviewedBy: 'owner', reviewedAt: new Date().toISOString(), rejectReason: reason };
    }));
  };

  // ===== Returns (Worker submits, Owner confirms) =====
  const submitReturn = (ret) => setReturns(prev => [...prev, {
    ...ret, id: generateId(), status: 'pending', returnDate: new Date().toISOString(),
    confirmedBy: null, confirmedAt: null, disputeNote: null
  }]);

  const confirmReturn = useCallback((retId) => {
    setReturns(prev => prev.map(r => {
      if (r.id !== retId) return r;
      return { ...r, status: 'confirmed', confirmedBy: 'owner', confirmedAt: new Date().toISOString() };
    }));
    // Update distribution quantities
    const ret = returns.find(r => r.id === retId);
    if (ret) {
      setDistributions(prev => prev.map(d => {
        if (d.id !== ret.distributionId) return d;
        const newItems = d.items.map(di => {
          const retItem = ret.items.find(ri => ri.hairTypeId === di.hairTypeId);
          if (retItem) return { ...di, quantityReturned: di.quantityReturned + retItem.quantity };
          return di;
        });
        const allDone = newItems.every(it => it.quantityReturned >= it.quantityGiven);
        return { ...d, items: newItems, status: allDone ? 'completed' : 'partial' };
      }));
    }
  }, [returns]);

  const disputeReturn = (retId, note) => {
    setReturns(prev => prev.map(r => {
      if (r.id !== retId) return r;
      return { ...r, status: 'disputed', disputeNote: note };
    }));
  };

  const markReturnsPaid = useCallback((returnIds) => {
    setReturns(prev => prev.map(r => {
      if (returnIds.includes(r.id)) return { ...r, status: 'paid', paidAt: new Date().toISOString() };
      return r;
    }));
  }, []);

  // ===== Payrolls =====
  const createPayroll = (p) => setPayrolls(prev => [...prev, { ...p, id: generateId(), status: 'pending' }]);
  const markPayrollPaid = (id) => setPayrolls(prev => prev.map(p => p.id === id ? { ...p, status: 'paid' } : p));

  // ===== Computed =====
  const pendingRequestsCount = requests.filter(r => r.status === 'pending').length;
  const pendingReturnsCount = returns.filter(r => r.status === 'pending').length;

  const getWorkerDistributions = (workerId) => distributions.filter(d => d.workerId === workerId);
  const getWorkerRequests = (workerId) => requests.filter(r => r.workerId === workerId);
  const getWorkerReturns = (workerId) => returns.filter(r => r.workerId === workerId);

  // Inventory: total received from batches minus total given out in distributions (active)
  const getInventory = useCallback(() => {
    const inv = {};
    // Add from batches
    batches.forEach(b => b.items.forEach(it => {
      if (!inv[it.hairTypeId]) inv[it.hairTypeId] = { hairTypeId: it.hairTypeId, hairTypeName: it.hairTypeName, total: 0, given: 0, available: 0 };
      inv[it.hairTypeId].total += it.quantity;
    }));
    // Subtract from active distributions
    distributions.forEach(d => d.items.forEach(it => {
      if (!inv[it.hairTypeId]) inv[it.hairTypeId] = { hairTypeId: it.hairTypeId, hairTypeName: it.hairTypeName, total: 0, given: 0, available: 0 };
      inv[it.hairTypeId].given += it.quantityGiven;
    }));
    // Add back confirmed returns
    returns.filter(r => r.status === 'confirmed').forEach(r => r.items.forEach(it => {
      if (inv[it.hairTypeId]) inv[it.hairTypeId].given -= it.quantity;
    }));
    Object.values(inv).forEach(v => { v.available = v.total - v.given; });
    return Object.values(inv);
  }, [batches, distributions, returns]);

  const resetAllData = () => {
    setHairTypes(INITIAL_HAIR_TYPES);
    setWorkers(INITIAL_WORKERS);
    setBatches(INITIAL_BATCHES);
    setRequests(INITIAL_REQUESTS);
    setDistributions(INITIAL_DISTRIBUTIONS);
    setReturns(INITIAL_RETURNS);
    setPayrolls(INITIAL_PAYROLLS);
  };

  const value = {
    hairTypes, addHairType, updateHairType, deleteHairType,
    workers, addWorker, updateWorker,
    batches, addBatch,
    requests, createRequest, approveRequest, rejectRequest,
    distributions, getWorkerDistributions,
    returns, submitReturn, confirmReturn, disputeReturn, markReturnsPaid, getWorkerReturns,
    payrolls, createPayroll, markPayrollPaid,
    pendingRequestsCount, pendingReturnsCount,
    getInventory, getWorkerRequests,
    resetAllData,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};
