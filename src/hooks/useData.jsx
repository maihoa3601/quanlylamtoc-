import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { generateId } from '../utils/formatters';
import { db, isFirebaseConfigured } from '../firebase';
import { collection, onSnapshot, doc, setDoc, updateDoc, deleteDoc, writeBatch, getDocs } from 'firebase/firestore';

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
  const [hairTypes, setHairTypes] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [batches, setBatches] = useState([]);
  const [requests, setRequests] = useState([]);
  const [distributions, setDistributions] = useState([]);
  const [returns, setReturns] = useState([]);
  const [payrolls, setPayrolls] = useState([]);

  // Seeding initial data if collections are empty (Only in Firestore mode)
  useEffect(() => {
    if (!isFirebaseConfigured) {
      // LocalStorage mode initialization
      const loadedHair = loadState('hairTypes', INITIAL_HAIR_TYPES);
      if (!Array.isArray(loadedHair) || loadedHair.length < 20 || loadedHair.some(h => !h.size || !h.technique || h.buyPrice !== undefined)) {
        saveState('hairTypes', INITIAL_HAIR_TYPES);
        setHairTypes(INITIAL_HAIR_TYPES);
      } else {
        setHairTypes(loadedHair);
      }
      setWorkers(loadState('workers', INITIAL_WORKERS));
      setBatches(loadState('batches', INITIAL_BATCHES));
      setRequests(loadState('requests', INITIAL_REQUESTS));
      setDistributions(loadState('distributions', INITIAL_DISTRIBUTIONS));
      setReturns(loadState('returns', INITIAL_RETURNS));
      setPayrolls(loadState('payrolls', INITIAL_PAYROLLS));
      return;
    }

    const initFirebase = async () => {
      try {
        const hairTypesRef = collection(db, 'hairTypes');
        const q = await getDocs(hairTypesRef);
        if (q.empty) {
          console.log("Seeding initial mock data to Firestore...");
          const batch = writeBatch(db);
          INITIAL_HAIR_TYPES.forEach(item => batch.set(doc(db, 'hairTypes', item.id), item));
          INITIAL_WORKERS.forEach(item => batch.set(doc(db, 'workers', item.id), item));
          INITIAL_BATCHES.forEach(item => batch.set(doc(db, 'batches', item.id), item));
          INITIAL_REQUESTS.forEach(item => batch.set(doc(db, 'requests', item.id), item));
          INITIAL_DISTRIBUTIONS.forEach(item => batch.set(doc(db, 'distributions', item.id), item));
          INITIAL_RETURNS.forEach(item => batch.set(doc(db, 'returns', item.id), item));
          await batch.commit();
          console.log("Seeding completed successfully.");
        }
      } catch (err) {
        console.error("Error seeding data to Firestore:", err);
      }
    };

    initFirebase();
  }, []);

  // Sync from Firestore (if configured)
  useEffect(() => {
    if (!isFirebaseConfigured) return;

    const unsubHair = onSnapshot(collection(db, 'hairTypes'), (snapshot) => {
      const list = [];
      snapshot.forEach(d => list.push({ ...d.data(), id: d.id }));
      setHairTypes(list);
    });

    const unsubWorkers = onSnapshot(collection(db, 'workers'), (snapshot) => {
      const list = [];
      snapshot.forEach(d => list.push({ ...d.data(), id: d.id }));
      setWorkers(list);
    });

    const unsubBatches = onSnapshot(collection(db, 'batches'), (snapshot) => {
      const list = [];
      snapshot.forEach(d => list.push({ ...d.data(), id: d.id }));
      setBatches(list);
    });

    const unsubRequests = onSnapshot(collection(db, 'requests'), (snapshot) => {
      const list = [];
      snapshot.forEach(d => list.push({ ...d.data(), id: d.id }));
      list.sort((a, b) => b.requestDate.localeCompare(a.requestDate));
      setRequests(list);
    });

    const unsubDists = onSnapshot(collection(db, 'distributions'), (snapshot) => {
      const list = [];
      snapshot.forEach(d => list.push({ ...d.data(), id: d.id }));
      setDistributions(list);
    });

    const unsubReturns = onSnapshot(collection(db, 'returns'), (snapshot) => {
      const list = [];
      snapshot.forEach(d => list.push({ ...d.data(), id: d.id }));
      setReturns(list);
    });

    const unsubPayrolls = onSnapshot(collection(db, 'payrolls'), (snapshot) => {
      const list = [];
      snapshot.forEach(d => list.push({ ...d.data(), id: d.id }));
      setPayrolls(list);
    });

    return () => {
      unsubHair();
      unsubWorkers();
      unsubBatches();
      unsubRequests();
      unsubDists();
      unsubReturns();
      unsubPayrolls();
    };
  }, [isFirebaseConfigured]);

  // Persist to LocalStorage (Only in LocalStorage fallback mode)
  useEffect(() => { if (!isFirebaseConfigured && hairTypes.length > 0) saveState('hairTypes', hairTypes); }, [hairTypes, isFirebaseConfigured]);
  useEffect(() => { if (!isFirebaseConfigured && workers.length > 0) saveState('workers', workers); }, [workers, isFirebaseConfigured]);
  useEffect(() => { if (!isFirebaseConfigured && batches.length > 0) saveState('batches', batches); }, [batches, isFirebaseConfigured]);
  useEffect(() => { if (!isFirebaseConfigured && requests.length > 0) saveState('requests', requests); }, [requests, isFirebaseConfigured]);
  useEffect(() => { if (!isFirebaseConfigured && distributions.length > 0) saveState('distributions', distributions); }, [distributions, isFirebaseConfigured]);
  useEffect(() => { if (!isFirebaseConfigured && returns.length > 0) saveState('returns', returns); }, [returns, isFirebaseConfigured]);
  useEffect(() => { if (!isFirebaseConfigured && payrolls.length > 0) saveState('payrolls', payrolls); }, [payrolls, isFirebaseConfigured]);

  // ===== Hair Types =====
  const addHairType = async (ht) => {
    const id = generateId();
    if (isFirebaseConfigured) {
      await setDoc(doc(db, 'hairTypes', id), { ...ht, id });
    } else {
      setHairTypes(prev => [...prev, { ...ht, id }]);
    }
  };

  const updateHairType = async (id, data) => {
    if (isFirebaseConfigured) {
      await updateDoc(doc(db, 'hairTypes', id), data);
    } else {
      setHairTypes(prev => prev.map(h => h.id === id ? { ...h, ...data } : h));
    }
  };

  const deleteHairType = async (id) => {
    if (isFirebaseConfigured) {
      await deleteDoc(doc(db, 'hairTypes', id));
    } else {
      setHairTypes(prev => prev.filter(h => h.id !== id));
    }
  };

  // ===== Workers =====
  const addWorker = async (w) => {
    const nextNum = workers.length + 1;
    const code = w.code || ('TH' + String(nextNum).padStart(2, '0'));
    const id = generateId();
    const workerData = { ...w, id, code, role: 'worker', status: 'active', createdAt: new Date().toISOString() };
    if (isFirebaseConfigured) {
      await setDoc(doc(db, 'workers', id), workerData);
    } else {
      setWorkers(prev => [...prev, workerData]);
    }
  };

  const updateWorker = async (id, data) => {
    if (isFirebaseConfigured) {
      await updateDoc(doc(db, 'workers', id), data);
    } else {
      setWorkers(prev => prev.map(w => w.id === id ? { ...w, ...data } : w));
    }
  };

  // ===== Batches =====
  const addBatch = async (b) => {
    const id = generateId();
    const batchData = { ...b, id };
    if (isFirebaseConfigured) {
      await setDoc(doc(db, 'batches', id), batchData);
    } else {
      setBatches(prev => [...prev, batchData]);
    }
  };

  // ===== Requests =====
  const createRequest = async (req) => {
    const id = generateId();
    const reqData = { ...req, id, status: 'pending', requestDate: new Date().toISOString(), reviewedBy: null, reviewedAt: null, rejectReason: null };
    if (isFirebaseConfigured) {
      await setDoc(doc(db, 'requests', id), reqData);
    } else {
      setRequests(prev => [...prev, reqData]);
    }
  };

  const approveRequest = useCallback(async (reqId) => {
    if (isFirebaseConfigured) {
      const req = requests.find(r => r.id === reqId);
      if (!req) return;
      const batch = writeBatch(db);
      batch.update(doc(db, 'requests', reqId), {
        status: 'approved',
        reviewedBy: 'owner',
        reviewedAt: new Date().toISOString()
      });
      const distId = generateId();
      const distData = {
        id: distId,
        requestId: reqId,
        workerId: req.workerId,
        workerName: req.workerName,
        distributedDate: new Date().toISOString(),
        status: 'holding',
        items: req.items.map(it => ({ ...it, quantityGiven: it.quantity, quantityReturned: 0 })),
      };
      batch.set(doc(db, 'distributions', distId), distData);
      await batch.commit();
    } else {
      setRequests(prev => prev.map(r => {
        if (r.id !== reqId) return r;
        return { ...r, status: 'approved', reviewedBy: 'owner', reviewedAt: new Date().toISOString() };
      }));
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
    }
  }, [requests, isFirebaseConfigured]);

  const rejectRequest = async (reqId, reason) => {
    const updateData = { status: 'rejected', reviewedBy: 'owner', reviewedAt: new Date().toISOString(), rejectReason: reason };
    if (isFirebaseConfigured) {
      await updateDoc(doc(db, 'requests', reqId), updateData);
    } else {
      setRequests(prev => prev.map(r => {
        if (r.id !== reqId) return r;
        return { ...r, ...updateData };
      }));
    }
  };

  // ===== Returns =====
  const submitReturn = async (ret) => {
    const id = generateId();
    const retData = {
      ...ret, id, status: 'pending', returnDate: new Date().toISOString(),
      confirmedBy: null, confirmedAt: null, disputeNote: null
    };
    if (isFirebaseConfigured) {
      await setDoc(doc(db, 'returns', id), retData);
    } else {
      setReturns(prev => [...prev, retData]);
    }
  };

  const confirmReturn = useCallback(async (retId) => {
    if (isFirebaseConfigured) {
      const ret = returns.find(r => r.id === retId);
      if (!ret) return;
      const dist = distributions.find(d => d.id === ret.distributionId);
      if (!dist) return;

      const batch = writeBatch(db);
      batch.update(doc(db, 'returns', retId), {
        status: 'confirmed',
        confirmedBy: 'owner',
        confirmedAt: new Date().toISOString()
      });

      const newItems = dist.items.map(di => {
        const retItem = ret.items.find(ri => ri.hairTypeId === di.hairTypeId);
        if (retItem) return { ...di, quantityReturned: di.quantityReturned + retItem.quantity };
        return di;
      });
      const allDone = newItems.every(it => it.quantityReturned >= it.quantityGiven);

      batch.update(doc(db, 'distributions', dist.id), {
        items: newItems,
        status: allDone ? 'completed' : 'partial'
      });

      await batch.commit();
    } else {
      setReturns(prev => prev.map(r => {
        if (r.id !== retId) return r;
        return { ...r, status: 'confirmed', confirmedBy: 'owner', confirmedAt: new Date().toISOString() };
      }));
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
    }
  }, [returns, distributions, isFirebaseConfigured]);

  const disputeReturn = async (retId, note) => {
    const updateData = { status: 'disputed', disputeNote: note };
    if (isFirebaseConfigured) {
      await updateDoc(doc(db, 'returns', retId), updateData);
    } else {
      setReturns(prev => prev.map(r => {
        if (r.id !== retId) return r;
        return { ...r, ...updateData };
      }));
    }
  };

  const markReturnsPaid = useCallback(async (returnIds) => {
    if (isFirebaseConfigured) {
      const batch = writeBatch(db);
      returnIds.forEach(id => {
        batch.update(doc(db, 'returns', id), {
          status: 'paid',
          paidAt: new Date().toISOString()
        });
      });
      await batch.commit();
    } else {
      setReturns(prev => prev.map(r => {
        if (returnIds.includes(r.id)) return { ...r, status: 'paid', paidAt: new Date().toISOString() };
        return r;
      }));
    }
  }, [isFirebaseConfigured]);

  // ===== Payrolls =====
  const createPayroll = async (p) => {
    const id = generateId();
    const payrollData = { ...p, id, status: 'pending' };
    if (isFirebaseConfigured) {
      await setDoc(doc(db, 'payrolls', id), payrollData);
    } else {
      setPayrolls(prev => [...prev, payrollData]);
    }
  };

  const markPayrollPaid = async (id) => {
    if (isFirebaseConfigured) {
      await updateDoc(doc(db, 'payrolls', id), { status: 'paid' });
    } else {
      setPayrolls(prev => prev.map(p => p.id === id ? { ...p, status: 'paid' } : p));
    }
  };

  // ===== Computed =====
  const pendingRequestsCount = requests.filter(r => r.status === 'pending').length;
  const pendingReturnsCount = returns.filter(r => r.status === 'pending').length;

  const getWorkerDistributions = (workerId) => distributions.filter(d => d.workerId === workerId);
  const getWorkerRequests = (workerId) => requests.filter(r => r.workerId === workerId);
  const getWorkerReturns = (workerId) => returns.filter(r => r.workerId === workerId);

  const getInventory = useCallback(() => {
    const inv = {};
    batches.forEach(b => b.items.forEach(it => {
      if (!inv[it.hairTypeId]) inv[it.hairTypeId] = { hairTypeId: it.hairTypeId, hairTypeName: it.hairTypeName, total: 0, given: 0, available: 0 };
      inv[it.hairTypeId].total += it.quantity;
    }));
    distributions.forEach(d => d.items.forEach(it => {
      if (!inv[it.hairTypeId]) inv[it.hairTypeId] = { hairTypeId: it.hairTypeId, hairTypeName: it.hairTypeName, total: 0, given: 0, available: 0 };
      inv[it.hairTypeId].given += it.quantityGiven;
    }));
    returns.filter(r => r.status === 'confirmed').forEach(r => r.items.forEach(it => {
      if (inv[it.hairTypeId]) inv[it.hairTypeId].given -= it.quantity;
    }));
    Object.values(inv).forEach(v => { v.available = v.total - v.given; });
    return Object.values(inv);
  }, [batches, distributions, returns]);

  const resetAllData = async () => {
    if (isFirebaseConfigured) {
      try {
        const batch = writeBatch(db);
        hairTypes.forEach(h => batch.delete(doc(db, 'hairTypes', h.id)));
        workers.forEach(w => batch.delete(doc(db, 'workers', w.id)));
        batches.forEach(b => batch.delete(doc(db, 'batches', b.id)));
        requests.forEach(r => batch.delete(doc(db, 'requests', r.id)));
        distributions.forEach(d => batch.delete(doc(db, 'distributions', d.id)));
        returns.forEach(r => batch.delete(doc(db, 'returns', r.id)));
        payrolls.forEach(p => batch.delete(doc(db, 'payrolls', p.id)));
        await batch.commit();

        const seedBatch = writeBatch(db);
        INITIAL_HAIR_TYPES.forEach(item => seedBatch.set(doc(db, 'hairTypes', item.id), item));
        INITIAL_WORKERS.forEach(item => seedBatch.set(doc(db, 'workers', item.id), item));
        INITIAL_BATCHES.forEach(item => seedBatch.set(doc(db, 'batches', item.id), item));
        INITIAL_REQUESTS.forEach(item => seedBatch.set(doc(db, 'requests', item.id), item));
        INITIAL_DISTRIBUTIONS.forEach(item => seedBatch.set(doc(db, 'distributions', item.id), item));
        INITIAL_RETURNS.forEach(item => seedBatch.set(doc(db, 'returns', item.id), item));
        await seedBatch.commit();
      } catch (err) {
        console.error("Error resetting data:", err);
      }
    } else {
      setHairTypes(INITIAL_HAIR_TYPES);
      setWorkers(INITIAL_WORKERS);
      setBatches(INITIAL_BATCHES);
      setRequests(INITIAL_REQUESTS);
      setDistributions(INITIAL_DISTRIBUTIONS);
      setReturns(INITIAL_RETURNS);
      setPayrolls(INITIAL_PAYROLLS);
    }
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
