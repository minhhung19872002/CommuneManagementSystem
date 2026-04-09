import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  ArrowLeftRight,
  BarChart3,
  Bell,
  BookOpen,
  Building2,
  CalendarClock,
  CheckCircle2,
  CheckSquare,
  ChevronRight,
  ClipboardList,
  Clock,
  Database,
  FolderOpen,
  Globe,
  HardDrive,
  House,
  LayoutDashboard,
  ListChecks,
  MessageSquare,
  Server,
  Shield,
  TrendingUp,
  TrendingDown,
  Users,
  Zap,
} from 'lucide-react';
import { PopulationStats, SystemOverview } from '../types';
import { reportService } from '../services/reportService';
import { useAuth } from '../context/AuthContext';
import './Dashboard.css';

const formatNumber = (value: number) => value.toLocaleString('vi-VN');

const kpiCards = [
  { label: 'Hộ khẩu', value: 248, icon: House, color: 'blue', trend: '+3 tháng này', trendUp: true },
  { label: 'Nhân khẩu', value: 1247, icon: Users, color: 'green', trend: '+12 tháng này', trendUp: true },
  { label: 'Tạm trú', value: 34, icon: ArrowLeftRight, color: 'amber', trend: '+5 tháng này', trendUp: true },
  { label: 'Tạm vắng', value: 8, icon: Clock, color: 'red', trend: '-2 tháng này', trendUp: false },
  { label: 'Nhiệm vụ', value: 18, icon: ClipboardList, color: 'purple', trend: '8 đang xử lý', trendUp: true },
  { label: 'Dự án', value: 4, icon: Building2, color: 'cyan', trend: '2 đang triển khai', trendUp: true },
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
  { label: 'Hộ khẩu', desc: '248 hộ', icon: House, bg: '#eff6ff', color: '#2563eb' },
  { label: 'Nhân khẩu', desc: '1,247 người', icon: Users, bg: '#f0fdf4', color: '#16a34a' },
  { label: 'Báo cáo', desc: 'Thống kê', icon: BarChart3, bg: '#faf5ff', color: '#9333ea' },
  { label: 'Nhiệm vụ', desc: '8 đang xử lý', icon: ListChecks, bg: '#fff7ed', color: '#ea580c' },
  { label: 'Thông báo', desc: 'Phát hành', icon: Bell, bg: '#fff1f2', color: '#e11d48' },
  { label: 'Lịch họp', desc: 'Quản lý', icon: CalendarClock, bg: '#f0fdf4', color: '#16a34a' },
  { label: 'Kho tài liệu', desc: 'Văn bản & mẫu', icon: FolderOpen, bg: '#fefce8', color: '#ca8a04' },
  { label: 'Phản ánh', desc: 'Tiếp nhận', icon: MessageSquare, bg: '#fdf4ff', color: '#9333ea' },
];

