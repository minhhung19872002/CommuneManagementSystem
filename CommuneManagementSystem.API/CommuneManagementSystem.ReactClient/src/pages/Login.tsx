import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const Login: React.FC = () => {
  const { login, loading } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await login(username, password);
    } catch {
      setError('Tài khoản hoặc mật khẩu không đúng.');
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">
          <div className="login-logo-icon">🏘️</div>
          <h1>Hệ Thống Quản Lý</h1>
          <p className="subtitle">Cơ sở dữ liệu dân cư UBND cấp xã</p>
        </div>

        {error && <div className="login-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Tài khoản</label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="Nhập tài khoản..."
              required
            />
          </div>
          <div className="form-group">
            <label>Mật khẩu</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Nhập mật khẩu..."
              required
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>

        <div className="info-box" style={{ marginTop: '20px', fontSize: '12px' }}>
          <strong>Tài khoản demo:</strong><br />
          admin / 123 (Quản trị viên)<br />
          nhankhau / 123 (Cán bộ nhân khẩu)<br />
          hokhau / 123 (Cán bộ hộ khẩu)
        </div>
      </div>
    </div>
  );
};

export default Login;
