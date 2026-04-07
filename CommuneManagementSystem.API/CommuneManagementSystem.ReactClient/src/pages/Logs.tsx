import React, { useEffect, useState, useCallback } from 'react';
import { userService } from '../services/userService';
import { SystemLog } from '../types';

const Logs: React.FC = () => {
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try { const r = await userService.getLogs(100); setLogs(r.data); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const moduleColor = (m: string) => {
    const map: Record<string, string> = { HoKhau: '#1a5c1a', NhanKhau: '#1565c0', TamTru: '#6a1b9a', TamVang: '#00838f', System: '#757575' };
    return map[m] || '#757575';
  };

  return (
    <>
      <div className="topbar">
        <h1>📝 Nhật ký hệ thống</h1>
        <button className="btn btn-outline" onClick={load}>🔄 Làm mới</button>
      </div>
      <div className="content">
        <div className="card">
          <div className="card-body">
            {loading ? <div className="loading">Đang tải...</div> : (
              <table className="data-table">
                <thead><tr><th>Thời gian</th><th>Người dùng</th><th>Hành động</th><th>Module</th><th>Chi tiết</th><th>IP</th></tr></thead>
                <tbody>
                  {logs.length === 0 ? <tr><td colSpan={6} style={{ textAlign: 'center', padding: '32px' }}>Không có log</td></tr>
                    : logs.map(l => (
                      <tr key={l.id}>
                        <td style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{new Date(l.createdAt).toLocaleString('vi-VN')}</td>
                        <td style={{ fontWeight: 600 }}>{l.username}</td>
                        <td>{l.action}</td>
                        <td><span style={{ background: moduleColor(l.module) + '20', color: moduleColor(l.module), padding: '2px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 600 }}>{l.module}</span></td>
                        <td style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{l.detail || '—'}</td>
                        <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{l.ipAddress}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Logs;
