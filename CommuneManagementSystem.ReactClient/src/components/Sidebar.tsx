import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
  ArrowLeftRight,
  BarChart3,
  Bell,
  Building2,
  CalendarClock,
  ClipboardList,
  Database,
  FileText,
  FolderOpen,
  History,
  House,
  Layers3,
  LayoutDashboard,
  Menu,
  MessageSquare,
  Settings2,
  Shield,
  Users,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { hasRouteAccess } from '../utils/permissions';

type SidebarProps = {
  onNavigate?: () => void;
  userRole?: string;
  collapsed?: boolean;
  onToggle?: () => void;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
};

const menuGroups: Array<{ label: string; items: Array<{ label: string; path: string; icon: React.ComponentType<{ size?: number; strokeWidth?: number }> }> }> = [
  {
    label: 'Điều hành',
    items: [
      { label: 'Tổng quan', path: '/', icon: LayoutDashboard },
      { label: 'Nhiệm vụ', path: '/tasks', icon: ClipboardList },
      { label: 'Dự án', path: '/projects', icon: Building2 },
    ],
  },
  {
    label: 'Dân cư',
    items: [
      { label: 'Hộ khẩu', path: '/households', icon: House },
      { label: 'Nhân khẩu', path: '/persons', icon: Users },
      { label: 'Tạm trú', path: '/temporary-residence', icon: ArrowLeftRight },
      { label: 'Tạm vắng', path: '/temporary-absence', icon: ArrowLeftRight },
    ],
  },
  {
    label: 'Phân tích',
    items: [
      { label: 'Báo cáo', path: '/reports', icon: BarChart3 },
      { label: 'Thông báo', path: '/notifications', icon: Bell },
      { label: 'Lịch họp', path: '/meetings', icon: CalendarClock },
      { label: 'Kho tài liệu', path: '/library', icon: FolderOpen },
      { label: 'Phản ánh', path: '/feedback', icon: MessageSquare },
    ],
  },
  {
    label: 'Hệ thống',
    items: [
      { label: 'Người dùng', path: '/users', icon: Shield },
      { label: 'Nhân sự & Lương', path: '/human-resources', icon: Users },
      { label: 'Nhật ký', path: '/logs', icon: FileText },
      { label: 'Lịch sử đăng nhập', path: '/login-history', icon: History },
      { label: 'Tham số', path: '/settings', icon: Settings2 },
      { label: 'Danh mục', path: '/catalogs', icon: Layers3 },
      { label: 'Nhóm người dùng', path: '/user-groups', icon: Users },
      { label: 'Sao lưu', path: '/backup', icon: Database },
    ],
  },
];

function NavContent({ onMobileClose, collapsed }: { onMobileClose?: () => void; collapsed?: boolean }) {
  const { user } = useAuth();

  return (
    <>
      {/* Nav */}
      <nav
        style={{
          flex: 1,
          padding: '12px 8px',
          overflowY: 'auto',
          overflowX: 'hidden',
        }}
      >
        {menuGroups.map((group) => {
          const visible = group.items.filter(item => hasRouteAccess(user?.role, item.path));
          if (visible.length === 0) return null;

          return (
            <div key={group.label} style={{ marginBottom: 20 }}>
              {!collapsed && (
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: 'var(--color-text-muted)',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    padding: '0 8px',
                    marginBottom: 6,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {group.label}
                </div>
              )}
              {visible.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.path === '/'}
                    onClick={onMobileClose}
                    title={collapsed ? item.label : undefined}
                    style={({ isActive }) => ({
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: collapsed ? '10px 12px' : '9px 10px',
                      borderRadius: 10,
                      marginBottom: 2,
                      fontSize: 15,
                      fontWeight: 600,
                      color: isActive ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                      background: isActive ? 'var(--color-primary-light)' : 'transparent',
                      textDecoration: 'none',
                      transition: 'all 0.15s',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      justifyContent: collapsed ? 'center' : 'flex-start',
                    })}
                  >
                    <span style={{ flexShrink: 0, display: 'inline-flex' }}><Icon size={16} strokeWidth={2} /></span>
                    {!collapsed && (
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.label}</span>
                    )}
                  </NavLink>
                );
              })}
            </div>
          );
        })}
      </nav>
    </>
  );
}

