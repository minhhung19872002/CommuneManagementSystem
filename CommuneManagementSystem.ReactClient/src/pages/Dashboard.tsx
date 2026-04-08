import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  ArrowRight,
  BarChart3,
  Building2,
  ClipboardList,
  HeartPulse,
  House,
  MapPin,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { Card } from 'antd';
import { reportService } from '../services/reportService';
import { PopulationStats } from '../types';

const formatNumber = (value: number) => value.toLocaleString('vi-VN');

const statLabelClass = 'text-[11px] font-bold uppercase tracking-[0.18em] text-[#7b8aa5]';

export default function Dashboard() {
  const [stats, setStats] = useState<PopulationStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    reportService
      .getStatistics()
      .then((response) => setStats(response.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const today = useMemo(
    () =>
      new Date().toLocaleDateString('vi-VN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
    [],
  );

  const primaryStats = [
    {
      label: 'Tổng dân số',
      value: stats?.totalPopulation ?? 0,
      icon: Users,
      testId: 'dashboard-stat-total-population',
      accent: 'from-[#ffffff26] to-[#ffffff0d]',
      iconShell: 'bg-white/12',
    },
    {
      label: 'Tổng hộ khẩu',
      value: stats?.totalHouseholds ?? 0,
      icon: House,
      testId: 'dashboard-stat-total-households',
      accent: 'from-[#ffffff20] to-[#ffffff08]',
      iconShell: 'bg-white/12',
    },
    {
      label: 'Nhân khẩu đang sống',
      value: stats?.aliveCount ?? 0,
      icon: HeartPulse,
      testId: 'dashboard-stat-alive-count',
      accent: 'from-[#ffffff18] to-[#ffffff08]',
      iconShell: 'bg-white/12',
    },
  ];

  const metricCards = [
    {
      label: 'Nam giới',
      value: stats?.maleCount ?? 0,
      icon: Users,
      testId: 'dashboard-stat-male-count',
      color: '#2563EB',
      soft: '#EFF6FF',
    },
    {
      label: 'Nữ giới',
      value: stats?.femaleCount ?? 0,
      icon: Users,
      testId: 'dashboard-stat-female-count',
      color: '#BE185D',
      soft: '#FDF2F8',
    },
    {
      label: 'Đã mất',
      value: stats?.deadCount ?? 0,
      icon: Activity,
      testId: 'dashboard-stat-dead-count',
      color: '#DC2626',
      soft: '#FEF2F2',
    },
    {
      label: 'Đã chuyển đi',
      value: stats?.movedCount ?? 0,
      icon: ArrowRight,
      testId: 'dashboard-stat-moved-count',
      color: '#EA580C',
      soft: '#FFF7ED',
    },
    {
      label: 'Tạm trú',
      value: stats?.tempResidentCount ?? 0,
      icon: MapPin,
      testId: 'dashboard-stat-temp-resident-count',
      color: '#0891B2',
      soft: '#ECFEFF',
    },
    {
      label: 'Tạm vắng',
      value: stats?.tempAbsentCount ?? 0,
      icon: ClipboardList,
      testId: 'dashboard-stat-temp-absent-count',
      color: '#7C3AED',
      soft: '#F5F3FF',
    },
  ];

  const quickLinks = [
    { label: 'Cập nhật hộ khẩu', to: '/households', icon: House },
    { label: 'Quản lý nhân khẩu', to: '/persons', icon: Users },
    { label: 'Xem báo cáo', to: '/reports', icon: BarChart3 },
  ];

  const genderTotal = (stats?.maleCount ?? 0) + (stats?.femaleCount ?? 0) || 1;

  return (
    <div className="page-stack" data-testid="dashboard-page">
      <section className="overflow-hidden rounded-[30px] bg-[linear-gradient(140deg,#034AA0_0%,#0B58BA_55%,#1A74DA_100%)] px-6 py-6 text-white shadow-[0_26px_65px_rgba(3,74,160,0.24)] sm:px-7 sm:py-7">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/12 px-4 py-2 text-sm font-semibold text-white/92">
              <ShieldCheck className="h-4 w-4" />
              Hệ thống đang hoạt động ổn định
            </div>

            <h2 className="text-3xl font-extrabold tracking-[-0.04em] sm:text-4xl">Trung tâm điều hành dân cư</h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-white/84">
              Toàn bộ bức tranh dân cư, hộ khẩu, tạm trú và tạm vắng được tổng hợp theo thời gian thực để
              cán bộ xử lý nhanh các biến động tại địa phương.
            </p>
          </div>

          <div className="rounded-[24px] border border-white/16 bg-white/10 px-5 py-4 backdrop-blur-sm">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/72">Hôm nay</p>
            <p className="mt-2 text-sm font-semibold capitalize text-white/92">{today}</p>
          </div>
        </div>

        <div className="mt-7 grid gap-4 md:grid-cols-3">
          {primaryStats.map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.label}
                data-testid={item.testId}
                className={`rounded-[26px] border border-white/14 bg-gradient-to-br ${item.accent} p-5 backdrop-blur-sm`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/70">{item.label}</p>
                    <p
                      data-testid={`${item.testId}-value`}
                      className="mt-4 text-4xl font-extrabold tracking-[-0.05em] text-white"
                    >
                      {loading ? '—' : formatNumber(item.value)}
                    </p>
                  </div>

                  <div className={`flex h-14 w-14 items-center justify-center rounded-[20px] ${item.iconShell}`}>
                    <Icon className="h-7 w-7" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.65fr)_minmax(320px,1fr)]">
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {metricCards.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.label}
                  data-testid={item.testId}
                  className="rounded-[24px] border border-white/75 bg-white/92 p-5 shadow-[0_16px_38px_rgba(15,23,42,0.06)]"
                >
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-[18px]"
                    style={{ background: item.soft, color: item.color }}
                  >
                    <Icon className="h-5 w-5" />
                  </div>

                  <p
                    data-testid={`${item.testId}-value`}
                    className="mt-4 text-[2rem] font-extrabold tracking-[-0.05em] text-[#1d2736]"
                  >
                    {loading ? '—' : formatNumber(item.value)}
                  </p>
                  <p className="mt-2 text-sm font-semibold text-[#61748f]">{item.label}</p>
                </div>
              );
            })}
          </div>

          <div className="grid gap-5 lg:grid-cols-3">
            <Card title="Thống kê hộ khẩu" loading={loading}>
              <div className="space-y-4">
                {[
                  { label: 'Tổng số hộ', value: stats?.totalHouseholds ?? 0, color: '#034AA0' },
                  { label: 'Hộ đang hoạt động', value: stats?.activeHouseholds ?? 0, color: '#10B981' },
                  { label: 'Hộ đã chuyển đi', value: stats?.movedHouseholds ?? 0, color: '#EA580C' },
                ].map((row) => (
                  <div key={row.label} className="flex items-center justify-between border-b border-[#eef3f9] pb-3 last:border-b-0 last:pb-0">
                    <span className="text-sm text-[#61748f]">{row.label}</span>
                    <span className="text-sm font-extrabold" style={{ color: row.color }}>
                      {loading ? '—' : formatNumber(row.value)}
                    </span>
                  </div>
                ))}
              </div>
            </Card>

            <Card title="Trạng thái nhân khẩu" loading={loading}>
              <div className="space-y-4">
                {[
                  { label: 'Đang sống', value: stats?.aliveCount ?? 0, color: '#10B981' },
                  { label: 'Đã mất', value: stats?.deadCount ?? 0, color: '#DC2626' },
                  { label: 'Đã chuyển đi', value: stats?.movedCount ?? 0, color: '#EA580C' },
                  { label: 'Tạm trú', value: stats?.tempResidentCount ?? 0, color: '#0891B2' },
                  { label: 'Tạm vắng', value: stats?.tempAbsentCount ?? 0, color: '#7C3AED' },
                ].map((row) => (
                  <div key={row.label} className="flex items-center justify-between border-b border-[#eef3f9] pb-3 last:border-b-0 last:pb-0">
                    <span className="text-sm text-[#61748f]">{row.label}</span>
                    <span className="text-sm font-extrabold" style={{ color: row.color }}>
                      {loading ? '—' : formatNumber(row.value)}
                    </span>
                  </div>
                ))}
              </div>
            </Card>

            <Card title="Cơ cấu giới tính" loading={loading}>
              <div className="space-y-5">
                {[
                  { label: 'Nam giới', value: stats?.maleCount ?? 0, color: '#2563EB' },
                  { label: 'Nữ giới', value: stats?.femaleCount ?? 0, color: '#BE185D' },
                ].map((row) => {
                  const pct = Math.round((row.value / genderTotal) * 100);

                  return (
                    <div key={row.label}>
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-sm text-[#61748f]">{row.label}</span>
                        <span className="text-sm font-extrabold" style={{ color: row.color }}>
                          {loading ? '—' : `${formatNumber(row.value)} (${pct}%)`}
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-[#eef3f9]">
                        <div
                          className="h-2 rounded-full"
                          style={{ width: `${pct}%`, background: row.color }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
        </div>

        <div className="space-y-5">
          <div className="rounded-[28px] border border-white/75 bg-white/92 p-6 shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className={statLabelClass}>Nhịp vận hành</p>
                <h3 className="mt-2 text-xl font-extrabold tracking-[-0.03em] text-[#1d2736]">
                  Bức tranh điều hành nhanh
                </h3>
              </div>
              <div className="rounded-2xl bg-[#ebf3fc] p-3 text-primary">
                <Activity className="h-5 w-5" />
              </div>
            </div>

            <div className="mt-5 space-y-4">
              <div className="rounded-[22px] border border-[#e3ebf6] bg-[#f8fbff] p-4">
                <p className="text-sm font-bold text-[#1d2736]">Tỷ lệ hồ sơ cư trú đang hoạt động</p>
                <p className="mt-2 text-3xl font-extrabold tracking-[-0.05em] text-primary">
                  {loading
                    ? '—'
                    : `${Math.round(((stats?.activeHouseholds ?? 0) / ((stats?.totalHouseholds ?? 0) || 1)) * 100)}%`}
                </p>
                <p className="mt-2 text-xs leading-5 text-[#61748f]">
                  Tính trên tổng số hộ khẩu hiện đang được hệ thống quản lý.
                </p>
              </div>

              <div className="grid gap-3">
                {[
                  {
                    label: 'Biến động lưu trú',
                    value: (stats?.tempResidentCount ?? 0) + (stats?.tempAbsentCount ?? 0),
                    note: 'Hồ sơ tạm trú và tạm vắng cần theo dõi',
                  },
                  {
                    label: 'Tổng hồ sơ công dân',
                    value: stats?.totalPopulation ?? 0,
                    note: 'Nguồn dữ liệu phục vụ báo cáo và tra cứu',
                  },
                ].map((item) => (
                  <div key={item.label} className="flex items-start justify-between gap-3 rounded-[20px] border border-[#edf2f8] px-4 py-4">
                    <div>
                      <p className="text-sm font-bold text-[#1d2736]">{item.label}</p>
                      <p className="mt-1 text-xs leading-5 text-[#61748f]">{item.note}</p>
                    </div>
                    <span className="text-lg font-extrabold tracking-[-0.04em] text-primary">
                      {loading ? '—' : formatNumber(item.value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-[28px] border border-white/75 bg-white/92 p-6 shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className={statLabelClass}>Lối tắt nghiệp vụ</p>
                <h3 className="mt-2 text-xl font-extrabold tracking-[-0.03em] text-[#1d2736]">
                  Thao tác nhanh
                </h3>
              </div>
              <div className="rounded-2xl bg-[#f7faff] p-3 text-primary">
                <Building2 className="h-5 w-5" />
              </div>
            </div>

            <div className="mt-5 grid gap-3">
              {quickLinks.map((item) => {
                const Icon = item.icon;

                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className="flex items-center justify-between gap-3 rounded-[20px] border border-[#e3ebf6] bg-[#f8fbff] px-4 py-4 text-[#1d2736] transition hover:border-[#c3d9f4] hover:bg-white"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-[18px] bg-[#ebf3fc] text-primary">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-bold">{item.label}</p>
                        <p className="text-xs text-[#61748f]">Mở nhanh màn hình nghiệp vụ liên quan</p>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-[#7b8aa5]" />
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
