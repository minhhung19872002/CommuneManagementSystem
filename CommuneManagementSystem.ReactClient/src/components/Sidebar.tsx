import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  ArrowRightLeft,
  BarChart3,
  Building2,
  ChevronsLeft,
  ChevronsRight,
  Database,
  FileText,
  House,
  LayoutDashboard,
  LogOut,
  MapPin,
  Shield,
  Users,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

type SidebarProps = {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen?: boolean;
  onClose?: () => void;
};

type MenuItem = {
  label: string;
  description: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  testId: string;
};

const roleMap: Record<string, string> = {
  Admin: 'Quản trị viên',
  NhanKhau: 'Nhân khẩu',
  HoKhau: 'Hộ khẩu',
};

const menuGroups: Array<{ label: string; items: MenuItem[] }> = [
  {
    label: 'Điều hành',
    items: [
      {
        label: 'Tổng quan',
        description: 'Bảng điều hành',
        path: '/',
        icon: LayoutDashboard,
        testId: 'nav-dashboard',
      },
    ],
  },
  {
    label: 'Dân cư',
    items: [
      {
        label: 'Hộ khẩu',
        description: 'Hồ sơ hộ dân',
        path: '/households',
        icon: House,
        testId: 'nav-households',
      },
      {
        label: 'Nhân khẩu',
        description: 'Dữ liệu công dân',
        path: '/persons',
        icon: Users,
        testId: 'nav-persons',
      },
      {
        label: 'Tạm trú',
        description: 'Theo dõi lưu trú',
        path: '/temporary-residence',
        icon: MapPin,
        testId: 'nav-temp-residence',
      },
      {
        label: 'Tạm vắng',
        description: 'Biến động di chuyển',
        path: '/temporary-absence',
        icon: ArrowRightLeft,
        testId: 'nav-temp-absence',
      },
    ],
  },
  {
    label: 'Phân tích',
    items: [
      {
        label: 'Báo cáo',
        description: 'Thống kê điều hành',
        path: '/reports',
        icon: BarChart3,
        testId: 'nav-reports',
      },
    ],
  },
  {
    label: 'Hệ thống',
    items: [
      {
        label: 'Người dùng',
        description: 'Tài khoản truy cập',
        path: '/users',
        icon: Shield,
        testId: 'nav-users',
      },
      {
        label: 'Nhật ký',
        description: 'Dấu vết vận hành',
        path: '/logs',
        icon: FileText,
        testId: 'nav-logs',
      },
      {
        label: 'Sao lưu',
        description: 'An toàn dữ liệu',
        path: '/backup',
        icon: Database,
        testId: 'nav-backup',
      },
    ],
  },
];

