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

  // Run only once on mount to handle background session events
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      // Only react to explicit sign out events, not initial 'null' states during hydration
      if (event === 'SIGNED_OUT') {
         localStorage.removeItem('user');
         navigate('/login', { replace: true });
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  // Run on route changes to protect routes implicitly
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const userStr = localStorage.getItem('user');
      const isAuthRoute = location.pathname === '/' || location.pathname === '/login' || location.pathname === '/register';

      if (session && userStr) {
        const user = JSON.parse(userStr);
        if (isAuthRoute) {
          if (user.role === 'admin' || user.email === 'admin@schedulr.com') {
            navigate('/admin', { replace: true });
          } else {
            navigate('/client', { replace: true });
          }
        }
      } else if (!session && userStr) {
        // Wait briefly to see if Supabase is still initializing before purging
        setTimeout(async () => {
           const { data: { session: delayedSession } } = await supabase.auth.getSession();
           if (!delayedSession) {
             localStorage.removeItem('user');
           }
        }, 1000);
      }
    };
    
    checkAuth();
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
