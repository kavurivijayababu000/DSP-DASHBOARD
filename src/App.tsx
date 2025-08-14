import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from './store/store';
import Layout from './components/Layout/Layout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import SDPOManagementPage from './pages/SDPOManagementPage';
import AnalyticsPage from './pages/AnalyticsPage';
import ReportsPage from './pages/ReportsPage';
import ProfilePage from './pages/ProfilePage';
import MobileDashboard from './components/Mobile/MobileDashboard';
import PWAManager from './components/PWA/PWAManager';

function App() {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const [isMobile, setIsMobile] = useState(false);
  const [isPWASupported, setIsPWASupported] = useState(false);

  useEffect(() => {
    // Check for mobile device
    const checkMobile = () => {
      const width = window.innerWidth;
      const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      setIsMobile(width <= 768 || isMobileUA);
    };

    // Check PWA support
    const checkPWASupport = () => {
      setIsPWASupported(
        'serviceWorker' in navigator && 
        'PushManager' in window && 
        'Notification' in window
      );
    };

    checkMobile();
    checkPWASupport();

    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  // Default user data if not available
  const userData = user || {
    id: '1',
    name: 'SDPO Officer',
    role: 'SDPO' as const,
    jurisdiction: 'Visakhapatnam Urban'
  };

  // Use mobile dashboard for mobile devices
  if (isMobile) {
    return (
      <div className="min-h-screen bg-gray-50">
        {isPWASupported && (
          <PWAManager 
            userRole={userData.role}
            jurisdiction={userData.jurisdiction}
          />
        )}
        <Routes>
          <Route path="/" element={<Navigate to="/mobile-dashboard" replace />} />
          <Route 
            path="/mobile-dashboard" 
            element={
              <MobileDashboard 
                userId={userData.id}
                userRole={userData.role}
                jurisdiction={userData.jurisdiction}
              />
            } 
          />
          <Route path="/dashboard" element={<Navigate to="/mobile-dashboard" replace />} />
          <Route path="/sdpos" element={<Navigate to="/mobile-dashboard" replace />} />
          <Route path="/analytics" element={<Navigate to="/mobile-dashboard" replace />} />
          <Route path="/reports" element={<Navigate to="/mobile-dashboard" replace />} />
          <Route path="/profile" element={<Navigate to="/mobile-dashboard" replace />} />
          <Route path="*" element={<Navigate to="/mobile-dashboard" replace />} />
        </Routes>
      </div>
    );
  }

  return (
    <Layout>
      {isPWASupported && (
        <PWAManager 
          userRole={userData.role}
          jurisdiction={userData.jurisdiction}
        />
      )}
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/mobile-dashboard" element={<Navigate to="/dashboard" replace />} />
        <Route path="/sdpos" element={<SDPOManagementPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Layout>
  );
}

export default App;
