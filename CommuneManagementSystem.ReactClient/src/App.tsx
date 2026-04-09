import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import viVN from 'antd/locale/vi_VN';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Households from './pages/Households';
import Persons from './pages/Persons';
import TemporaryResidence from './pages/TemporaryResidence';
import TemporaryAbsence from './pages/TemporaryAbsence';
import Notifications from './pages/Notifications';
import Meetings from './pages/Meetings';
import Library from './pages/Library';
import Feedback from './pages/Feedback';
import Reports from './pages/Reports';
import Users from './pages/Users';
import Logs from './pages/Logs';
import Backup from './pages/Backup';
import Settings from './pages/Settings';
import Catalogs from './pages/Catalogs';
import UserGroups from './pages/UserGroups';
import LoginHistory from './pages/LoginHistory';
import Tasks from './pages/Tasks';
import Projects from './pages/Projects';
import HumanResources from './pages/HumanResources';
import './App.css';

const ProtectedRoute: React.FC<{ children: React.ReactNode; allowedRoles?: string[] }> = ({ children, allowedRoles }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/" replace />;
  return <>{children}</>;
};

const AppRoutes: React.FC = () => {
  const { user } = useAuth();
  const homeRoute = user?.role === 'Admin' ? '/' : '/';

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to={homeRoute} replace /> : <Login />} />
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="households" element={<ProtectedRoute allowedRoles={['Admin', 'HoKhau']}><Households /></ProtectedRoute>} />
        <Route path="persons" element={<ProtectedRoute allowedRoles={['Admin', 'NhanKhau', 'HoKhau']}><Persons /></ProtectedRoute>} />
        <Route path="temporary-residence" element={<ProtectedRoute allowedRoles={['Admin', 'NhanKhau']}><TemporaryResidence /></ProtectedRoute>} />
        <Route path="temporary-absence" element={<ProtectedRoute allowedRoles={['Admin', 'NhanKhau']}><TemporaryAbsence /></ProtectedRoute>} />
        <Route path="reports" element={<ProtectedRoute allowedRoles={['Admin', 'NhanKhau', 'HoKhau']}><Reports /></ProtectedRoute>} />
        <Route path="notifications" element={<ProtectedRoute allowedRoles={['Admin', 'NhanKhau', 'HoKhau']}><Notifications /></ProtectedRoute>} />
        <Route path="meetings" element={<ProtectedRoute allowedRoles={['Admin', 'NhanKhau', 'HoKhau']}><Meetings /></ProtectedRoute>} />
        <Route path="library" element={<ProtectedRoute allowedRoles={['Admin', 'NhanKhau', 'HoKhau']}><Library /></ProtectedRoute>} />
        <Route path="feedback" element={<ProtectedRoute allowedRoles={['Admin', 'NhanKhau', 'HoKhau']}><Feedback /></ProtectedRoute>} />
        <Route path="tasks" element={<ProtectedRoute allowedRoles={['Admin', 'NhanKhau', 'HoKhau']}><Tasks /></ProtectedRoute>} />
        <Route path="projects" element={<ProtectedRoute allowedRoles={['Admin', 'NhanKhau', 'HoKhau']}><Projects /></ProtectedRoute>} />
        <Route path="human-resources" element={<ProtectedRoute allowedRoles={['Admin']}><HumanResources /></ProtectedRoute>} />
        <Route path="users" element={<ProtectedRoute allowedRoles={['Admin']}><Users /></ProtectedRoute>} />
        <Route path="logs" element={<ProtectedRoute allowedRoles={['Admin']}><Logs /></ProtectedRoute>} />
        <Route path="settings" element={<ProtectedRoute allowedRoles={['Admin']}><Settings /></ProtectedRoute>} />
        <Route path="catalogs" element={<ProtectedRoute allowedRoles={['Admin']}><Catalogs /></ProtectedRoute>} />
        <Route path="user-groups" element={<ProtectedRoute allowedRoles={['Admin']}><UserGroups /></ProtectedRoute>} />
        <Route path="login-history" element={<ProtectedRoute allowedRoles={['Admin', 'NhanKhau', 'HoKhau']}><LoginHistory /></ProtectedRoute>} />
        <Route path="backup" element={<ProtectedRoute allowedRoles={['Admin']}><Backup /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
};

const App: React.FC = () => (
  <ConfigProvider
    locale={viVN}
    theme={{
      token: {
        fontFamily: "'Segoe UI', 'Inter', system-ui, -apple-system, sans-serif",
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

export default App;