export default function Sidebar({ collapsed, onToggle, mobileOpen, onClose }: SidebarProps) {
  const { user, logout } = useAuth();

  const initials = user?.fullName
    ?.split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((segment) => segment[0])
    .join('')
    .toUpperCase();

  const sidebarWidth = mobileOpen ? 'w-full' : collapsed ? 'w-[92px]' : 'w-[304px]';

  return (
    <aside
      className={`flex h-full ${sidebarWidth} flex-col rounded-[30px] border border-white/70 bg-white/88 shadow-[0_24px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl`}
    >
      <div className="border-b border-[#e7edf6] p-5">
        <div className={`flex items-center ${collapsed && !mobileOpen ? 'justify-center' : 'gap-3'}`}>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#034AA0] to-[#1a74da] text-white shadow-[0_18px_30px_rgba(3,74,160,0.22)]">
            <Building2 className="h-6 w-6" />
          </div>

          {(!collapsed || mobileOpen) && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-extrabold text-[#1d2736]">Commune Data Hub</p>
              <p className="truncate text-xs text-[#61748f]">Quản lý dân cư cấp xã</p>
            </div>
          )}

          <button
            type="button"
            onClick={onToggle}
            className={`flex h-10 w-10 items-center justify-center rounded-2xl border border-[#dce4f0] bg-white text-[#44546b] transition hover:border-[#8cb6e8] hover:text-primary ${
              mobileOpen ? '' : 'hidden lg:flex'
            }`}
          >
            {collapsed && !mobileOpen ? <ChevronsRight className="h-4 w-4" /> : <ChevronsLeft className="h-4 w-4" />}
          </button>
        </div>

        {(!collapsed || mobileOpen) && (
          <div className="mt-4 rounded-2xl bg-[#f7faff] p-4">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#7b8aa5]">Phiên làm việc</p>
            <div className="mt-2 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-bold text-[#1d2736]">Kết nối ổn định</p>
                <p className="text-xs text-[#61748f]">Dữ liệu đồng bộ thời gian thực</p>
              </div>
              <span className="inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-[0_0_0_6px_rgba(16,185,129,0.14)]" />
            </div>
          </div>
        )}
      </div>

      <nav className="flex-1 space-y-5 overflow-y-auto p-4">
        {menuGroups.map((group) => (
          <div key={group.label}>
            {(!collapsed || mobileOpen) && (
              <p className="mb-2 px-3 text-[11px] font-bold uppercase tracking-[0.2em] text-[#7b8aa5]">
                {group.label}
              </p>
            )}

            <div className="space-y-1.5">
              {group.items.map((item) => {
                const Icon = item.icon;

                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.path === '/'}
                    data-testid={item.testId}
                    title={collapsed && !mobileOpen ? item.label : undefined}
                    onClick={onClose}
                    className={({ isActive }) =>
                      [
                        'group flex items-center rounded-[20px] border px-3 py-3 transition-all',
                        collapsed && !mobileOpen ? 'justify-center' : 'gap-3',
                        isActive
                          ? 'border-[#cfe0f7] bg-[#ebf3fc] text-primary shadow-[0_12px_22px_rgba(3,74,160,0.08)]'
                          : 'border-transparent text-[#4b5a70] hover:border-[#e0e8f4] hover:bg-[#f8fbff] hover:text-primary',
                      ].join(' ')
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <div
                          className={`flex h-11 w-11 items-center justify-center rounded-2xl ${
                            isActive ? 'bg-white text-primary' : 'bg-[#f4f7fb] text-[#61748f] group-hover:bg-white group-hover:text-primary'
                          }`}
                        >
                          <Icon className="h-5 w-5" />
                        </div>

                        {(!collapsed || mobileOpen) && (
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-bold">{item.label}</p>
                            <p className="truncate text-xs text-[#7b8aa5]">{item.description}</p>
                          </div>
                        )}
                      </>
                    )}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-[#e7edf6] p-4">
        {(!collapsed || mobileOpen) && (
          <div className="mb-3 rounded-2xl bg-[#f7faff] p-3">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#034AA0] to-[#1a74da] text-sm font-extrabold text-white">
                {initials || 'US'}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-extrabold text-[#1d2736]">{user?.fullName || 'Người dùng hệ thống'}</p>
                <p className="truncate text-xs text-[#61748f]">{roleMap[user?.role || ''] || 'Cán bộ hệ thống'}</p>
              </div>
            </div>
          </div>
        )}

        <button
          type="button"
          data-testid="logout-button"
          onClick={() => {
            logout();
            onClose?.();
          }}
          className={`flex h-12 w-full items-center rounded-2xl border border-[#fee2e2] bg-[#fff7f7] px-3 text-sm font-bold text-[#dc2626] transition hover:border-[#fecaca] hover:bg-[#fff0f0] ${
            collapsed && !mobileOpen ? 'justify-center' : 'gap-3'
          }`}
        >
          <LogOut className="h-5 w-5" />
          {(!collapsed || mobileOpen) && <span>Đăng xuất</span>}
        </button>
      </div>
    </aside>
  );
}
