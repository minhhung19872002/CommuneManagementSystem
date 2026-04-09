import React, { useState, useEffect, useRef } from 'react';
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

function NavContent({ onMobileClose }: { onMobileClose?: () => void }) {
  const { user } = useAuth();

  return (
    <>
      {/* Brand */}
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
      </div>

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
              {visible.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.path === '/'}
                    onClick={onMobileClose}
                    style={({ isActive }) => ({
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '9px 10px',
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
                  >
                    <Icon size={16} strokeWidth={2} style={{ flexShrink: 0 }} />
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.label}</span>
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
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handler, { passive: true });
    return () => window.removeEventListener('resize', handler);
  }, []);

  // Desktop: sticky sidebar
  if (!isMobile) {
    return (
      <div
        ref={navRef as any}
        className="sidebar-desktop"
        style={{
          width: 240,
          height: '100vh',
          position: 'sticky',
          top: 0,
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
          background: 'var(--color-surface)',
          borderRight: '1px solid var(--color-border)',
          overflowY: 'auto',
          overflowX: 'hidden',
        }}
      >
        <NavContent onMobileClose={undefined} />
      </div>
    );
  }

  // Mobile: fixed drawer
  return (
    <>
      {/* Backdrop */}
      {mobileOpen && (
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

      {/* Drawer */}
      <div
        className="sidebar-mobile"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: 260,
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          background: 'var(--color-surface)',
          zIndex: 100,
          // Always render at left:-260 when closed, left:0 when open
          left: mobileOpen ? 0 : -260,
          transition: 'left 0.28s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: mobileOpen ? '8px 0 32px rgba(0,0,0,0.2)' : 'none',
        }}
      >
        {/* Mobile header with close button */}
        <div
          style={{
            padding: '16px 16px 14px',
            borderBottom: '1px solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
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
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text)', lineHeight: 1.2 }}>
                CommuneHub
              </div>
              <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
                Quản lý cấp xã
              </div>
            </div>
          </div>
          <button
            onClick={onMobileClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 6,
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              color: 'var(--color-text-muted)',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Nav content */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <NavContent onMobileClose={onMobileClose} />
        </div>
      </div>
    </>
  );
}
