import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  ArrowLeftRight,
  BarChart3,
  Bell,
  BookOpen,
  Building2,
  CalendarClock,
  ClipboardList,
  Database,
  FileText,
  FolderOpen,
  HardDrive,
  History,
  House,
  Layers3,
  LayoutDashboard,
  MessageSquare,
  Settings2,
  Shield,
  Users,
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

export default function Sidebar({ onNavigate, userRole, collapsed = false, onToggle, mobileOpen = false, onMobileClose }: SidebarProps) {
  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          onClick={onMobileClose}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 40,
            display: 'none',
          }}
          className="sidebar-backdrop"
        />
      )}

      {/* Sidebar */}
      <div
        style={{
          width: collapsed ? 64 : 240,
          height: '100vh',
          position: 'sticky',
          top: 0,
          background: 'var(--color-surface)',
          borderRight: '1px solid var(--color-border)',
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0,
          overflowY: 'auto',
          transition: 'width 0.2s ease',
          zIndex: 50,
        }}
        className="sidebar"
      >
        {/* Brand */}
        <div
          style={{
            padding: '20px 16px 16px',
            borderBottom: '1px solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            overflow: 'hidden',
          }}
        >
          {!collapsed && (
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
          )}
          {collapsed && (
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
          )}
          {!collapsed && (
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text)', lineHeight: 1.2, whiteSpace: 'nowrap' }}>
                CommuneHub
              </div>
              <div style={{ fontSize: 11.5, color: 'var(--color-text-muted)', marginTop: 1, whiteSpace: 'nowrap' }}>
                Quản lý cấp xã
              </div>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '12px 8px', overflowY: 'auto' }}>
          {menuGroups.map((group) => {
            const visible = group.items.filter(item => hasRouteAccess(userRole, item.path));
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
                      onClick={() => { onNavigate?.(); onMobileClose?.(); }}
                      style={({ isActive }) => ({
                        display: 'flex',
                        alignItems: 'center',
                        gap: collapsed ? 0 : 10,
                        padding: collapsed ? '9px 0' : '9px 10px',
                        justifyContent: collapsed ? 'center' : 'flex-start',
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
                      })}
                      title={collapsed ? item.label : undefined}
                    >
                      <Icon size={16} strokeWidth={2} style={{ flexShrink: 0 }} />
                      {!collapsed && item.label}
                    </NavLink>
                  );
                })}
              </div>
            );
          })}
        </nav>
      </div>

      <style>{`
        @media (max-width: 767px) {
          .sidebar {
            position: fixed !important;
            left: 0;
            top: 0;
            height: 100vh !important;
            transform: translateX(${mobileOpen ? '0' : '-100%'});
            transition: transform 0.25s ease;
            box-shadow: ${mobileOpen ? '4px 0 20px rgba(0,0,0,0.15)' : 'none'};
          }
          .sidebar-backdrop {
            display: block !important;
          }
        }
        @media (min-width: 768px) {
          .sidebar-backdrop {
            display: none !important;
          }
        }
      `}</style>
    </>
  );
}
