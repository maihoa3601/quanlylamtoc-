import { useState, useEffect, useCallback } from 'react';
import { db, isFirebaseConfigured } from '../../firebase';
import { collection, onSnapshot, doc, setDoc, query, where, writeBatch, runTransaction } from 'firebase/firestore';
import { generateId } from '../../utils/formatters';

export const usePayrolls = (currentUser, userRole) => {
  const [payrolls, setPayrolls] = useState([]);

  useEffect(() => {
    if (!isFirebaseConfigured) return;

    let unsub = () => {};
    if (userRole === 'owner') {
      unsub = onSnapshot(collection(db, 'payrolls'), (snapshot) => {
        const list = [];
        snapshot.forEach(d => list.push({ ...d.data(), id: d.id }));
        setPayrolls(list);
      });
    } else if (userRole === 'worker' && currentUser) {
      unsub = onSnapshot(query(collection(db, 'payrolls'), where('workerId', '==', currentUser.id)), (snapshot) => {
        const list = [];
        snapshot.forEach(d => list.push({ ...d.data(), id: d.id }));
        setPayrolls(list);
      });
    }
    return () => unsub();
  }, [currentUser, userRole]);

  const generatePayroll = useCallback(async (workerId, workerName, amount, returnIds) => {
    if (!isFirebaseConfigured) return;
    try {
      await runTransaction(db, async (transaction) => {
        // 1. All reads
        const rRefs = [];
        const rDocs = [];
        for (const rId of returnIds) {
          const rRef = doc(db, 'returns', rId);
          rRefs.push(rRef);
          rDocs.push(await transaction.get(rRef));
        }

        // 2. All writes
        for (let i = 0; i < rDocs.length; i++) {
          if (!rDocs[i].exists()) {
            throw new Error(`Không tìm thấy phiếu trả ${returnIds[i]}`);
          }
          if (rDocs[i].data().status === 'paid') {
            throw new Error(`Phiếu trả ${returnIds[i]} đã được thanh toán.`);
          }
          transaction.update(rRefs[i], { status: 'paid' });
        }
        
        const id = generateId();
        const prRef = doc(db, 'payrolls', id);
        transaction.set(prRef, {
          id,
          workerId,
          workerName,
          amount,
          returnIds,
          date: new Date().toISOString()
        });
      });
      return { success: true };
    } catch (err) {
      return { success: false, message: err.message };
    }
  }, []);

  return {
    payrolls,
    generatePayroll
  };
};
