import React, { useEffect, useState } from 'react';
import { reportService } from '../services/reportService';
import { PopulationStats } from '../types';

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<PopulationStats | null>(null);

  useEffect(() => {
    reportService.getStatistics().then(r => setStats(r.data)).catch(console.error);
  }, []);

  if (!stats) return <div className="content"><div className="loading">Đang tải...</div></div>;

  return (
    <>
      <div className="topbar">
        <h1>📊 Tổng quan</h1>
        <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
          Ngày: {new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </span>
      </div>
      <div className="content">
        <div className="stats-grid">
          <div className="stat-card">
            <div className="label">Tổng dân số</div>
            <div className="value">{stats.totalPopulation}</div>
            <div className="sub">Người</div>
          </div>
          <div className="stat-card">
            <div className="label">Nam</div>
            <div className="value" style={{ color: '#1565c0' }}>{stats.maleCount}</div>
            <div className="sub">Người</div>
          </div>
          <div className="stat-card">
            <div className="label">Nữ</div>
            <div className="value" style={{ color: '#ad1457' }}>{stats.femaleCount}</div>
            <div className="sub">Người</div>
          </div>
          <div className="stat-card">
            <div className="label">Hộ khẩu</div>
            <div className="value">{stats.totalHouseholds}</div>
            <div className="sub">{stats.activeHouseholds} hoạt động</div>
          </div>
          <div className="stat-card">
            <div className="label">Đã mất</div>
            <div className="value" style={{ color: 'var(--danger)' }}>{stats.deadCount}</div>
            <div className="sub">Người</div>
          </div>
          <div className="stat-card">
            <div className="label">Đã chuyển đi</div>
            <div className="value" style={{ color: 'var(--accent)' }}>{stats.movedCount}</div>
            <div className="sub">Người</div>
          </div>
          <div className="stat-card">
            <div className="label">Tạm trú</div>
            <div className="value" style={{ color: '#6a1b9a' }}>{stats.tempResidentCount}</div>
            <div className="sub">Người</div>
          </div>
          <div className="stat-card">
            <div className="label">Tạm vắng</div>
            <div className="value" style={{ color: '#00838f' }}>{stats.tempAbsentCount}</div>
            <div className="sub">Người</div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div className="card">
            <div className="card-header"><h2>📋 Thống kê hộ khẩu</h2></div>
            <div className="card-body">
              <table className="data-table">
                <tbody>
                  <tr><td>Tổng số hộ</td><td style={{ fontWeight: 600 }}>{stats.totalHouseholds}</td></tr>
                  <tr><td>Hộ hoạt động</td><td style={{ fontWeight: 600, color: 'var(--success)' }}>{stats.activeHouseholds}</td></tr>
                  <tr><td>Hộ đã chuyển đi</td><td style={{ fontWeight: 600, color: 'var(--accent)' }}>{stats.movedHouseholds}</td></tr>
                </tbody>
              </table>
            </div>
          </div>
          <div className="card">
            <div className="card-header"><h2>👥 Thống kê nhân khẩu</h2></div>
            <div className="card-body">
              <table className="data-table">
                <tbody>
                  <tr><td>Đang sống</td><td style={{ fontWeight: 600, color: 'var(--success)' }}>{stats.aliveCount}</td></tr>
                  <tr><td>Đã mất</td><td style={{ fontWeight: 600, color: 'var(--danger)' }}>{stats.deadCount}</td></tr>
                  <tr><td>Đã chuyển đi</td><td style={{ fontWeight: 600, color: 'var(--accent)' }}>{stats.movedCount}</td></tr>
                  <tr><td>Tạm trú / Tạm vắng</td><td style={{ fontWeight: 600 }}>{stats.tempResidentCount} / {stats.tempAbsentCount}</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
