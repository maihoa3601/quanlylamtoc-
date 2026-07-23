import { useState, useEffect, useCallback } from 'react';
import { db, isFirebaseConfigured } from '../../firebase';
import { collection, onSnapshot, query, where } from 'firebase/firestore';

export const useDistributions = (currentUser, userRole) => {
  const [distributions, setDistributions] = useState([]);

  useEffect(() => {
    if (!isFirebaseConfigured) return;

    let unsub = () => {};
    if (userRole === 'owner') {
      unsub = onSnapshot(collection(db, 'distributions'), (snapshot) => {
        const list = [];
        snapshot.forEach(d => list.push({ ...d.data(), id: d.id }));
        setDistributions(list);
      });
    } else if (userRole === 'worker' && currentUser) {
      unsub = onSnapshot(query(collection(db, 'distributions'), where('workerId', '==', currentUser.id)), (snapshot) => {
        const list = [];
        snapshot.forEach(d => list.push({ ...d.data(), id: d.id }));
        setDistributions(list);
      });
    }
    return () => unsub();
  }, [currentUser, userRole]);

  const getWorkerDistributions = useCallback((workerId) => {
    return distributions.filter(d => d.workerId === workerId);
  }, [distributions]);

  return {
    distributions,
    getWorkerDistributions
  };
};
