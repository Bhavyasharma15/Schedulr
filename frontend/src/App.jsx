import React from 'react';
import { Toaster } from 'react-hot-toast';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import { MasterAdminDashboard } from './components/MasterAdminDashboard';
import { ClientAdminDashboard } from './components/ClientAdminDashboard';
import { CustomerBooking } from './components/CustomerBooking';
import { LoginPage } from './components/LoginPage';
import { RegisterPage } from './components/RegisterPage';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-50">
        <Toaster position="top-right" toastOptions={{ duration: 4000, style: { background: '#1e293b', color: '#f8fafc', fontWeight: '500' } }} />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/admin" element={<MasterAdminDashboard />} />
          <Route path="/client" element={<ClientAdminDashboard />} />
          <Route path="/book" element={<CustomerBooking />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
