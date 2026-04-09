import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeftRight,
  ArrowRight,
  BarChart3,
  Bell,
  BookOpen,
  Building2,
  CalendarClock,
  CheckCircle,
  ClipboardList,
  FolderOpen,
  HardDrive,
  House,
  MessageSquare,
  TrendingUp,
  Users,
} from 'lucide-react';
import { Card, Progress, Skeleton, Tag, Typography } from 'antd';
import { reportService } from '../services/reportService';
import { useAuth } from '../context/AuthContext';
import { hasRouteAccess } from '../utils/permissions';
import { PopulationStats, SystemOverview } from '../types';

const { Text, Title } = Typography;

const formatNumber = (value: number) => value.toLocaleString('vi-VN');

// KPI data — replace with real API calls
const kpiCards = [
  { label: 'Tổng hộ khẩu', value: 248, icon: House, color: 'blue', trend: '+3 tháng này', trendUp: true },
  { label: 'Nhân khẩu', value: 1_247, icon: Users, color: 'cyan', trend: '+12 tháng này', trendUp: true },
  { label: 'Tạm trú', value: 34, icon: ArrowLeftRight, color: 'amber', trend: '+5 tháng này', trendUp: true },
  { label: 'Tạm vắng', value: 8, icon: ArrowLeftRight, color: 'red', trend: '-2 tháng này', trendUp: false },
  { label: 'Nhiệm vụ', value: 18, icon: ClipboardList, color: 'purple', trend: '8 đang xử lý', trendUp: true },
  { label: 'Dự án', value: 4, icon: Building2, color: 'green', trend: '2 đang triển khai', trendUp: true },
];

const recentActivities = [
  { id: 1, text: 'Nguyễn Văn A — khai báo tạm trú mới', time: '5 phút trước', type: 'info' },
  { id: 2, text: 'Hộ khẩu số 01234 — cập nhật thông tin thành công', time: '23 phút trước', type: 'success' },
  { id: 3, text: 'Cảnh báo: Mật khẩu sắp hết hạn — tài khoản admin', time: '1 giờ trước', type: 'warning' },
  { id: 4, text: 'Phản ánh mới từ: Trần Thị B — Khu phố 3', time: '2 giờ trước', type: 'info' },
  { id: 5, text: 'Cập nhật danh mục: Đơn vị hành chính cấp xã', time: '3 giờ trước', type: 'success' },
  { id: 6, text: 'Lịch họp ngày mai — 3 đăng ký mới', time: '4 giờ trước', type: 'info' },
];

const taskProgress = [
  { name: 'Cập nhật hộ khẩu Q1/2025', progress: 78 },
  { name: 'Kiểm tra nhân khẩu định kỳ', progress: 55 },
  { name: 'Hoàn thành báo cáo tháng 3', progress: 100 },
  { name: 'Xử lý phản ánh còn tồn đọng', progress: 33 },
];

