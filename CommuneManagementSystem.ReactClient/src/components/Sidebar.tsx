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

export default function Sidebar({ onNavigate, userRole }: SidebarProps) {
  return (
    <div
      style={{
        width: 240,
        height: '100vh',
        position: 'sticky',
        top: 0,
        background: 'var(--color-surface)',
        borderRight: '1px solid var(--color-border)',
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto',
        flexShrink: 0,
      }}
    >
      {/* Brand */}
      <div
        style={{
          padding: '20px 16px 16px',
          borderBottom: '1px solid var(--color-border)',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
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
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text)', lineHeight: 1.2 }}>
            CommuneHub
          </div>
          <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 1 }}>
            Quản lý cấp xã
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px 8px', overflowY: 'auto' }}>
        {menuGroups.map((group) => {
          const visible = group.items.filter(item => hasRouteAccess(userRole, item.path));
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
                    onClick={onNavigate}
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
                    })}
                  >
                    <Icon size={16} strokeWidth={2} style={{ flexShrink: 0 }} />
                    {item.label}
                  </NavLink>
                );
              })}
            </div>
          );
        })}
      </nav>
    </div>
  );
}
