import { useState, useEffect, useCallback } from 'react';
import { db, isFirebaseConfigured, auth, firebaseConfig } from '../../firebase';
import { collection, onSnapshot, doc, setDoc, updateDoc, deleteDoc, query, where } from 'firebase/firestore';
import { createUserWithEmailAndPassword, deleteUser, getAuth } from 'firebase/auth';
import { initializeApp } from 'firebase/app';
import { generateId } from '../../utils/formatters';

export const useWorkers = (currentUser, userRole) => {
  const [workers, setWorkers] = useState([]);

  useEffect(() => {
    if (!isFirebaseConfigured) return;
    
    let unsub = () => {};
    if (userRole === 'owner') {
      unsub = onSnapshot(collection(db, 'workers'), (snapshot) => {
        const list = [];
        snapshot.forEach(d => list.push({ ...d.data(), id: d.id }));
        setWorkers(list);
      });
    } else if (userRole === 'worker' && currentUser) {
      unsub = onSnapshot(query(collection(db, 'workers'), where('id', '==', currentUser.id)), (snapshot) => {
        const list = [];
        snapshot.forEach(d => list.push({ ...d.data(), id: d.id }));
        setWorkers(list);
      });
    }
    return () => unsub();
  }, [currentUser, userRole]);

  const generateWorkerCode = useCallback((name) => {
    const parts = name.trim().split(' ');
    const last = parts[parts.length - 1].toUpperCase();
    const prefix = 'TH' + last;
    let count = 1;
    let code = prefix + String(count).padStart(2, '0');
    while (workers.some(w => w.code === code)) {
      count++;
      code = prefix + String(count).padStart(2, '0');
    }
    return code;
  }, [workers]);

  const registerWorker = useCallback(async (w) => {
    if (!isFirebaseConfigured || !auth) return { error: 'Chưa cấu hình Firebase Auth' };
    const existing = workers.find(x => x.phone === w.phone);
    if (existing) {
      return { error: `Số điện thoại này đã được đăng ký với mã thợ là ${existing.code}` };
    }
    const code = generateWorkerCode(w.displayName);
    const email = `${code.toLowerCase()}@quanlylamtoc.app`;
    let cred = null;
    let secondaryApp = null;
    
    try {
      // Use a secondary Firebase app to create the user so the Owner isn't logged out
      secondaryApp = initializeApp(firebaseConfig, "WorkerRegistrationApp");
      const secondaryAuth = getAuth(secondaryApp);
      
      cred = await createUserWithEmailAndPassword(secondaryAuth, email, w.pin);
      const id = cred.user.uid;
      const workerData = { 
        id,
        displayName: w.displayName, 
        phone: w.phone, 
        code, 
        role: 'worker', 
        status: 'pending', 
        createdAt: new Date().toISOString(),
        ...(w.address ? { address: w.address } : {})
      };
      
      await setDoc(doc(db, 'workers', id), workerData);
      
      // Clean up the secondary app memory
      if (secondaryApp) {
        import('firebase/app').then(m => m.deleteApp(secondaryApp)).catch(() => {});
      }
      return code;
    } catch (e) {
      // If Firestore write failed but Auth user was created, clean up orphan
      if (cred && cred.user) {
        try { await deleteUser(cred.user); } catch (_) {}
      }
      if (secondaryApp) {
        import('firebase/app').then(m => m.deleteApp(secondaryApp)).catch(() => {});
      }
      
      if (e.code === 'auth/weak-password') return { error: 'Mã PIN phải từ 6 ký tự trở lên' };
      return { error: 'Lỗi đăng ký: ' + e.message };
    }
  }, [generateWorkerCode, workers]);

  const addWorker = useCallback(async (w) => {
    if (!isFirebaseConfigured) return;
    const existing = workers.find(x => x.phone === w.phone);
    if (existing) {
      return { error: `Số điện thoại này đã được đăng ký với mã thợ là ${existing.code}` };
    }
    const code = generateWorkerCode(w.displayName);
    const id = generateId(); // Temporary ID until they register auth
    await setDoc(doc(db, 'workers', id), { ...w, id, code, role: 'worker', status: 'pending', createdAt: new Date().toISOString() });
    return code;
  }, [generateWorkerCode, workers]);

  const updateWorker = useCallback(async (id, data) => {
    if (!isFirebaseConfigured) return;
    await updateDoc(doc(db, 'workers', id), data);
  }, []);

  const deleteWorker = useCallback(async (id) => {
    if (!isFirebaseConfigured) return;
    await deleteDoc(doc(db, 'workers', id));
  }, []);

  const getWorkerName = useCallback((id) => {
    return workers.find(w => w.id === id)?.displayName || 'Không rõ';
  }, [workers]);

  const getWorkerPhone = useCallback((id) => {
    return workers.find(w => w.id === id)?.phone || '';
  }, [workers]);

  return {
    workers,
    registerWorker,
    addWorker,
    updateWorker,
    deleteWorker,
    getWorkerName,
    getWorkerPhone
  };
};
