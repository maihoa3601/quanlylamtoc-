import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { useData } from './hooks/useData';
import Layout from './components/Layout';
import Login from './pages/Login';

// Owner pages
import Dashboard from './pages/owner/Dashboard';
import ReviewRequests from './pages/owner/ReviewRequests';
import Batches from './pages/owner/Batches';
import Workers from './pages/owner/Workers';
import HairTypes from './pages/owner/HairTypes';
import Returns from './pages/owner/Returns';
import Distributions from './pages/owner/Distributions';
import OwnerMenu from './pages/owner/OwnerMenu';
import Payroll from './pages/owner/Payroll';
import Statistics from './pages/owner/Statistics';

// Worker pages
import WorkerHome from './pages/worker/WorkerHome';
import CreateRequest from './pages/worker/CreateRequest';
import SubmitReturn from './pages/worker/SubmitReturn';
import MyRequests from './pages/worker/MyRequests';
import MyReturns from './pages/worker/MyReturns';
import MyInventory from './pages/worker/MyInventory';
import MyPayroll from './pages/worker/MyPayroll';
import WorkerMenu from './pages/worker/WorkerMenu';

function App() {
  const { currentUser, userRole, loading } = useAuth();
  const { loading: dataLoading } = useData();

  if (loading || dataLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'var(--bg-color)', color: 'var(--text-primary)' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>✂️</div>
          <p>Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="*" element={<Login />} />
        </Routes>
      </BrowserRouter>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout userRole={userRole} />}>
          {/* Default redirect */}
          <Route index element={<Navigate to={userRole === 'owner' ? '/owner/dashboard' : '/worker/home'} replace />} />

          {/* Owner Routes */}
          <Route path="owner/dashboard" element={<Dashboard />} />
          <Route path="owner/requests" element={<ReviewRequests />} />
          <Route path="owner/returns" element={<Returns />} />
          <Route path="owner/batches" element={<Batches />} />
          <Route path="owner/batches/new" element={<Batches />} />
          <Route path="owner/workers" element={<Workers />} />
          <Route path="owner/workers/:id" element={<Workers />} />
          <Route path="owner/hair-types" element={<HairTypes />} />
          <Route path="owner/distributions" element={<Distributions />} />
          <Route path="owner/payroll" element={<Payroll />} />
          <Route path="owner/statistics" element={<Statistics />} />
          <Route path="owner/menu" element={<OwnerMenu />} />

          {/* Worker Routes */}
          <Route path="worker/home" element={<WorkerHome />} />
          <Route path="worker/request" element={<CreateRequest />} />
          <Route path="worker/return" element={<SubmitReturn />} />
          <Route path="worker/my-requests" element={<MyRequests />} />
          <Route path="worker/my-returns" element={<MyReturns />} />
          <Route path="worker/inventory" element={<MyInventory />} />
          <Route path="worker/payroll" element={<MyPayroll />} />
          <Route path="worker/menu" element={<WorkerMenu />} />

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
