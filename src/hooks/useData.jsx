import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { generateId } from '../utils/formatters';
import { db, isFirebaseConfigured } from '../firebase';
import { collection, onSnapshot, doc, setDoc, updateDoc, deleteDoc, writeBatch, getDocs } from 'firebase/firestore';

const DataContext = createContext();
export const useData = () => useContext(DataContext);

// ===== Danh sách tóc chuẩn (System Catalog) =====
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

export const DataProvider = ({ children }) => {
  const [hairTypes, setHairTypes] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [batches, setBatches] = useState([]);
  const [requests, setRequests] = useState([]);
  const [distributions, setDistributions] = useState([]);
  const [returns, setReturns] = useState([]);
  const [payrolls, setPayrolls] = useState([]);
  const [loading, setLoading] = useState(true);

  // Khởi tạo Database nếu chưa có loại tóc nào
  useEffect(() => {
    if (!isFirebaseConfigured) {
      console.warn("Vui lòng cấu hình Firebase trong file .env!");
      setLoading(false);
      return;
    }

    const initFirebase = async () => {
      try {
        const hairTypesRef = collection(db, 'hairTypes');
        const q = await getDocs(hairTypesRef);
        if (q.empty) {
          console.log("Seeding danh mục tóc chuẩn...");
          const batch = writeBatch(db);
          INITIAL_HAIR_TYPES.forEach(item => batch.set(doc(db, 'hairTypes', item.id), item));
          await batch.commit();
        }
      } catch (err) {
        console.error("Lỗi khi kết nối hoặc khởi tạo Firestore:", err);
      } finally {
        setLoading(false);
      }
    };

    initFirebase();
  }, []);

  // Lắng nghe dữ liệu real-time
  useEffect(() => {
    if (!isFirebaseConfigured) return;

    const unsubHair = onSnapshot(collection(db, 'hairTypes'), (snapshot) => {
      const list = [];
      snapshot.forEach(d => list.push({ ...d.data(), id: d.id }));
      list.sort((a, b) => {
        if (a.size !== b.size) return (a.size || '').localeCompare(b.size || '');
        return (a.technique || '').localeCompare(b.technique || '');
      });
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
  }, []);

  // ===== Hair Types =====
  const addHairType = useCallback(async (ht) => {
    if (!isFirebaseConfigured) return;
    const id = generateId();
    await setDoc(doc(db, 'hairTypes', id), { ...ht, id });
  }, []);
  const updateHairType = useCallback(async (id, data) => {
    if (!isFirebaseConfigured) return;
    await updateDoc(doc(db, 'hairTypes', id), data);
  }, []);
  const deleteHairType = useCallback(async (id) => {
    if (!isFirebaseConfigured) return;
    await deleteDoc(doc(db, 'hairTypes', id));
  }, []);

  // ===== Workers =====
  const generateWorkerCode = useCallback((name) => {
    if (!name) return 'TH' + Math.floor(Math.random() * 1000);
    const normalized = name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D");
    const words = normalized.trim().split(/\s+/);
    let baseCode = "";
    if (words.length === 1) {
      baseCode = words[0].toUpperCase();
    } else {
      const lastName = words[words.length - 1].toUpperCase();
      const initials = words.slice(0, words.length - 1).map(w => w[0].toUpperCase()).join('');
      baseCode = lastName + initials;
    }
    
    let code = baseCode;
    let counter = 1;
    while (workers.some(w => w.code === code)) {
      code = `${baseCode}${counter}`;
      counter++;
    }
    return code;
  }, [workers]);

  const addWorker = useCallback(async (w) => {
    if (!isFirebaseConfigured) return;
    const code = w.code || generateWorkerCode(w.displayName);
    const id = generateId();
    await setDoc(doc(db, 'workers', id), { ...w, id, code, role: 'worker', status: 'active', createdAt: new Date().toISOString() });
  }, [generateWorkerCode]);
  const registerWorker = useCallback(async (w) => {
    if (!isFirebaseConfigured) return;
    const code = generateWorkerCode(w.displayName);
    const id = generateId();
    await setDoc(doc(db, 'workers', id), { ...w, id, code, role: 'worker', status: 'pending', createdAt: new Date().toISOString() });
    return code;
  }, [generateWorkerCode]);
  const updateWorker = useCallback(async (id, data) => {
    if (!isFirebaseConfigured) return;
    await updateDoc(doc(db, 'workers', id), data);
  }, []);

  // ===== Batches =====
  const addBatch = useCallback(async (b) => {
    if (!isFirebaseConfigured) return;
    const id = generateId();
    await setDoc(doc(db, 'batches', id), { ...b, id });
  }, []);
  const updateBatch = useCallback(async (id, data) => {
    if (!isFirebaseConfigured) return;
    await updateDoc(doc(db, 'batches', id), data);
  }, []);
  const deleteBatch = useCallback(async (id) => {
    if (!isFirebaseConfigured) return;
    await deleteDoc(doc(db, 'batches', id));
  }, []);

  // ===== Computed =====
  const getInventory = useCallback(() => {
    const inv = {};
    batches.forEach(b => b.items.forEach(it => {
      if (!inv[it.hairTypeId]) inv[it.hairTypeId] = { hairTypeId: it.hairTypeId, hairTypeName: it.hairTypeName, totalImported: 0, totalGiven: 0, totalReturned: 0, rawAvailable: 0, finishedAvailable: 0 };
      inv[it.hairTypeId].totalImported += it.quantity;
    }));
    distributions.forEach(d => d.items.forEach(it => {
      if (!inv[it.hairTypeId]) inv[it.hairTypeId] = { hairTypeId: it.hairTypeId, hairTypeName: it.hairTypeName, totalImported: 0, totalGiven: 0, totalReturned: 0, rawAvailable: 0, finishedAvailable: 0 };
      inv[it.hairTypeId].totalGiven += it.quantityGiven;
    }));
    returns.filter(r => r.status === 'confirmed').forEach(r => r.items.forEach(it => {
      if (inv[it.hairTypeId]) {
        inv[it.hairTypeId].totalReturned += it.quantity;
      }
    }));
    Object.values(inv).forEach(v => { 
      v.rawAvailable = v.totalImported - v.totalGiven;
      v.finishedAvailable = v.totalReturned;
    });
    return Object.values(inv);
  }, [batches, distributions, returns]);

  // ===== Requests =====
  const createRequest = useCallback(async (req) => {
    if (!isFirebaseConfigured) return;
    const id = generateId();
    await setDoc(doc(db, 'requests', id), { ...req, id, status: 'pending', requestDate: new Date().toISOString(), reviewedBy: null, reviewedAt: null, rejectReason: null });
  }, []);

  const approveRequest = useCallback(async (reqId) => {
    if (!isFirebaseConfigured) return { success: false, message: 'Chưa cấu hình Firebase' };
    const req = requests.find(r => r.id === reqId);
    if (!req) return { success: false, message: 'Không tìm thấy yêu cầu' };

    // Kiểm tra tồn kho phôi thô
    const inventory = getInventory();
    for (const it of req.items) {
      const invItem = inventory.find(inv => inv.hairTypeId === it.hairTypeId);
      const rawAvailable = invItem ? invItem.rawAvailable : 0;
      if (rawAvailable < it.quantity) {
        return { success: false, message: `Kho không đủ phôi thô "${it.hairTypeName}". Tồn: ${rawAvailable}, Yêu cầu: ${it.quantity}.` };
      }
    }

    const batch = writeBatch(db);
    batch.update(doc(db, 'requests', reqId), {
      status: 'approved',
      reviewedBy: 'owner',
      reviewedAt: new Date().toISOString()
    });
    const distId = generateId();
    batch.set(doc(db, 'distributions', distId), {
      id: distId,
      requestId: reqId,
      workerId: req.workerId,
      workerName: req.workerName,
      distributedDate: new Date().toISOString(),
      status: 'holding',
      items: req.items.map(it => ({ ...it, quantityGiven: it.quantity, quantityReturned: 0 })),
    });
    await batch.commit();
    return { success: true };
  }, [requests, getInventory]);

  const rejectRequest = useCallback(async (reqId, reason) => {
    if (!isFirebaseConfigured) return;
    await updateDoc(doc(db, 'requests', reqId), { status: 'rejected', reviewedBy: 'owner', reviewedAt: new Date().toISOString(), rejectReason: reason });
  }, []);

  // ===== Returns =====
  const submitReturn = useCallback(async (ret) => {
    if (!isFirebaseConfigured) return;
    const id = generateId();
    await setDoc(doc(db, 'returns', id), {
      ...ret, id, status: 'pending', returnDate: new Date().toISOString(),
      confirmedBy: null, confirmedAt: null, disputeNote: null
    });
  }, []);

  const confirmReturn = useCallback(async (retId) => {
    if (!isFirebaseConfigured) return;
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
  }, [returns, distributions]);

  const disputeReturn = useCallback(async (retId, note) => {
    if (!isFirebaseConfigured) return;
    await updateDoc(doc(db, 'returns', retId), { status: 'disputed', disputeNote: note });
  }, []);

  const markReturnsPaid = useCallback(async (returnIds) => {
    if (!isFirebaseConfigured) return;
    const batch = writeBatch(db);
    returnIds.forEach(id => {
      batch.update(doc(db, 'returns', id), {
        status: 'paid',
        paidAt: new Date().toISOString()
      });
    });
    await batch.commit();
  }, []);

  // ===== Payrolls =====
  const createPayroll = useCallback(async (p) => {
    if (!isFirebaseConfigured) return;
    const id = generateId();
    await setDoc(doc(db, 'payrolls', id), { ...p, id, status: 'pending' });
  }, []);
  const markPayrollPaid = useCallback(async (id) => {
    if (!isFirebaseConfigured) return;
    await updateDoc(doc(db, 'payrolls', id), { status: 'paid' });
  }, []);

  // ===== Computed =====
  const pendingRequestsCount = useMemo(() => requests.filter(r => r.status === 'pending').length, [requests]);
  const pendingReturnsCount = useMemo(() => returns.filter(r => r.status === 'pending').length, [returns]);
  const pendingWorkersCount = useMemo(() => workers.filter(w => w.status === 'pending').length, [workers]);

  const getWorkerDistributions = useCallback((workerId) => distributions.filter(d => d.workerId === workerId), [distributions]);
  const getWorkerRequests = useCallback((workerId) => requests.filter(r => r.workerId === workerId), [requests]);
  const getWorkerReturns = useCallback((workerId) => returns.filter(r => r.workerId === workerId), [returns]);



  const value = {
    hairTypes, addHairType, updateHairType, deleteHairType,
    workers, addWorker, updateWorker, registerWorker,
    batches, addBatch, updateBatch, deleteBatch,
    requests, createRequest, approveRequest, rejectRequest,
    distributions, getWorkerDistributions,
    returns, submitReturn, confirmReturn, disputeReturn, markReturnsPaid, getWorkerReturns,
    payrolls, createPayroll, markPayrollPaid,
    pendingRequestsCount, pendingReturnsCount, pendingWorkersCount,
    getInventory, getWorkerRequests,
    loading
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};
