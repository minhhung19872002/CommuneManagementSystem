import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface NavItem {
  label: string;
  path: string;
  section?: string;
  roles?: string[];
}

const navItems: NavItem[] = [
  { label: 'Trang chủ', path: '/', section: 'Tổng quan' },
  { label: 'Hộ khẩu', path: '/households', section: 'Quản lý' },
  { label: 'Nhân khẩu', path: '/persons', section: 'Quản lý' },
  { label: 'Tạm trú', path: '/temporary-residence', section: 'Quản lý' },
  { label: 'Tạm vắng', path: '/temporary-absence', section: 'Quản lý' },
  { label: 'Báo cáo', path: '/reports', section: 'Báo cáo' },
  { label: 'Người dùng', path: '/users', section: 'Hệ thống' },
  { label: 'Nhật ký', path: '/logs', section: 'Hệ thống' },
  { label: 'Sao lưu', path: '/backup', section: 'Hệ thống' },
];

const Layout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const handleNav = (path: string) => {
    navigate(path);
  };

  const sections = navItems.reduce((acc, item) => {
    const sec = item.section || '';
    if (!acc[sec]) acc[sec] = [];
    acc[sec].push(item);
    return acc;
  }, {} as Record<string, NavItem[]>);

  return (
    <div className="app-layout">
      {/* SIDEBAR */}
      <div className="sidebar" style={{ width: collapsed ? '60px' : '240px', transition: 'width 0.2s' }}>
        <div className="sidebar-logo">
          {!collapsed && (
            <>
              <span>🏘️ Hệ thống QL</span><br />
              <small>Cơ sở dữ liệu dân cư</small>
            </>
          )}
          {collapsed && <span style={{ fontSize: '20px' }}>🏘️</span>}
        </div>

        <nav className="sidebar-nav">
          {Object.entries(sections).map(([section, items]) => (
            <div key={section}>
              {!collapsed && <div className="nav-section-label">{section}</div>}
              {items.map(item => (
                <button
                  key={item.path}
                  className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
                  onClick={() => handleNav(item.path)}
                  title={item.label}
                >
                  <span>{item.path === '/' ? '🏠' :
                    item.path.includes('households') ? '📋' :
                    item.path.includes('persons') ? '👤' :
                    item.path.includes('temporary-residence') ? '🏠' :
                    item.path.includes('temporary-absence') ? '✈️' :
                    item.path.includes('reports') ? '📊' :
                    item.path.includes('users') ? '⚙️' :
                    item.path.includes('logs') ? '📝' :
                    item.path.includes('backup') ? '💾' : '•'}</span>
                  {!collapsed && item.label}
                </button>
              ))}
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          {!collapsed && user && (
            <div className="user-info">
              <strong>{user.fullName}</strong>
              <span>{user.role === 'Admin' ? 'Quản trị viên' :
                user.role === 'NhanKhau' ? 'Cán bộ nhân khẩu' : 'Cán bộ hộ khẩu'}</span>
            </div>
          )}
          <button className="btn-logout" onClick={logout} title="Đăng xuất">
            <span>🚪</span>{!collapsed && 'Đăng xuất'}
          </button>
        </div>
      </div>

      {/* MAIN */}
      <div className="main">
        <Outlet />
      </div>
    </div>
  );
};

export default Layout;
