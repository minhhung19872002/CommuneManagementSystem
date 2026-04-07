import React, { useState } from 'react';
import { userService } from '../services/userService';

const Backup: React.FC = () => {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: string } | null>(null);

  const toast_ = (msg: string, type = 'success') => {
    setToast({ msg, type }); setTimeout(() => setToast(null), 4000);
  };

  const handleBackup = async () => {
    setLoading(true);
    try {
      const r = await userService.backup();
      setResult(r.data);
      toast_('Sao lưu dữ liệu thành công!');
    } catch {
      toast_('Lỗi sao lưu!', 'error');
    } finally { setLoading(false); }
  };

  return (
    <>
      <div className="topbar">
        <h1>💾 Sao lưu & Phục hồi</h1>
      </div>
      <div className="content">
        {toast && <div className="toast-container"><div className={`toast toast-${toast.type}`}>{toast.msg}</div></div>}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div className="card">
            <div className="card-header"><h2>💾 Sao lưu dữ liệu</h2></div>
            <div className="card-body" style={{ padding: '24px' }}>
              <div className="info-box">Chức năng sao lưu Cơ sở dữ liệu. Dữ liệu sẽ được xuất ra file JSON để lưu trữ.</div>
              <button className="btn btn-primary" onClick={handleBackup} disabled={loading}>
                {loading ? 'Đang sao lưu...' : '🚀 Bắt đầu sao lưu'}
              </button>
              {result && (
                <div style={{ marginTop: '20px' }}>
                  <div className="info-box">{result.message}</div>
                  <table className="data-table">
                    <tbody>
                      {Object.entries(result.details || {}).map(([k, v]) => (
                        <tr key={k}><td style={{ fontWeight: 600 }}>{k}</td><td>{String(v)}</td></tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          <div className="card">
            <div className="card-header"><h2>ℹ️ Thông tin hệ thống</h2></div>
            <div className="card-body" style={{ padding: '24px' }}>
              <table className="data-table">
                <tbody>
                  <tr><td>Công nghệ</td><td><strong>.NET Core 9.0 + React.js</strong></td></tr>
                  <tr><td>Database</td><td><strong>SQLite (Mock)</strong></td></tr>
                  <tr><td>Phiên bản</td><td><strong>1.0.0</strong></td></tr>
                  <tr><td>Ngày triển khai</td><td><strong>{new Date().toLocaleDateString('vi-VN')}</strong></td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Backup;
