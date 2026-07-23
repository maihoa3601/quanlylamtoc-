import React, { createContext, useContext, useMemo } from 'react';
import { useAuth } from './useAuth';
import { useHairTypes } from './data/useHairTypes';
import { useWorkers } from './data/useWorkers';
import { useBatches } from './data/useBatches';
import { useRequests } from './data/useRequests';
import { useDistributions } from './data/useDistributions';
import { useReturns } from './data/useReturns';
import { usePayrolls } from './data/usePayrolls';
import { useInventory } from './data/useInventory';

const DataContext = createContext();
export const useData = () => useContext(DataContext);

export const DataProvider = ({ children }) => {
  const { currentUser, userRole, loading: authLoading } = useAuth();

  const { hairTypes, loadingHairTypes, addHairType, updateHairType, deleteHairType } = useHairTypes();
  const workerData = useWorkers(currentUser, userRole);
  const batchData = useBatches(userRole);
  const requestData = useRequests(currentUser, userRole);
  const distData = useDistributions(currentUser, userRole);
  const returnData = useReturns(currentUser, userRole, hairTypes);
  const payrollData = usePayrolls(currentUser, userRole);
  const inventoryData = useInventory(hairTypes);

  // Helper methods to keep backward compatibility
  const getWorkerDistributions = distData.getWorkerDistributions;
  const getWorkerReturns = returnData.getWorkerReturns;
  const getWorkerInventory = (workerId) => inventoryData.getWorkerInventory(distData.distributions, returnData.returns, workerId);

  const pendingRequestsCount = useMemo(() => requestData.requests.filter(r => r.status === 'pending').length, [requestData.requests]);
  const pendingReturnsCount = useMemo(() => returnData.returns.filter(r => r.status === 'pending').length, [returnData.returns]);
  const pendingWorkersCount = useMemo(() => workerData.workers.filter(w => w.status === 'pending').length, [workerData.workers]);

  const loading = authLoading || loadingHairTypes;

  const value = {
    hairTypes, addHairType, updateHairType, deleteHairType,
    ...workerData,
    ...batchData,
    ...requestData,
    ...distData,
    ...returnData,
    ...payrollData,
    ...inventoryData,
    getWorkerDistributions,
    getWorkerReturns,
    getWorkerInventory,
    pendingRequestsCount,
    pendingReturnsCount,
    pendingWorkersCount,
    loading
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};
