import { useState, useEffect } from 'react';
import { db, isFirebaseConfigured } from '../../firebase';
import { collection, onSnapshot, getDocs, writeBatch, doc } from 'firebase/firestore';

export const useInventory = (hairTypes) => {
  const [inventory, setInventory] = useState([]);
  
  useEffect(() => {
    if (!isFirebaseConfigured) return;
    
    // Auto migration: if inventory is empty, calculate from batches, distributions, returns
    const migrateInventory = async () => {
      const invRef = collection(db, 'inventory');
      const q = await getDocs(invRef);
      if (q.empty && hairTypes.length > 0) {
        console.log("Migration: Tự động tính toán và tạo collection inventory...");
        // Fetch all data
        const [batchesSnap, distsSnap, returnsSnap] = await Promise.all([
          getDocs(collection(db, 'batches')),
          getDocs(collection(db, 'distributions')),
          getDocs(collection(db, 'returns'))
        ]);
        
        const invMap = {};
        batchesSnap.forEach(d => {
          d.data().items.forEach(it => {
            if (!invMap[it.hairTypeId]) invMap[it.hairTypeId] = { hairTypeId: it.hairTypeId, hairTypeName: it.hairTypeName || 'Unknown', totalImported: 0, totalGiven: 0, totalReturned: 0, rawAvailable: 0, finishedAvailable: 0 };
            invMap[it.hairTypeId].totalImported += it.quantity;
          });
        });
        distsSnap.forEach(d => {
          d.data().items.forEach(it => {
            if (!invMap[it.hairTypeId]) invMap[it.hairTypeId] = { hairTypeId: it.hairTypeId, hairTypeName: it.hairTypeName || 'Unknown', totalImported: 0, totalGiven: 0, totalReturned: 0, rawAvailable: 0, finishedAvailable: 0 };
            invMap[it.hairTypeId].totalGiven += it.quantityGiven;
          });
        });
        returnsSnap.forEach(d => {
          const r = d.data();
          if (r.status === 'confirmed' || r.status === 'paid') {
            r.items.forEach(it => {
              if (invMap[it.hairTypeId]) {
                invMap[it.hairTypeId].totalReturned += it.quantity;
              }
            });
          }
        });
        
        const batch = writeBatch(db);
        Object.values(invMap).forEach(v => {
          v.rawAvailable = v.totalImported - v.totalGiven;
          v.finishedAvailable = v.totalReturned;
          
          // Điền tên đúng từ hairTypes nếu Unknown
          const ht = hairTypes.find(h => h.id === v.hairTypeId);
          if (ht) {
             v.hairTypeName = ht.size + ' - ' + ht.technique;
          }
          
          batch.set(doc(db, 'inventory', v.hairTypeId), v);
        });
        await batch.commit();
        console.log("Migration hoàn tất.");
      }
    };
    
    migrateInventory();

    const unsub = onSnapshot(collection(db, 'inventory'), (snapshot) => {
      const list = [];
      snapshot.forEach(d => list.push({ ...d.data(), id: d.id }));
      setInventory(list);
    });
    
    return () => unsub();
  }, [hairTypes]);

  const getInventory = () => {
    return inventory;
  };

  const getWorkerInventory = (distributions, returns, workerId) => {
    const inv = {};
    distributions.filter(d => d.workerId === workerId).forEach(d => {
      d.items.forEach(it => {
        if (!inv[it.hairTypeId]) inv[it.hairTypeId] = { hairTypeId: it.hairTypeId, hairTypeName: it.hairTypeName, totalHolding: 0, totalReturned: 0 };
        inv[it.hairTypeId].totalHolding += (it.quantityGiven - it.quantityReturned);
      });
    });
    // This is just a local projection for a specific worker, so we don't need a Firestore collection for this.
    // It's very fast since a single worker doesn't have thousands of active records.
    return Object.values(inv).filter(x => x.totalHolding > 0);
  };

  return {
    inventory,
    getInventory,
    getWorkerInventory
  };
};
