import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut 
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        if (user.email === 'owner@quanlylamtoc.app') {
          setCurrentUser({ id: 'owner', displayName: 'Chủ' });
          setUserRole('owner');
        } else {
          // This is a worker. Fetch worker info from Firestore using UID
          try {
            const workerDoc = await getDoc(doc(db, 'workers', user.uid));
            if (workerDoc.exists()) {
              const workerData = workerDoc.data();
              if (workerData.status === 'pending' || workerData.status === 'inactive') {
                // Not allowed yet, log them out
                await signOut(auth);
                setCurrentUser(null);
                setUserRole(null);
              } else {
                setCurrentUser({ 
                  id: workerData.id, 
                  displayName: workerData.displayName, 
                  code: workerData.code 
                });
                setUserRole('worker');
              }
            } else {
              // Worker doc not found (maybe just created or deleted)
              setCurrentUser(null);
              setUserRole(null);
              await signOut(auth);
            }
          } catch (e) {
            console.error("Lỗi khi fetch worker data:", e);
            setCurrentUser(null);
            setUserRole(null);
          }
        }
      } else {
        setCurrentUser(null);
        setUserRole(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginAsOwner = async (pin) => {
    if (!auth) return false;
    try {
      await signInWithEmailAndPassword(auth, 'owner@quanlylamtoc.app', pin);
      return true;
    } catch (e) {
      // Only auto-create owner on FIRST ever login (user doesn't exist yet)
      if (e.code === 'auth/user-not-found') {
         try {
            await createUserWithEmailAndPassword(auth, 'owner@quanlylamtoc.app', pin);
            return true;
         } catch (createErr) {
            return false;
         }
      }
      // invalid-credential = wrong password for existing user
      return false;
    }
  };

  const loginAsWorker = async (code, pin) => {
    if (!auth) return { error: 'Chưa cấu hình Firebase Auth' };
    try {
      const email = `${code.toLowerCase()}@quanlylamtoc.app`;
      const cred = await signInWithEmailAndPassword(auth, email, pin);
      
      const workerDoc = await getDoc(doc(db, 'workers', cred.user.uid));
      if (workerDoc.exists()) {
        const data = workerDoc.data();
        if (data.status === 'pending') {
          await signOut(auth);
          return { error: 'Tài khoản đang chờ Chủ duyệt' };
        }
        if (data.status !== 'active') {
          await signOut(auth);
          return { error: 'Tài khoản đã bị vô hiệu' };
        }
        return data;
      } else {
         await signOut(auth);
         return { error: 'Không tìm thấy thông tin thợ' };
      }
    } catch (e) {
      if (e.code === 'auth/invalid-credential' || e.code === 'auth/user-not-found' || e.code === 'auth/wrong-password') {
        return { error: 'Sai mã thợ hoặc PIN' };
      }
      return { error: 'Lỗi đăng nhập: ' + e.message };
    }
  };

  const logout = async () => {
    if (auth) await signOut(auth);
    setCurrentUser(null);
    setUserRole(null);
  };

  const value = { currentUser, userRole, loading, loginAsOwner, loginAsWorker, logout };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
