import React, { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import { MasterAdminDashboard } from './components/MasterAdminDashboard';
import { ClientAdminDashboard } from './components/ClientAdminDashboard';
import { CustomerBooking } from './components/CustomerBooking';
import { LoginPage } from './components/LoginPage';
import { RegisterPage } from './components/RegisterPage';
import { supabase } from './supabase';

const AuthGuard = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const userStr = localStorage.getItem('user');

      // If they have a valid session and user data
      if (session && userStr) {
        const user = JSON.parse(userStr);
        const isAuthRoute = location.pathname === '/' || location.pathname === '/login' || location.pathname === '/register';
        
        // Redirect them to their dashboard automatically
        if (isAuthRoute) {
          if (user.role === 'admin' || user.email === 'admin@schedulr.com') {
            navigate('/admin', { replace: true });
          } else {
            navigate('/client', { replace: true });
          }
        }
      } else if (!session && userStr) {
        // Purge expired local storage
        localStorage.removeItem('user');
      }
    };
    
    checkAuth();

    // Listen for logouts or session expiry in the background
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        localStorage.removeItem('user');
        if (location.pathname === '/admin' || location.pathname === '/client') {
          navigate('/login', { replace: true });
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [location.pathname, navigate]);

  return children;
};

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-50">
        <Toaster position="top-right" toastOptions={{ duration: 4000, style: { background: '#1e293b', color: '#f8fafc', fontWeight: '500' } }} />
        <AuthGuard>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/admin" element={<MasterAdminDashboard />} />
            <Route path="/client" element={<ClientAdminDashboard />} />
            <Route path="/book" element={<CustomerBooking />} />
          </Routes>
        </AuthGuard>
      </div>
    </Router>
  );
}

export default App;