const quickLinks = [
  { label: 'Hộ khẩu', desc: '248 hộ', icon: House, path: '/households', bg: '#eff6ff', color: '#2563eb' },
  { label: 'Nhân khẩu', desc: '1,247 người', icon: Users, path: '/persons', bg: '#ecfeff', color: '#0891b2' },
  { label: 'Báo cáo', desc: 'Xem thống kê', icon: BarChart3, path: '/reports', bg: '#f5f3ff', color: '#7c3aed' },
  { label: 'Nhiệm vụ', desc: '8 đang xử lý', icon: ClipboardList, path: '/tasks', bg: '#fff7ed', color: '#ea580c' },
  { label: 'Thông báo', desc: 'Phát hành thông báo', icon: Bell, path: '/notifications', bg: '#fff1f2', color: '#e11d48' },
  { label: 'Lịch họp', desc: 'Quản lý cuộc họp', icon: CalendarClock, path: '/meetings', bg: '#f0fdf4', color: '#16a34a' },
  { label: 'Kho tài liệu', desc: 'Văn bản & mẫu', icon: FolderOpen, path: '/library', bg: '#fefce8', color: '#ca8a04' },
  { label: 'Phản ánh', desc: 'Tiếp nhận ý kiến', icon: MessageSquare, path: '/feedback', bg: '#fdf4ff', color: '#9333ea' },
];

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<PopulationStats | null>(null);
  const [overview, setOverview] = useState<SystemOverview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([reportService.getStatistics(), reportService.getOverview()])
      .then(([s, o]) => { setStats(s.data); setOverview(o.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Chào buổi sáng' : hour < 18 ? 'Chào buổi chiều' : 'Chào buổi tối';

  const roleLabel = user?.role === 'Admin' ? 'Quản trị viên' : user?.role === 'NhanKhau' ? 'Cán bộ nhân khẩu' : 'Cán bộ hộ khẩu';

  return (
    <div className="page-wrapper">
      {/* Welcome banner */}
      <Card
        style={{
          background: 'linear-gradient(135deg, #1d4ed8 0%, #1e40af 60%, #3b82f6 100%)',
          border: 'none',
          borderRadius: 16,
          marginBottom: 20,
        }}
        styles={{ body: { padding: '24px 28px' } }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', fontWeight: 600, marginBottom: 4 }}>
              {greeting}
            </div>
            <Title level={4} style={{ color: '#fff', margin: 0, fontWeight: 800, letterSpacing: '-0.02em' }}>
              {user?.fullName ?? 'Người dùng'}
            </Title>
            <Text style={{ color: 'rgba(255,255,255,0.75)', fontSize: 13 }}>
              {roleLabel} · {new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </Text>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            {[
              { v: loading ? '...' : formatNumber(stats?.totalHouseholds ?? 0), l: 'Hộ khẩu' },
              { v: loading ? '...' : formatNumber(stats?.totalPopulation ?? 0), l: 'Nhân khẩu' },
              { v: loading ? '...' : (overview?.activeTasks ?? 0).toString(), l: 'Nhiệm vụ' },
            ].map(item => (
              <div key={item.l} style={{ textAlign: 'center', padding: '12px 20px', background: 'rgba(255,255,255,0.12)', borderRadius: 12, backdropFilter: 'blur(8px)' }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: '#fff' }}>{item.v}</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 2 }}>{item.l}</div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* KPI Cards */}
      <div className="kpi-grid">
        {kpiCards.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div key={kpi.label} className="kpi-card">
              <div className={`kpi-card__icon kpi-card__icon--${kpi.color}`}>
                <Icon size={20} strokeWidth={2.2} />
              </div>
              <div className="kpi-card__content">
                <div className="kpi-card__value">
                  {loading ? '...' : kpi.value.toLocaleString('vi-VN')}
                </div>
                <div className="kpi-card__label">{kpi.label}</div>
                <div className={`kpi-card__trend kpi-card__trend--${kpi.trendUp ? 'up' : 'down'}`}>
                  {kpi.trend}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main grid */}
      <div className="dashboard-grid">
        {/* Left */}
        <div>
          {/* Quick links */}
          <div className="card" style={{ marginBottom: 16 }}>
            <div className="card__header">
              <h3 className="card__title">Truy cập nhanh</h3>
            </div>
            <div className="card__body" style={{ padding: '12px 16px' }}>
              <div className="quick-links-grid">
                {quickLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <Link key={link.path} to={link.path} className="quick-link">
                      <div style={{ width: 36, height: 36, borderRadius: 9, background: link.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Icon size={17} color={link.color} strokeWidth={2.2} />
                      </div>
                      <div>
                        <div className="quick-link__label">{link.label}</div>
                        <div className="quick-link__desc">{link.desc}</div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Task progress */}
          <div className="card">
            <div className="card__header">
              <h3 className="card__title">Tiến độ nhiệm vụ</h3>
              <Link to="/tasks" style={{ fontSize: 12, color: 'var(--color-primary)', fontWeight: 600 }}>Xem tất cả</Link>
            </div>
            <div className="card__body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {taskProgress.map((task) => (
                <div key={task.name}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>{task.name}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: task.progress === 100 ? 'var(--color-success)' : 'var(--color-primary)' }}>
                      {task.progress === 100 ? '✓ Hoàn thành' : `${task.progress}%`}
                    </span>
                  </div>
                  <Progress
                    percent={task.progress}
                    showInfo={false}
                    strokeColor={task.progress === 100 ? 'var(--color-success)' : 'var(--color-primary)'}
                    trailColor="var(--color-border)"
                    size="small"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right */}
        <div>
          {/* Recent activity */}
          <div className="card">
            <div className="card__header">
              <h3 className="card__title">Hoạt động gần đây</h3>
              <Tag color="blue" style={{ fontSize: 11 }}>Mới nhất</Tag>
            </div>
            <div className="card__body" style={{ padding: '8px 16px' }}>
              <ul className="activity-list">
                {recentActivities.map((item) => (
                  <li key={item.id} className="activity-item">
                    <div className={`activity-item__dot activity-item__dot--${item.type === 'success' ? 'success' : item.type === 'warning' ? 'warning' : 'info'}`} />
                    <div className="activity-item__content">
                      <div className="activity-item__text">{item.text}</div>
                      <div className="activity-item__time">{item.time}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* System status */}
          <div className="card" style={{ marginTop: 16 }}>
            <div className="card__header">
              <h3 className="card__title">Trạng thái hệ thống</h3>
            </div>
            <div className="card__body">
              {[
                { label: 'Kết nối cơ sở dữ liệu', status: 'Hoạt động', color: 'success' },
                { label: 'Dịch vụ API', status: 'Hoạt động', color: 'success' },
                { label: 'Sao lưu tự động', status: 'Hàng ngày 02:00', color: 'blue' },
                { label: 'Người dùng đang online', status: '2 người', color: 'blue' },
              ].map((item) => (
                <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--color-border)' }}>
                  <span style={{ fontSize: 13 }}>{item.label}</span>
                  <Tag color={item.color} style={{ fontSize: 11 }}>{item.status}</Tag>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
