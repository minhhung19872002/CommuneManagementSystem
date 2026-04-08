import React, { useMemo, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Bell, CalendarDays, Menu, Search, Sparkles } from 'lucide-react';
import Sidebar from './Sidebar';
import { useAuth } from '../context/AuthContext';

const roleMap: Record<string, string> = {
  Admin: 'Quản trị viên',
  NhanKhau: 'Cán bộ nhân khẩu',
  HoKhau: 'Cán bộ hộ khẩu',
};

const routeMeta = [
  {
    match: (pathname: string) => pathname === '/',
    title: 'Tổng quan hệ thống',
    description: 'Theo dõi nhanh biến động dân cư, hộ khẩu và trạng thái hồ sơ trong ngày.',
  },
  {
    match: (pathname: string) => pathname.startsWith('/households'),
    title: 'Quản lý hộ khẩu',
    description: 'Điều phối hồ sơ hộ dân, địa chỉ cư trú và thành viên trong từng hộ.',
  },
  {
    match: (pathname: string) => pathname.startsWith('/persons'),
    title: 'Quản lý nhân khẩu',
    description: 'Tra cứu thông tin công dân, khai sinh, khai tử và dữ liệu định danh.',
  },
  {
    match: (pathname: string) => pathname.startsWith('/temporary-residence'),
    title: 'Theo dõi tạm trú',
    description: 'Giám sát hồ sơ đăng ký tạm trú, thời hạn hiệu lực và gia hạn lưu trú.',
  },
  {
    match: (pathname: string) => pathname.startsWith('/temporary-absence'),
    title: 'Theo dõi tạm vắng',
    description: 'Quản lý thông tin tạm vắng, nơi đến và thời gian vắng mặt của cư dân.',
  },
  {
    match: (pathname: string) => pathname.startsWith('/reports'),
    title: 'Báo cáo và thống kê',
    description: 'Tổng hợp số liệu dân cư và xuất báo cáo điều hành theo từng nghiệp vụ.',
  },
  {
    match: (pathname: string) => pathname.startsWith('/users'),
    title: 'Quản lý người dùng',
    description: 'Thiết lập tài khoản, vai trò truy cập và trạng thái vận hành của cán bộ.',
  },
  {
    match: (pathname: string) => pathname.startsWith('/logs'),
    title: 'Nhật ký hệ thống',
    description: 'Theo dõi hoạt động đăng nhập, thao tác nghiệp vụ và dấu vết vận hành.',
  },
  {
    match: (pathname: string) => pathname.startsWith('/backup'),
    title: 'Sao lưu và phục hồi',
    description: 'Đảm bảo an toàn dữ liệu với các điểm sao lưu và kiểm soát khôi phục.',
  },
];

