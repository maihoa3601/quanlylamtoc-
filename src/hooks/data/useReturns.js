import { useState, useEffect, useCallback } from 'react';
import { db, isFirebaseConfigured } from '../../firebase';
import { collection, onSnapshot, doc, updateDoc, setDoc, runTransaction, query, where } from 'firebase/firestore';
import { generateId } from '../../utils/formatters';

export const useReturns = (currentUser, userRole, hairTypes) => {
  const [returns, setReturns] = useState([]);

  useEffect(() => {
    if (!isFirebaseConfigured) return;

    let unsub = () => {};
    if (userRole === 'owner') {
      unsub = onSnapshot(collection(db, 'returns'), (snapshot) => {
        const list = [];
        snapshot.forEach(d => list.push({ ...d.data(), id: d.id }));
        setReturns(list);
      });
    } else if (userRole === 'worker' && currentUser) {
      unsub = onSnapshot(query(collection(db, 'returns'), where('workerId', '==', currentUser.id)), (snapshot) => {
        const list = [];
        snapshot.forEach(d => list.push({ ...d.data(), id: d.id }));
        setReturns(list);
      });
    }
    return () => unsub();
  }, [currentUser, userRole]);

  const submitReturn = useCallback(async (retData) => {
    if (!isFirebaseConfigured) return;
    const id = generateId();
    await setDoc(doc(db, 'returns', id), { 
      ...retData, 
      id, 
      status: 'pending', 
      returnDate: new Date().toISOString() 
    });
  }, []);

  const confirmReturn = useCallback(async (returnId) => {
    if (!isFirebaseConfigured) return { success: false, message: 'Chưa cấu hình Firebase' };

    try {
      await runTransaction(db, async (transaction) => {
        const retRef = doc(db, 'returns', returnId);
        const retDoc = await transaction.get(retRef);
        
        if (!retDoc.exists()) {
          throw new Error('Không tìm thấy phiếu trả');
        }
        if (retDoc.data().status === 'confirmed' || retDoc.data().status === 'paid') {
          throw new Error('Phiếu trả này đã được xác nhận hoặc đã thanh toán!');
        }

        const data = retDoc.data();

        // READ: Distribution
        const distRef = doc(db, 'distributions', data.distributionId);
        const distDoc = await transaction.get(distRef);
        
        if (!distDoc.exists()) {
          throw new Error('Không tìm thấy phiếu phát gốc');
        }
        const distData = distDoc.data();

        // READ: Inventory for all items
        const invRefs = {};
        const invDocs = {};
        for (const it of data.items) {
          const invRef = doc(db, 'inventory', it.hairTypeId);
          invRefs[it.hairTypeId] = invRef;
          invDocs[it.hairTypeId] = await transaction.get(invRef);
        }

        // CALCULATIONS & WRITES
        let totalAmount = 0;
        const updatedItems = [];
        let currentDistItems = [...distData.items];
        const newInvData = {};

        for (const it of data.items) {
          const distItemIndex = currentDistItems.findIndex(di => di.hairTypeId === it.hairTypeId);
          
          if (distItemIndex === -1) {
            throw new Error(`Không tìm thấy mã tóc ${it.hairTypeName} trong phiếu phát`);
          }

          const distItem = currentDistItems[distItemIndex];
          const alreadyReturned = distItem.quantityReturned || 0;
          const maxAllowed = distItem.quantityGiven - alreadyReturned;
          
          const actualReturn = Math.min(it.quantity, maxAllowed);
          if (actualReturn < 0) {
            throw new Error(`Lỗi logic: Số lượng trả <= 0 cho ${it.hairTypeName}`);
          }

          let unitPrice = it.unitPrice;
          if (!unitPrice || unitPrice === 0) {
            const hType = hairTypes.find(h => h.id === it.hairTypeId);
            unitPrice = hType ? hType.unitPrice : 0;
          }

          const amount = actualReturn * unitPrice;
          totalAmount += amount;

          updatedItems.push({
            ...it,
            quantity: actualReturn,
            unitPrice,
            subtotal: amount // fixed property from 'amount' to 'subtotal'
          });

          // Update dist item
          currentDistItems[distItemIndex] = { 
            ...distItem, 
            quantityReturned: alreadyReturned + actualReturn 
          };

          // Aggregate inventory changes
          if (!newInvData[it.hairTypeId]) {
            const docData = invDocs[it.hairTypeId].exists() ? invDocs[it.hairTypeId].data() : { totalReturned: 0, finishedAvailable: 0 };
            newInvData[it.hairTypeId] = {
              totalReturned: docData.totalReturned || 0,
              finishedAvailable: docData.finishedAvailable || 0
            };
          }
          newInvData[it.hairTypeId].totalReturned += actualReturn;
          newInvData[it.hairTypeId].finishedAvailable += actualReturn;
        }

        // Determine correct distribution status
        const allDone = currentDistItems.every(di => di.quantityGiven === (di.quantityReturned || 0));
        const anyReturned = currentDistItems.some(di => (di.quantityReturned || 0) > 0);
        
        let distStatus = 'holding';
        if (allDone) {
          distStatus = 'completed';
        } else if (anyReturned) {
          distStatus = 'partial';
        }

        // WRITE: Distribution
        transaction.update(distRef, {
          items: currentDistItems,
          status: distStatus
        });

        // WRITE: Inventory
        for (const hairTypeId in newInvData) {
          transaction.update(invRefs[hairTypeId], {
            totalReturned: newInvData[hairTypeId].totalReturned,
            finishedAvailable: newInvData[hairTypeId].finishedAvailable
          });
        }

        // WRITE: Return
        transaction.update(retRef, {
          status: 'confirmed',
          confirmedAt: new Date().toISOString(),
          items: updatedItems,
          totalAmount
        });
      });
      return { success: true };
    } catch (err) {
      return { success: false, message: err.message };
    }
  }, [hairTypes]);

  const disputeReturn = useCallback(async (returnId, reason) => {
    if (!isFirebaseConfigured) return;
    await updateDoc(doc(db, 'returns', returnId), {
      status: 'disputed',
      disputeReason: reason,
      disputedAt: new Date().toISOString()
    });
  }, []);

  const markReturnsPaid = useCallback(async (returnIds) => {
    if (!isFirebaseConfigured) return { success: false, message: 'Chưa cấu hình Firebase' };
    if (!returnIds || returnIds.length === 0) return { success: true };
    try {
      await runTransaction(db, async (transaction) => {
        const refs = [];
        const docs = [];
        for (const rId of returnIds) {
          const rRef = doc(db, 'returns', rId);
          refs.push(rRef);
          docs.push(await transaction.get(rRef));
        }
        for (let i = 0; i < docs.length; i++) {
          if (!docs[i].exists()) {
            throw new Error(`Không tìm thấy phiếu trả ${returnIds[i]}`);
          }
          const status = docs[i].data().status;
          if (status === 'paid') {
            throw new Error(`Phiếu trả #${returnIds[i].slice(-5)} đã được thanh toán.`);
          }
          if (status !== 'confirmed') {
            throw new Error(`Phiếu trả #${returnIds[i].slice(-5)} chưa xác nhận, không thể thanh toán.`);
          }
          transaction.update(refs[i], {
            status: 'paid',
            paidAt: new Date().toISOString()
          });
        }
      });
      return { success: true };
    } catch (err) {
      return { success: false, message: err.message };
    }
  }, []);

  const getWorkerReturns = useCallback((workerId) => {
    return returns.filter(r => r.workerId === workerId);
  }, [returns]);

  return {
    returns,
    submitReturn,
    confirmReturn,
    disputeReturn,
    markReturnsPaid,
    getWorkerReturns
  };
};