const systemStatus = [
  { label: 'Kết nối cơ sở dữ liệu', status: 'Hoạt động', color: 'online' },
  { label: 'Dịch vụ API', status: 'Hoạt động', color: 'online' },
  { label: 'Sao lưu tự động', status: 'Hàng ngày 02:00', color: 'pending' },
  { label: 'Người dùng online', status: '2 người', color: 'online' },
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
    <div className="page-wrapper civic-dashboard">

      {/* ── Welcome Banner ─────────────────────────────── */}
      <div className="civic-welcome">
        <div className="civic-welcome__inner">
          <div className="civic-welcome__left">
            <div className="civic-welcome__greeting">{greeting}</div>
            <div className="civic-welcome__name">{user?.fullName ?? 'Người dùng'}</div>
            <div className="civic-welcome__role">
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <Shield size={13} strokeWidth={2.5} />
                {roleLabel}
              </span>
              <span style={{ margin: '0 8px', opacity: 0.4 }}>·</span>
              {new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </div>
          </div>
          <div className="civic-welcome__stats">
            {[
              { v: loading ? '...' : formatNumber(stats?.totalHouseholds ?? 0), l: 'Hộ khẩu' },
              { v: loading ? '...' : formatNumber(stats?.totalPopulation ?? 0), l: 'Nhân khẩu' },
              { v: loading ? '...' : (overview?.activeTasks ?? 0).toString(), l: 'Nhiệm vụ' },
            ].map(item => (
              <div key={item.l} className="civic-welcome__stat">
                <div className="civic-welcome__stat-value">{item.v}</div>
                <div className="civic-welcome__stat-label">{item.l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── KPI Row ───────────────────────────────────── */}
      <div className="civic-kpi-row">
        {kpiCards.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div
              key={kpi.label}
              className={`civic-kpi-card civic-kpi-card--${kpi.color}`}
              style={{ animationDelay: `${idx * 0.06}s` }}
            >
              <div className="civic-kpi-card__icon">
                <Icon size={18} strokeWidth={2.2} />
              </div>
              <div className="civic-kpi-card__body">
                <div className="civic-kpi-card__value">
                  {loading ? '—' : kpi.value.toLocaleString('vi-VN')}
                </div>
                <div className="civic-kpi-card__label">{kpi.label}</div>
                <div className={`civic-kpi-card__trend civic-kpi-card__trend--${kpi.trendUp ? 'up' : 'down'}`}>
                  {kpi.trendUp
                    ? <TrendingUp size={11} strokeWidth={2.5} />
                    : <TrendingDown size={11} strokeWidth={2.5} />}
                  {kpi.trend}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Main Grid ─────────────────────────────────── */}
      <div className="civic-main">

        {/* Left column */}
        <div className="civic-left">

          {/* Quick Access */}
          <div className="civic-section">
            <div className="civic-section__header">
              <div className="civic-section__title">
                <div className="civic-section__title-icon civic-section__title-icon--blue">
                  <Zap size={14} strokeWidth={2.5} />
                </div>
                Truy cập nhanh
              </div>
              <Link to="/" style={{ fontSize: 11, fontWeight: 700, color: '#166534', display: 'flex', alignItems: 'center', gap: 4 }}>
                Tất cả <ChevronRight size={13} />
              </Link>
            </div>
            <div className="civic-section__body" style={{ padding: '12px 20px' }}>
              <div className="civic-links-grid">
                {quickLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <Link key={link.path ?? link.label} to={link.path ?? '/'} className="civic-link">
                      <div className="civic-link__icon" style={{ background: link.bg }}>
                        <Icon size={18} color={link.color} strokeWidth={2.2} />
                      </div>
                      <div className="civic-link__label">{link.label}</div>
                      <div className="civic-link__desc">{link.desc}</div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Task Progress */}
          <div className="civic-section">
            <div className="civic-section__header">
              <div className="civic-section__title">
                <div className="civic-section__title-icon civic-section__title-icon--amber">
                  <CheckSquare size={14} strokeWidth={2.5} />
                </div>
                Tiến độ nhiệm vụ
              </div>
              <Link to="/tasks" style={{ fontSize: 11, fontWeight: 700, color: '#166534', display: 'flex', alignItems: 'center', gap: 4 }}>
                Chi tiết <ChevronRight size={13} />
              </Link>
            </div>
            <div className="civic-section__body" style={{ padding: '16px 20px' }}>
              {taskProgress.map((task) => (
                <div key={task.name} className="civic-task-item">
                  <div className="civic-task-item__header">
                    <span className="civic-task-item__name">{task.name}</span>
                    <span className={`civic-task-item__pct civic-task-item__pct--${task.progress === 100 ? 'done' : 'active'}`}>
                      {task.progress === 100
                        ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}><CheckCircle2 size={13} strokeWidth={2.5} /> Hoàn thành</span>
                        : `${task.progress}%`}
                    </span>
                  </div>
                  <div className="civic-task-item__bar">
                    <div
                      className="civic-task-item__fill"
                      style={{
                        width: `${task.progress}%`,
                        background: task.progress === 100
                          ? '#16a34a'
                          : task.progress > 60
                            ? '#2563eb'
                            : task.progress > 30
                              ? '#d97706'
                              : '#dc2626',
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="civic-right">

          {/* Recent Activity */}
          <div className="civic-section">
            <div className="civic-section__header">
              <div className="civic-section__title">
                <div className="civic-section__title-icon civic-section__title-icon--purple">
                  <Activity size={14} strokeWidth={2.5} />
                </div>
                Hoạt động gần đây
              </div>
              <div className="civic-section__badge">Mới nhất</div>
            </div>
            <div className="civic-section__body" style={{ padding: '8px 0' }}>
              <ul className="civic-activity-list">
                {recentActivities.map((item) => (
                  <li key={item.id} className="civic-activity-item">
                    <div className={`civic-activity-item__dot civic-activity-item__dot--${item.type}`} />
                    <div className="civic-activity-item__content">
                      <div className="civic-activity-item__text">{item.text}</div>
                      <div className="civic-activity-item__time">{item.time}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* System Status */}
          <div className="civic-section">
            <div className="civic-section__header">
              <div className="civic-section__title">
                <div className="civic-section__title-icon civic-section__title-icon--gray">
                  <Server size={14} strokeWidth={2.5} />
                </div>
                Trạng thái hệ thống
              </div>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#16a34a', animation: 'civicPulse 2s ease-in-out infinite' }} />
            </div>
            <div className="civic-section__body" style={{ padding: '4px 0' }}>
              <div className="civic-status-list">
                {systemStatus.map((item) => (
                  <div key={item.label} className="civic-status-item">
                    <span className="civic-status-item__label">
                      <div className={`civic-status-item__dot civic-status-item__dot--${item.color}`} />
                      {item.label}
                    </span>
                    <span style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: item.color === 'online' ? '#16a34a' : item.color === 'pending' ? '#d97706' : '#dc2626',
                      background: item.color === 'online' ? '#f0fdf4' : item.color === 'pending' ? '#fffbeb' : '#fef2f2',
                      padding: '2px 8px',
                      borderRadius: 20,
                    }}>
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
