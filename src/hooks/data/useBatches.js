import { useState, useEffect, useCallback } from 'react';
import { db, isFirebaseConfigured } from '../../firebase';
import { collection, onSnapshot, doc, runTransaction } from 'firebase/firestore';
import { generateId } from '../../utils/formatters';

export const useBatches = (userRole) => {
  const [batches, setBatches] = useState([]);

  useEffect(() => {
    if (!isFirebaseConfigured) return;
    
    // Both worker and owner can read batches. Workers might need it for reference or not, 
    // but the rule allows it.
    const unsub = onSnapshot(collection(db, 'batches'), (snapshot) => {
      const list = [];
      snapshot.forEach(d => list.push({ ...d.data(), id: d.id }));
      setBatches(list);
    });
    return () => unsub();
  }, [userRole]);

  const addBatch = useCallback(async (batch) => {
    if (!isFirebaseConfigured) return;
    
    const id = generateId();
    const newBatch = { ...batch, id, status: 'active', importedAt: new Date().toISOString() };
    
    try {
      await runTransaction(db, async (transaction) => {
        // 1. Lưu batch
        const batchRef = doc(db, 'batches', id);
        transaction.set(batchRef, newBatch);

        // 2. Cập nhật inventory
        for (const item of newBatch.items) {
          const invRef = doc(db, 'inventory', item.hairTypeId);
          const invDoc = await transaction.get(invRef);
          
          if (invDoc.exists()) {
            const currentData = invDoc.data();
            transaction.update(invRef, {
              totalImported: currentData.totalImported + item.quantity,
              rawAvailable: currentData.rawAvailable + item.quantity
            });
          } else {
            transaction.set(invRef, {
              hairTypeId: item.hairTypeId,
              hairTypeName: item.hairTypeName,
              totalImported: item.quantity,
              totalGiven: 0,
              totalReturned: 0,
              rawAvailable: item.quantity,
              finishedAvailable: 0
            });
          }
        }
      });
      return { success: true };
    } catch (err) {
      console.error("Error adding batch:", err);
      return { success: false, message: err.message };
    }
  }, []);

  const updateBatch = useCallback(async (id, data) => {
    // For a real app, updateBatch needs to diff the items and update inventory.
    // To keep it simple and safe for now, if they change items, we recalculate.
    if (!isFirebaseConfigured) return;
    await runTransaction(db, async (transaction) => {
      const batchRef = doc(db, 'batches', id);
      const batchDoc = await transaction.get(batchRef);
      if (!batchDoc.exists()) return;
      
      const oldItems = batchDoc.data().items || [];
      const newItems = data.items || [];
      
      // Reverse old items
      for (const item of oldItems) {
        const invRef = doc(db, 'inventory', item.hairTypeId);
        const invDoc = await transaction.get(invRef);
        if (invDoc.exists()) {
          const invData = invDoc.data();
          transaction.update(invRef, {
            totalImported: invData.totalImported - item.quantity,
            rawAvailable: invData.rawAvailable - item.quantity
          });
        }
      }
      
      // Apply new items
      for (const item of newItems) {
        const invRef = doc(db, 'inventory', item.hairTypeId);
        const invDoc = await transaction.get(invRef);
        if (invDoc.exists()) {
          const invData = invDoc.data();
          transaction.update(invRef, {
            totalImported: invData.totalImported + item.quantity,
            rawAvailable: invData.rawAvailable + item.quantity
          });
        } else {
          transaction.set(invRef, {
            hairTypeId: item.hairTypeId,
            hairTypeName: item.hairTypeName,
            totalImported: item.quantity,
            totalGiven: 0,
            totalReturned: 0,
            rawAvailable: item.quantity,
            finishedAvailable: 0
          });
        }
      }
      
      transaction.update(batchRef, data);
    });
  }, []);

  const deleteBatch = useCallback(async (id) => {
    if (!isFirebaseConfigured) return;
    await runTransaction(db, async (transaction) => {
      const batchRef = doc(db, 'batches', id);
      const batchDoc = await transaction.get(batchRef);
      if (!batchDoc.exists()) return;
      
      const items = batchDoc.data().items || [];
      
      // Reverse items
      for (const item of items) {
        const invRef = doc(db, 'inventory', item.hairTypeId);
        const invDoc = await transaction.get(invRef);
        if (invDoc.exists()) {
          const invData = invDoc.data();
          transaction.update(invRef, {
            totalImported: invData.totalImported - item.quantity,
            rawAvailable: invData.rawAvailable - item.quantity
          });
        }
      }
      
      transaction.delete(batchRef);
    });
  }, []);

  return {
    batches,
    addBatch,
    updateBatch,
    deleteBatch
  };
};
