import React, { ReactNode, useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  ApartmentOutlined,
  BarChartOutlined,
  DatabaseOutlined,
  FileTextOutlined,
  HomeOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  TeamOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';

type SidebarProps = {
  mobileOpen: boolean;
  onClose: () => void;
};

type MenuItem = {
  label: string;
  path: string;
  icon: ReactNode;
};

const menuGroups: { label: string; items: MenuItem[] }[] = [
  { label: 'Tổng quan', items: [{ label: 'Trang chủ', path: '/', icon: <HomeOutlined /> }] },
  {
    label: 'Quản lý',
    items: [
      { label: 'Hộ khẩu', path: '/households', icon: <ApartmentOutlined /> },
      { label: 'Nhân khẩu', path: '/persons', icon: <TeamOutlined /> },
      { label: 'Tạm trú', path: '/temporary-residence', icon: <HomeOutlined /> },
      { label: 'Tạm vắng', path: '/temporary-absence', icon: <ApartmentOutlined rotate={-90} /> },
    ],
  },
  { label: 'Báo cáo', items: [{ label: 'Báo cáo', path: '/reports', icon: <BarChartOutlined /> }] },
  {
    label: 'Hệ thống',
    items: [
      { label: 'Người dùng', path: '/users', icon: <UserOutlined /> },
      { label: 'Nhật ký', path: '/logs', icon: <FileTextOutlined /> },
      { label: 'Sao lưu', path: '/backup', icon: <DatabaseOutlined /> },
    ],
  },
];

export default function Sidebar({ mobileOpen, onClose }: SidebarProps) {
  const { logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside className={`sidebar-shell${collapsed ? ' is-collapsed' : ''}${mobileOpen ? ' mobile-open' : ''}`}>
      <div className="sidebar-header">
        <div className="sidebar-logo-badge">
          <ApartmentOutlined />
        </div>
        {!collapsed && (
          <div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#111827', lineHeight: 1.3 }}>QL Cơ sở dữ liệu</div>
            <div style={{ fontSize: '10px', color: '#9CA3AF' }}>UBND cấp xã</div>
          </div>
        )}
      </div>

      <nav className="sidebar-nav">
        {menuGroups.map((group) => (
          <div key={group.label}>
            {!collapsed && <div className="nav-section-label">{group.label}</div>}
            {group.items.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
                title={collapsed ? item.label : undefined}
                onClick={onClose}
              >
                <span className="nav-item-icon">{item.icon}</span>
                {!collapsed && <span>{item.label}</span>}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button
          type="button"
          onClick={() => {
            onClose();
            logout();
          }}
          className="sidebar-action sidebar-action-danger"
        >
          <LogoutOutlined />
          {!collapsed && 'Đăng xuất'}
        </button>

        <button
          type="button"
          onClick={() => setCollapsed((current) => !current)}
          className="sidebar-action sidebar-action-secondary"
        >
          {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          {!collapsed && 'Thu gọn'}
        </button>
      </div>
    </aside>
  );
}