export default function Sidebar({ onNavigate, userRole, collapsed = false, onToggle, mobileOpen = false, onMobileClose }: SidebarProps) {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handler, { passive: true });
    return () => window.removeEventListener('resize', handler);
  }, []);

  const SIDEBAR_WIDTH = collapsed ? 64 : 260;

  // Shared sidebar styles
  const baseStyle: React.CSSProperties = {
    width: SIDEBAR_WIDTH,
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    background: 'var(--color-surface)',
    borderRight: '1px solid var(--color-border)',
    flexShrink: 0,
    overflowY: 'auto',
    overflowX: 'hidden',
    transition: 'width 0.28s cubic-bezier(0.4, 0, 0.2, 1)',
  };

  const desktopStyle: React.CSSProperties = {
    ...baseStyle,
    position: 'sticky',
    top: 0,
  };

  const mobileStyle: React.CSSProperties = {
    ...baseStyle,
    position: 'fixed',
    top: 0,
    left: mobileOpen ? 0 : -260,
    transition: 'left 0.28s cubic-bezier(0.4, 0, 0.2, 1)',
    boxShadow: mobileOpen ? '8px 0 32px rgba(0,0,0,0.2)' : 'none',
    zIndex: 100,
  };

  return (
    <>
      {/* Backdrop — only on mobile when drawer is open */}
      {isMobile && mobileOpen && (
        <div
          onClick={onMobileClose}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 50,
          }}
        />
      )}

      {/* Desktop sidebar */}
      <div
        className="sidebar-desktop"
        style={desktopStyle}
      >
        {/* Brand header — toggle button sits OUTSIDE overflow:hidden so it stays visible */}
        <div
          style={{
            padding: '16px 12px 14px',
            borderBottom: '1px solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            flexShrink: 0,
          }}
        >
          {/* Logo always visible */}
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: 'var(--color-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Building2 size={18} color="#fff" strokeWidth={2.2} />
          </div>

          {/* Text — hidden when collapsed */}
          {!collapsed && (
            <div style={{ overflow: 'hidden', flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text)', lineHeight: 1.2, whiteSpace: 'nowrap' }}>
                CommuneHub
              </div>
              <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 1, whiteSpace: 'nowrap' }}>
                Quản lý cấp xã
              </div>
            </div>
          )}
        </div>

        {/* Toggle button — separate row so it always shows */}
        <div
          style={{
            padding: '8px 12px',
            borderBottom: '1px solid var(--color-border)',
            display: 'flex',
            justifyContent: collapsed ? 'center' : 'flex-end',
            flexShrink: 0,
          }}
        >
          <button
            type="button"
            onClick={onToggle}
            title={collapsed ? 'Mở rộng' : 'Thu nhỏ'}
            style={{
              background: collapsed ? 'var(--color-surface-secondary)' : 'none',
              border: collapsed ? '1px solid var(--color-border)' : '1px solid transparent',
              cursor: 'pointer',
              padding: '6px 8px',
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              color: 'var(--color-text-secondary)',
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--color-surface-secondary)'; e.currentTarget.style.borderColor = 'var(--color-border)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = collapsed ? 'var(--color-surface-secondary)' : 'none'; e.currentTarget.style.borderColor = collapsed ? 'var(--color-border)' : 'transparent'; }}
          >
            {collapsed ? <Menu size={18} /> : <X size={18} />}
          </button>
        </div>

        <NavContent collapsed={collapsed} />
      </div>

      {/* Mobile drawer */}
      <div
        className="sidebar-drawer"
        style={mobileStyle}
      >
        {/* Brand header */}
        <div
          style={{
            padding: '20px 16px 16px',
            borderBottom: '1px solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            overflow: 'hidden',
            flexShrink: 0,
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: 'var(--color-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Building2 size={18} color="#fff" strokeWidth={2.2} />
          </div>
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text)', lineHeight: 1.2, whiteSpace: 'nowrap' }}>
              CommuneHub
            </div>
            <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 1, whiteSpace: 'nowrap' }}>
              Quản lý cấp xã
            </div>
          </div>

          {/* Close button */}
          <button
            type="button"
            onClick={onMobileClose}
            title="Đóng menu"
            style={{
              marginLeft: 'auto',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 6,
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              color: 'var(--color-text-muted)',
              flexShrink: 0,
            }}
          >
            <X size={20} />
          </button>
        </div>

        <NavContent onMobileClose={onMobileClose} collapsed={false} />
      </div>
    </>
  );
}
