import { useState, useEffect, useCallback } from 'react';
import { db, isFirebaseConfigured } from '../../firebase';
import { collection, onSnapshot, doc, setDoc, updateDoc, runTransaction, query, where } from 'firebase/firestore';
import { generateId } from '../../utils/formatters';

export const useRequests = (currentUser, userRole) => {
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    if (!isFirebaseConfigured) return;

    let unsub = () => {};
    if (userRole === 'owner') {
      unsub = onSnapshot(collection(db, 'requests'), (snapshot) => {
        const list = [];
        snapshot.forEach(d => list.push({ ...d.data(), id: d.id }));
        list.sort((a, b) => b.requestDate.localeCompare(a.requestDate));
        setRequests(list);
      });
    } else if (userRole === 'worker' && currentUser) {
      unsub = onSnapshot(query(collection(db, 'requests'), where('workerId', '==', currentUser.id)), (snapshot) => {
        const list = [];
        snapshot.forEach(d => list.push({ ...d.data(), id: d.id }));
        list.sort((a, b) => b.requestDate.localeCompare(a.requestDate));
        setRequests(list);
      });
    }
    return () => unsub();
  }, [currentUser, userRole]);

  const createRequest = useCallback(async (req) => {
    if (!isFirebaseConfigured) return;
    const id = generateId();
    await setDoc(doc(db, 'requests', id), { 
      ...req, 
      id, 
      status: 'pending', 
      requestDate: new Date().toISOString(), 
      reviewedBy: null, 
      reviewedAt: null, 
      rejectReason: null 
    });
  }, []);

  const approveRequest = useCallback(async (reqId) => {
    if (!isFirebaseConfigured) return { success: false, message: 'Chưa cấu hình Firebase' };
    
    try {
      await runTransaction(db, async (transaction) => {
        // --- 1. ALL READS ---
        const reqRef = doc(db, 'requests', reqId);
        const reqDoc = await transaction.get(reqRef);
        
        if (!reqDoc.exists()) {
          throw new Error('Không tìm thấy yêu cầu trên hệ thống');
        }
        if (reqDoc.data().status !== 'pending') {
          throw new Error('Yêu cầu này đã được xử lý bởi người khác!');
        }

        const items = reqDoc.data().items;
        
        const invRefs = {};
        const invDocs = {};
        for (const it of items) {
          const invRef = doc(db, 'inventory', it.hairTypeId);
          invRefs[it.hairTypeId] = invRef;
          invDocs[it.hairTypeId] = await transaction.get(invRef);
          
          if (!invDocs[it.hairTypeId].exists()) {
            throw new Error(`Mã tóc ${it.hairTypeName} chưa có trong kho.`);
          }
          const rawAvailable = invDocs[it.hairTypeId].data().rawAvailable || 0;
          if (rawAvailable < it.quantity) {
            throw new Error(`Kho không đủ phôi thô "${it.hairTypeName}". Tồn: ${rawAvailable}, Yêu cầu: ${it.quantity}.`);
          }
        }

        // --- 2. ALL LOGIC AND WRITES ---
        
        // Cập nhật Request
        transaction.update(reqRef, {
          status: 'approved',
          reviewedBy: 'owner',
          reviewedAt: new Date().toISOString()
        });
        
        // Cập nhật Kho (cộng dồn nếu có trùng mã tóc)
        const newInvData = {};
        for (const it of items) {
          if (!newInvData[it.hairTypeId]) {
            const data = invDocs[it.hairTypeId].data();
            newInvData[it.hairTypeId] = {
              totalGiven: data.totalGiven || 0,
              rawAvailable: data.rawAvailable || 0
            };
          }
          newInvData[it.hairTypeId].totalGiven += it.quantity;
          newInvData[it.hairTypeId].rawAvailable -= it.quantity;
        }

        for (const hairTypeId in newInvData) {
          transaction.update(invRefs[hairTypeId], newInvData[hairTypeId]);
        }
        
        // Tạo Distribution
        const distId = generateId();
        const distRef = doc(db, 'distributions', distId);
        transaction.set(distRef, {
          id: distId,
          requestId: reqId,
          workerId: reqDoc.data().workerId,
          workerName: reqDoc.data().workerName,
          distributedDate: new Date().toISOString(),
          status: 'holding',
          items: items.map(it => ({ ...it, quantityGiven: it.quantity, quantityReturned: 0 })),
        });
      });
      return { success: true };
    } catch (err) {
      return { success: false, message: err.message };
    }
  }, []);

  const rejectRequest = useCallback(async (reqId, reason) => {
    if (!isFirebaseConfigured) return;
    await updateDoc(doc(db, 'requests', reqId), {
      status: 'rejected',
      rejectReason: reason,
      reviewedBy: 'owner',
      reviewedAt: new Date().toISOString()
    });
  }, []);

  const getWorkerRequests = useCallback((workerId) => {
    return requests.filter(r => r.workerId === workerId);
  }, [requests]);

  return {
    requests,
    createRequest,
    approveRequest,
    rejectRequest,
    getWorkerRequests
  };
};
