import React, { useState } from 'react';
import { Form, Input, Button, message } from 'antd';
import { UserOutlined, LockOutlined, LoginOutlined } from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';

interface LoginForm {
  username: string;
  password: string;
}

const demoAccounts = [
  { u: 'admin', p: '123', role: 'Quản trị viên' },
  { u: 'nhankhau', p: '123', role: 'Cán bộ NK' },
  { u: 'hokhau', p: '123', role: 'Cán bộ HK' },
];

export default function Login() {
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm<LoginForm>();

  const onFinish = async (values: LoginForm) => {
    setLoading(true);
    try {
      await login(values.username, values.password);
    } catch {
      message.error('Tài khoản hoặc mật khẩu không đúng!');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (u: string, p: string) => {
    form.setFieldsValue({ username: u, password: p });
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#F8F9FA',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
    }}>
      <div style={{
        width: '100%',
        maxWidth: '420px',
        margin: '0 16px',
      }}>
        {/* Card */}
        <div style={{
          background: '#fff',
          borderRadius: '10px',
          border: '1px solid #E5E7EB',
          padding: '40px',
          boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
        }}>
          {/* Logo */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '32px' }}>
            <div style={{
              width: '56px', height: '56px', borderRadius: '10px',
              background: '#034AA0',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '28px', marginBottom: '14px',
              boxShadow: '0 4px 12px rgba(3,74,160,0.25)',
            }}>🏘️</div>
            <h1 style={{ fontSize: '20px', fontWeight: 800, color: '#111827', marginBottom: '4px' }}>
              Hệ Thống Quản Lý
            </h1>
            <p style={{ fontSize: '13px', color: '#6B7280' }}>
              Cơ sở dữ liệu dân cư UBND cấp xã
            </p>
          </div>

          {/* Form */}
          <Form form={form} layout="vertical" onFinish={onFinish} size="large">
            <Form.Item
              name="username"
              label={<span style={{ fontSize: '12.5px', fontWeight: 600, color: '#374151' }}>Tài khoản</span>}
              rules={[{ required: true, message: 'Vui lòng nhập tài khoản!' }]}
            >
              <Input
                prefix={<UserOutlined style={{ color: '#9CA3AF' }} />}
                placeholder="Nhập tài khoản..."
                autoComplete="username"
                style={{ height: '42px', borderRadius: '8px', fontSize: '14px' }}
              />
            </Form.Item>

            <Form.Item
              name="password"
              label={<span style={{ fontSize: '12.5px', fontWeight: 600, color: '#374151' }}>Mật khẩu</span>}
              rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
            >
              <Input.Password
                prefix={<LockOutlined style={{ color: '#9CA3AF' }} />}
                placeholder="Nhập mật khẩu..."
                autoComplete="current-password"
                style={{ height: '42px', borderRadius: '8px', fontSize: '14px' }}
              />
            </Form.Item>

            <Form.Item style={{ marginBottom: 0, marginTop: '8px' }}>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                icon={<LoginOutlined />}
                style={{
                  width: '100%', height: '42px',
                  background: '#034AA0',
                  borderColor: '#034AA0',
                  borderRadius: '8px',
                  fontWeight: 700, fontSize: '14px',
                  boxShadow: '0 2px 8px rgba(3,74,160,0.2)',
                }}
              >
                Đăng nhập
              </Button>
            </Form.Item>
          </Form>
        </div>

        {/* Demo accounts */}
        <div style={{
          marginTop: '16px',
          background: '#fff',
          borderRadius: '10px',
          border: '1px solid #E5E7EB',
          padding: '16px 20px',
        }}>
          <div style={{ fontSize: '10.5px', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: '#9CA3AF', textAlign: 'center', marginBottom: '10px' }}>
            Tài khoản demo — nhấp để điền
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {demoAccounts.map((acc) => (
              <div
                key={acc.u}
                onClick={() => fillDemo(acc.u, acc.p)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '9px 12px',
                  borderRadius: '6px',
                  border: '1px solid #E5E7EB',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#034AA0', flexShrink: 0 }} />
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#111827', fontFamily: 'monospace' }}>{acc.u}</span>
                <span style={{ fontSize: '12px', color: '#6B7280', marginLeft: 'auto', fontWeight: 500 }}>{acc.role}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}