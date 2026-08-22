import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Monitors from './pages/Monitors';
import CreateMonitor from './pages/CreateMonitor';
import EditMonitor from './pages/EditMonitor';
import MonitorDetail from './pages/MonitorDetail';
import Incidents from './pages/Incidents';
import Forms from './pages/Forms';
import Cards from './pages/Cards';
import Charts from './pages/Charts';
import Buttons from './pages/Buttons';
import Tables from './pages/Tables';
import Modals from './pages/Modals';
import Login from './pages/Login';
import NotFound from './pages/NotFound';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsConditions from './pages/TermsConditions';
import WordPressSites from './pages/WordPressSites';
import WordPressDetail from './pages/WordPressDetail';
import AddWordPressSite from './pages/AddWordPressSite';
import Settings from './pages/Settings';
import PageSpeedInsights from './pages/PageSpeedInsights';
import AdminPanel from './pages/AdminPanel';
import '../css/app.css';

function ProtectedRoute({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <Layout>{children}</Layout>;
}

function GuestRoute({ children }) {
  const { user } = useAuth();
  if (user) return <Navigate to="/" replace />;
  return children;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Guest routes */}
          <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsConditions />} />

          {/* Protected routes */}
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/monitors" element={<ProtectedRoute><Monitors /></ProtectedRoute>} />
          <Route path="/monitors/create" element={<ProtectedRoute><CreateMonitor /></ProtectedRoute>} />
          <Route path="/monitors/:id" element={<ProtectedRoute><MonitorDetail /></ProtectedRoute>} />
          <Route path="/monitors/:id/edit" element={<ProtectedRoute><EditMonitor /></ProtectedRoute>} />
          <Route path="/incidents" element={<ProtectedRoute><Incidents /></ProtectedRoute>} />

          {/* PageSpeed */}
          <Route path="/pagespeed" element={<ProtectedRoute><PageSpeedInsights /></ProtectedRoute>} />

          {/* Settings */}
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />

          {/* Admin */}
          <Route path="/admin" element={<ProtectedRoute><AdminPanel /></ProtectedRoute>} />

          {/* WordPress Monitor */}
          <Route path="/wordpress" element={<ProtectedRoute><WordPressSites /></ProtectedRoute>} />
          <Route path="/wordpress/add" element={<ProtectedRoute><AddWordPressSite /></ProtectedRoute>} />
          <Route path="/wordpress/:id" element={<ProtectedRoute><WordPressDetail /></ProtectedRoute>} />

          {/* Placeholder routes */}
          <Route path="/forms" element={<ProtectedRoute><Forms /></ProtectedRoute>} />
          <Route path="/cards" element={<ProtectedRoute><Cards /></ProtectedRoute>} />
          <Route path="/charts" element={<ProtectedRoute><Charts /></ProtectedRoute>} />
          <Route path="/buttons" element={<ProtectedRoute><Buttons /></ProtectedRoute>} />
          <Route path="/tables" element={<ProtectedRoute><Tables /></ProtectedRoute>} />
          <Route path="/modals" element={<ProtectedRoute><Modals /></ProtectedRoute>} />

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

createRoot(document.getElementById('app')).render(<App />);
