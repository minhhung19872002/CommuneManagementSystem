import React from 'react';
import { ConfigProvider } from 'antd';
import viVN from 'antd/locale/vi_VN';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Households from './pages/Households';
import Persons from './pages/Persons';
import TemporaryResidence from './pages/TemporaryResidence';
import TemporaryAbsence from './pages/TemporaryAbsence';
import Reports from './pages/Reports';
import Users from './pages/Users';
import Logs from './pages/Logs';
import Backup from './pages/Backup';
import './App.css';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  return user ? <>{children}</> : <Navigate to="/login" replace />;
};

const AppRoutes: React.FC = () => {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="households" element={<Households />} />
        <Route path="persons" element={<Persons />} />
        <Route path="temporary-residence" element={<TemporaryResidence />} />
        <Route path="temporary-absence" element={<TemporaryAbsence />} />
        <Route path="reports" element={<Reports />} />
        <Route path="users" element={<Users />} />
        <Route path="logs" element={<Logs />} />
        <Route path="backup" element={<Backup />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <ConfigProvider
      locale={viVN}
      theme={{
        token: {
          colorPrimary: '#034AA0',
          colorInfo: '#034AA0',
          colorSuccess: '#10B981',
          colorWarning: '#F59E0B',
          colorError: '#EF2726',
          colorText: '#32373C',
          colorTextSecondary: '#6B7280',
          colorBgBase: '#F5F7FB',
          colorBgLayout: '#F5F7FB',
          colorBgContainer: '#FFFFFF',
          colorBorder: '#DCE4F0',
          fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
          borderRadius: 14,
          wireframe: false,
        },
      }}
    >
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </ConfigProvider>
  );
};

export default App;
