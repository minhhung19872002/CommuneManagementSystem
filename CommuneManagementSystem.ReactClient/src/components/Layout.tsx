import React, { useState } from 'react';
import { MenuOutlined } from '@ant-design/icons';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useAuth } from '../context/AuthContext';

const roleMap: Record<string, string> = {
  Admin: 'Quản trị viên',
  NhanKhau: 'Cán bộ NK',
  HoKhau: 'Cán bộ HK',
};

export default function Layout() {
  const { user } = useAuth();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="app-layout">
      <Sidebar mobileOpen={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />
      {mobileNavOpen && (
        <button
          className="sidebar-overlay"
          type="button"
          onClick={() => setMobileNavOpen(false)}
          aria-label="Đóng menu"
        />
      )}

      <main className="main">
        <div className="shell-topbar">
          <div className="shell-topbar-left">
            <button
              className="shell-menu-button"
              type="button"
              onClick={() => setMobileNavOpen(true)}
              aria-label="Mở menu điều hướng"
            >
              <MenuOutlined />
            </button>

            <div className="shell-topbar-brand">
              <span className="shell-topbar-brand-title">Quản lý dân cư</span>
              <span className="shell-topbar-brand-sub">Hệ thống UBND cấp xã</span>
            </div>
          </div>

          <div className="shell-topbar-user">
            <div className="shell-topbar-avatar">
              {user?.fullName?.charAt(0) || 'U'}
            </div>
            <div className="shell-topbar-meta">
              <div className="shell-topbar-name">{user?.fullName}</div>
              <div className="shell-topbar-role">{roleMap[user?.role || '']}</div>
            </div>
          </div>
        </div>

        <Outlet />
      </main>
    </div>
  );
}
