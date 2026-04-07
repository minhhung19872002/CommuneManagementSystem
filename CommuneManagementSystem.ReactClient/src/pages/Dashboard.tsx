import React, { useEffect, useState } from 'react';
import { Card } from 'antd';
import { reportService } from '../services/reportService';
import { PopulationStats } from '../types';

export default function Dashboard() {
  const [stats, setStats] = useState<PopulationStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    reportService.getStatistics()
      .then(r => setStats(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const today = new Date().toLocaleDateString('vi-VN', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  const bigStats = [
    { label: 'Tổng dân số', value: stats?.totalPopulation ?? 0, icon: '👥', color: '#034AA0', bg: '#EBF3FC' },
    { label: 'Tổng hộ khẩu', value: stats?.totalHouseholds ?? 0, icon: '🏘️', color: '#10B981', bg: '#ECFDF5' },
    { label: 'Đang sống', value: stats?.aliveCount ?? 0, icon: '💚', color: '#059669', bg: '#ECFDF5' },
  ];

  const miniStats = [
    { label: 'Nam giới', value: stats?.maleCount ?? 0, icon: '♂️', color: '#2563EB', bg: '#EFF6FF' },
    { label: 'Nữ giới', value: stats?.femaleCount ?? 0, icon: '♀️', color: '#BE185D', bg: '#FDF2F8' },
    { label: 'Đã mất', value: stats?.deadCount ?? 0, icon: '⚰️', color: '#DC2626', bg: '#FEF2F2' },
    { label: 'Đã chuyển đi', value: stats?.movedCount ?? 0, icon: '🚚', color: '#EA580C', bg: '#FFF7ED' },
    { label: 'Tạm trú', value: stats?.tempResidentCount ?? 0, icon: '📍', color: '#0891B2', bg: '#ECFEFF' },
    { label: 'Tạm vắng', value: stats?.tempAbsentCount ?? 0, icon: '✈️', color: '#7C3AED', bg: '#F5F3FF' },
  ];

  return (
    <div className="dashboard-page">
      {/* Page Header */}
      <div className="dashboard-header">
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#32373C', margin: 0, lineHeight: 1.2 }}>
            Tổng quan hệ thống
          </h1>
          <p style={{ fontSize: '13px', color: '#737373', margin: '4px 0 0' }}>{today}</p>
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          padding: '6px 14px', background: '#ECFDF5',
          border: '1px solid #A7F3D0', borderRadius: '8px'
        }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981', display: 'inline-block' }} />
          <span style={{ fontSize: '12px', fontWeight: 600, color: '#059669' }}>Hệ thống hoạt động</span>
        </div>
      </div>

      {/* Big Stats — 3 columns */}
      <div className="dashboard-hero-grid">
        {bigStats.map(s => (
          <Card key={s.label} loading={loading} style={{ borderRadius: '8px', border: '1px solid #E5E5E5' }} styles={{ body: { padding: '20px' } }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ fontSize: '12px', fontWeight: 600, color: '#737373', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 8px' }}>
                  {s.label}
                </p>
                <p style={{ fontSize: '32px', fontWeight: 800, color: '#32373C', lineHeight: 1, margin: 0 }}>
                  {loading ? '—' : (typeof s.value === 'number' ? s.value.toLocaleString() : s.value)}
                </p>
              </div>
              <div style={{
                width: '48px', height: '48px', borderRadius: '8px',
                background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '22px'
              }}>
                {s.icon}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Mini Stats — 6 columns */}
      <div className="dashboard-metrics-grid">
        {miniStats.map(s => (
          <Card key={s.label} loading={loading} style={{ borderRadius: '8px', border: '1px solid #E5E5E5' }} styles={{ body: { padding: '14px' } }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '6px', background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', marginBottom: '10px' }}>
              {s.icon}
            </div>
            <p style={{ fontSize: '22px', fontWeight: 800, color: '#32373C', lineHeight: 1, margin: '0 0 4px' }}>
              {loading ? '—' : (s.value as number).toLocaleString()}
            </p>
            <p style={{ fontSize: '11px', fontWeight: 600, color: '#737373', textTransform: 'uppercase', letterSpacing: '0.5px', margin: 0 }}>
              {s.label}
            </p>
          </Card>
        ))}
      </div>

      {/* Bottom — 3 columns */}
      <div className="dashboard-sections-grid">
        {/* Hộ khẩu */}
        <Card title="🏘️ Thống kê hộ khẩu" loading={loading} style={{ borderRadius: '8px', border: '1px solid #E5E5E5' }}>
          {[
            { label: 'Tổng số hộ', value: stats?.totalHouseholds ?? '—', color: '#034AA0' },
            { label: 'Hộ hoạt động', value: stats?.activeHouseholds ?? '—', color: '#10B981' },
            { label: 'Hộ đã chuyển đi', value: stats?.movedHouseholds ?? '—', color: '#EA580C' },
          ].map(row => (
            <div key={row.label} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '12px 0', borderBottom: '1px solid #F5F5F5'
            }}>
              <span style={{ fontSize: '13px', color: '#737373', fontWeight: 500 }}>{row.label}</span>
              <span style={{ fontSize: '14px', fontWeight: 700, color: row.color }}>{row.value}</span>
            </div>
          ))}
        </Card>

        {/* Nhân khẩu */}
        <Card title="👥 Thống kê nhân khẩu" loading={loading} style={{ borderRadius: '8px', border: '1px solid #E5E5E5' }}>
          {[
            { label: 'Đang sống', value: stats?.aliveCount ?? '—', color: '#10B981' },
            { label: 'Đã mất', value: stats?.deadCount ?? '—', color: '#DC2626' },
            { label: 'Đã chuyển đi', value: stats?.movedCount ?? '—', color: '#EA580C' },
            { label: 'Tạm trú', value: stats?.tempResidentCount ?? '—', color: '#0891B2' },
            { label: 'Tạm vắng', value: stats?.tempAbsentCount ?? '—', color: '#7C3AED' },
          ].map(row => (
            <div key={row.label} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '10px 0', borderBottom: '1px solid #F5F5F5'
            }}>
              <span style={{ fontSize: '13px', color: '#737373', fontWeight: 500 }}>{row.label}</span>
              <span style={{ fontSize: '14px', fontWeight: 700, color: row.color }}>{row.value}</span>
            </div>
          ))}
        </Card>

        {/* Giới tính */}
        <Card title="⚧️ Giới tính" loading={loading} style={{ borderRadius: '8px', border: '1px solid #E5E5E5' }}>
          {[
            { label: '♂️ Nam giới', value: stats?.maleCount ?? 0, color: '#2563EB' },
            { label: '♀️ Nữ giới', value: stats?.femaleCount ?? 0, color: '#BE185D' },
          ].map(row => {
            const total = (stats?.maleCount ?? 0) + (stats?.femaleCount ?? 0) || 1;
            const pct = Math.round(((row.value as number) / total) * 100);
            return (
              <div key={row.label} style={{ padding: '12px 0', borderBottom: '1px solid #F5F5F5' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '13px', color: '#737373', fontWeight: 500 }}>{row.label}</span>
                  <span style={{ fontSize: '14px', fontWeight: 700, color: row.color }}>
                    {row.value} <span style={{ fontSize: '12px', color: '#737373', fontWeight: 500 }}>({pct}%)</span>
                  </span>
                </div>
                <div style={{ height: '6px', background: '#F5F5F5', borderRadius: '10px', overflow: 'hidden' }}>
                  <div style={{ width: `${pct}%`, height: '100%', background: row.color, borderRadius: '10px' }} />
                </div>
              </div>
            );
          })}
        </Card>
      </div>
    </div>
  );
}
