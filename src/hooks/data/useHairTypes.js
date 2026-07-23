import { useState, useEffect, useCallback } from 'react';
import { db, isFirebaseConfigured } from '../../firebase';
import { collection, onSnapshot, doc, setDoc, updateDoc, deleteDoc, writeBatch, getDocs } from 'firebase/firestore';
import { generateId } from '../../utils/formatters';

// System Catalog
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

export const useHairTypes = () => {
  const [hairTypes, setHairTypes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Khởi tạo Database nếu chưa có loại tóc nào
  useEffect(() => {
    if (!isFirebaseConfigured) {
      setLoading(false);
      return;
    }

    const initFirebase = async () => {
      try {
        const hairTypesRef = collection(db, 'hairTypes');
        const q = await getDocs(hairTypesRef);
        if (q.empty) {
          const batch = writeBatch(db);
          INITIAL_HAIR_TYPES.forEach(item => batch.set(doc(db, 'hairTypes', item.id), item));
          await batch.commit();
        }
      } catch (err) {
        console.error("Lỗi khi kết nối hoặc khởi tạo Firestore (hairTypes):", err);
      } finally {
        setLoading(false);
      }
    };

    initFirebase();
  }, []);

  useEffect(() => {
    if (!isFirebaseConfigured) return;
    const unsub = onSnapshot(collection(db, 'hairTypes'), (snapshot) => {
      const list = [];
      snapshot.forEach(d => list.push({ ...d.data(), id: d.id }));
      // Sắp xếp nếu cần
      list.sort((a, b) => {
        if (a.size !== b.size) return (a.size || '').localeCompare(b.size || '');
        return (a.technique || '').localeCompare(b.technique || '');
      });
      setHairTypes(list);
    });
    return () => unsub();
  }, []);

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

  return {
    hairTypes,
    loadingHairTypes: loading,
    addHairType,
    updateHairType,
    deleteHairType
  };
};