export default function Layout() {
  const { user } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  React.useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const pageMeta = useMemo(
    () =>
      routeMeta.find((item) => item.match(location.pathname)) ?? {
        title: 'Bảng điều hành',
        description: 'Không gian làm việc tập trung cho hệ thống quản lý dân cư cấp xã.',
      },
    [location.pathname],
  );

  const today = useMemo(
    () =>
      new Date().toLocaleDateString('vi-VN', {
        weekday: 'long',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }),
    [],
  );

  const initials = user?.fullName
    ?.split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((segment) => segment[0])
    .join('')
    .toUpperCase();

  return (
    <div className="flex min-h-screen bg-transparent" data-testid="app-shell">
      <div className="hidden flex-none p-4 pr-0 lg:block">
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed((current) => !current)}
        />
      </div>

      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-slate-950/35 backdrop-blur-[2px] lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <div
        className={`fixed inset-y-0 left-0 z-40 w-[296px] p-4 pr-0 transition-transform duration-300 lg:hidden ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <Sidebar
          collapsed={false}
          mobileOpen={mobileOpen}
          onToggle={() => setMobileOpen(false)}
          onClose={() => setMobileOpen(false)}
        />
      </div>

      <div className="flex min-w-0 flex-1 flex-col p-4 pt-0 lg:pl-4">
        <header className="sticky top-0 z-20 mb-4 rounded-[28px] border border-white/70 bg-white/80 p-4 shadow-[0_20px_45px_rgba(15,23,42,0.08)] backdrop-blur-xl">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex items-start gap-3">
              <button
                type="button"
                className="mt-1 flex h-11 w-11 items-center justify-center rounded-2xl border border-[#dce4f0] bg-white text-[#1d2736] transition hover:border-[#8cb6e8] hover:text-primary lg:hidden"
                data-testid="topbar-mobile-menu"
                onClick={() => setMobileOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </button>
              <button
                type="button"
                className="mt-1 hidden h-11 w-11 items-center justify-center rounded-2xl border border-[#dce4f0] bg-white text-[#1d2736] transition hover:border-[#8cb6e8] hover:text-primary lg:flex"
                onClick={() => setSidebarCollapsed((current) => !current)}
              >
                <span className="text-base font-bold">{sidebarCollapsed ? '→' : '←'}</span>
              </button>

              <div className="min-w-0">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#61748f]">
                    Trung tâm điều hành
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#ebf3fc] px-3 py-1 text-[11px] font-bold text-primary">
                    <Sparkles className="h-3.5 w-3.5" />
                    Đồng bộ trực tuyến
                  </span>
                </div>

                <h1 className="text-[clamp(1.5rem,2vw,2.1rem)] font-extrabold tracking-[-0.03em] text-[#1d2736]">
                  {pageMeta.title}
                </h1>
                <p className="mt-1 max-w-3xl text-sm leading-6 text-[#6b7280]">{pageMeta.description}</p>
              </div>
            </div>

            <div className="flex w-full flex-col gap-3 xl:max-w-[540px] xl:items-end">
              <div className="flex w-full flex-col gap-3 sm:flex-row xl:justify-end">
                <label className="relative block flex-1 xl:max-w-[320px]">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7b8aa5]" />
                  <input
                    type="text"
                    placeholder="Tìm hộ khẩu, nhân khẩu, báo cáo..."
                    className="h-11 w-full rounded-2xl border border-[#dce4f0] bg-white/95 pl-11 pr-4 text-sm text-[#1d2736] outline-none transition placeholder:text-[#94a3b8] focus:border-primary focus:ring-4 focus:ring-[#034AA014]"
                  />
                </label>

                <div className="flex items-center gap-2">
                  <div className="hidden h-11 items-center gap-2 rounded-2xl border border-[#dce4f0] bg-white px-4 text-sm font-semibold text-[#4b5a70] sm:flex">
                    <CalendarDays className="h-4 w-4 text-primary" />
                    <span className="capitalize">{today}</span>
                  </div>

                  <button
                    type="button"
                    className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#dce4f0] bg-white text-[#44546b] transition hover:border-[#8cb6e8] hover:text-primary"
                    aria-label="Thông báo"
                  >
                    <Bell className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between gap-4 rounded-[22px] border border-[#e7edf6] bg-[#f7faff] px-4 py-3">
                <div className="flex min-w-0 items-center gap-3" data-testid="topbar-user">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#034AA0] to-[#1a74da] text-sm font-extrabold text-white shadow-[0_16px_30px_rgba(3,74,160,0.22)]">
                    {initials || 'US'}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-extrabold text-[#1d2736]">{user?.fullName || 'Người dùng hệ thống'}</p>
                    <p className="truncate text-xs font-medium text-[#61748f]">@{user?.username || 'unknown'}</p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#7b8aa5]">Phân quyền</p>
                  <span className="mt-1 inline-flex rounded-full bg-white px-3 py-1.5 text-xs font-bold text-primary shadow-[0_8px_18px_rgba(15,23,42,0.06)]">
                    {roleMap[user?.role || ''] || 'Cán bộ hệ thống'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="min-h-0 flex-1 overflow-y-auto pb-4">
          <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
