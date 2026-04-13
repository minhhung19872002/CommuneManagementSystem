import React, { useState } from 'react';
import { Button, Card, Form, Input, Modal, message, Typography } from 'antd';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { Building2, ShieldCheck } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import { useMediaQuery } from '../utils/useMediaQuery';

const { Text, Title } = Typography;

interface LoginForm {
  username: string;
  password: string;
}

interface ResetForm {
  username: string;
  fullName?: string;
  newPassword: string;
  confirmPassword: string;
}

const demoAccounts = [
  { u: 'admin', p: '123', role: 'Quản trị viên', note: 'Toàn quyền vận hành' },
  { u: 'nhankhau', p: '123', role: 'Cán bộ nhân khẩu', note: 'Phụ trách hồ sơ công dân' },
  { u: 'hokhau', p: '123', role: 'Cán bộ hộ khẩu', note: 'Phụ trách biến động hộ' },
];

const s = {
  page: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 16px', background: '#f1f5f9' } as React.CSSProperties,
  shell: { display: 'grid', gridTemplateColumns: '1fr 1fr', maxWidth: 1100, width: '100%', minHeight: 620, borderRadius: 20, overflow: 'hidden', background: '#fff', border: '1px solid #e2e8f0', boxShadow: '0 20px 60px rgba(0,0,0,0.08)' } as React.CSSProperties,
  aside: { padding: '40px 36px', background: 'linear-gradient(150deg, #1d4ed8 0%, #1e40af 50%, #2563eb 100%)', color: '#fff', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 24 } as React.CSSProperties,
  brand: { display: 'flex', alignItems: 'center', gap: 8, fontSize: 15, fontWeight: 700, color: '#fff' } as React.CSSProperties,
  badge: { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 999, background: 'rgba(255,255,255,0.15)', fontSize: 12, fontWeight: 600, color: '#fff' } as React.CSSProperties,
  headline: { margin: 0, fontSize: 'clamp(22px, 2.5vw, 32px)', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.15, color: '#fff' } as React.CSSProperties,
  headlineCopy: { margin: '12px 0 0', fontSize: 14, color: 'rgba(255,255,255,0.78)', lineHeight: 1.7 } as React.CSSProperties,
  metrics: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 } as React.CSSProperties,
  metricCard: { padding: '14px 12px', background: 'rgba(255,255,255,0.12)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.15)' } as React.CSSProperties,
  metricVal: { fontSize: 22, fontWeight: 800, color: '#fff', letterSpacing: '-0.03em' } as React.CSSProperties,
  metricLbl: { fontSize: 11, color: 'rgba(255,255,255,0.7)', marginTop: 4 } as React.CSSProperties,
  content: { padding: '40px 36px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 24 } as React.CSSProperties,
  headingLabel: { fontSize: 11, fontWeight: 700, color: 'var(--color-text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase' as const, margin: '0 0 6px' } as React.CSSProperties,
  headingTitle: { margin: 0, fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--color-text)' } as React.CSSProperties,
  headingSub: { margin: '6px 0 0', fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.6 } as React.CSSProperties,
  demoCard: { padding: 16, background: 'var(--color-surface-secondary)', border: '1px solid var(--color-border)', borderRadius: 12 } as React.CSSProperties,
  demoItem: { display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', border: '1px solid var(--color-border)', borderRadius: 10, background: '#fff', cursor: 'pointer', transition: 'all 0.15s', width: '100%', textAlign: 'left' } as React.CSSProperties,
  demoAvatar: { width: 36, height: 36, borderRadius: 9, background: 'var(--color-primary)', color: '#fff', fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 } as React.CSSProperties,
  demoName: { fontSize: 13, fontWeight: 700, color: 'var(--color-text)' } as React.CSSProperties,
  demoRole: { fontSize: 11, color: 'var(--color-primary)', fontWeight: 600, marginTop: 1 } as React.CSSProperties,
  demoNote: { fontSize: 11, color: 'var(--color-text-muted)', marginTop: 2 } as React.CSSProperties,
};

export default function Login() {
  const { login } = useAuth();
  const isTablet = useMediaQuery('(max-width: 960px)');
  const isMobile = useMediaQuery('(max-width: 640px)');
  const [loading, setLoading] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [form] = Form.useForm<LoginForm>();
  const [resetForm] = Form.useForm<ResetForm>();

  const resolveError = (error: unknown) => {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      if (status === 401) return 'Tài khoản hoặc mật khẩu không đúng.';
      if (status === 502 || status === 503 || error.code === 'ERR_NETWORK') return 'Không kết nối được API. Hãy chạy backend trước.';
    }
    return 'Đăng nhập thất bại.';
  };

  const onFinish = async (values: LoginForm) => {
    setLoading(true);
    try {
      await login(values.username, values.password);
    } catch (error) {
      message.error(resolveError(error));
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (username: string, password: string) => {
    form.setFieldsValue({ username, password });
  };

  const handleReset = async () => {
    try {
      const values = await resetForm.validateFields();
      setResetLoading(true);
      await authService.resetPassword({ username: values.username, fullName: values.fullName, newPassword: values.newPassword });
      message.success('Đã reset mật khẩu. Đăng nhập với mật khẩu mới.');
      setResetOpen(false);
      resetForm.resetFields();
    } catch (err: any) {
      if (err?.errorFields) return;
      message.error(err?.response?.data?.message || 'Không thể reset mật khẩu.');
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div style={s.page}>
      <div
        style={{
          ...s.shell,
          gridTemplateColumns: isTablet ? '1fr' : '1fr 1fr',
          minHeight: isTablet ? 'auto' : 620,
        }}
        className="login-shell"
      >
        {/* Left — branding */}
        <div
          style={{
            ...s.aside,
            padding: isMobile ? '24px 20px' : isTablet ? '32px 28px' : '40px 36px',
            order: isTablet ? 2 : 1,
          }}
        >
          <div style={s.brand}>
            <Building2 size={16} />
            CommuneHub
          </div>

          <div>
            <div style={s.badge}>
              <ShieldCheck size={13} />
              Nền tảng hành chính địa phương
            </div>
            <h1 style={{ ...s.headline, marginTop: 16 }}>
              Không gian điều hành<br />dân cư thống nhất.
            </h1>
            <p style={s.headlineCopy}>
              Theo dõi hộ khẩu, nhân khẩu, biến động tạm trú và báo cáo vận hành trong một giao diện rõ ràng cho cán bộ nghiệp vụ.
            </p>
          </div>

          <div
            style={{
              ...s.metrics,
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
            }}
          >
            {[{ v: '24/7', l: 'Giám sát thời gian thực' }, { v: '03', l: 'Nhóm nghiệp vụ' }, { v: '100%', l: 'Số hóa nội bộ' }].map(m => (
              <div key={m.l} style={s.metricCard}>
                <div style={s.metricVal}>{m.v}</div>
                <div style={s.metricLbl}>{m.l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right — form */}
        <div
          style={{
            ...s.content,
            padding: isMobile ? '24px 20px' : isTablet ? '32px 28px' : '40px 36px',
            order: 1,
          }}
        >
          <div>
            <div style={s.headingLabel}>Hệ thống quản lý dân cư</div>
            <Title level={4} style={{ ...s.headingTitle, marginTop: 4 }}>Đăng nhập hệ thống</Title>
            <Text style={s.headingSub}>Nhập thông tin tài khoản để truy cập bảng điều hành.</Text>
          </div>

          <Form form={form} layout="vertical" onFinish={onFinish}>
            <Form.Item name="username" label="Tài khoản" rules={[{ required: true, message: 'Nhập tài khoản.' }]}>
              <Input prefix={<UserOutlined />} placeholder="Tài khoản..." autoComplete="username" size="large" />
            </Form.Item>
            <Form.Item name="password" label="Mật khẩu" rules={[{ required: true, message: 'Nhập mật khẩu.' }]}>
              <Input.Password prefix={<LockOutlined />} placeholder="Mật khẩu..." autoComplete="current-password" size="large" />
            </Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block size="large" style={{ marginTop: 4, height: 48, fontWeight: 700 }}>
              Đăng nhập
            </Button>
            <Button type="link" onClick={() => setResetOpen(true)} style={{ padding: 0, marginTop: 4 }}>
              Quên mật khẩu?
            </Button>
          </Form>

          {/* Demo accounts */}
          <div style={s.demoCard}>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>Tài khoản demo — nhấn để điền</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {demoAccounts.map(a => (
                <button key={a.u} type="button" onClick={() => fillDemo(a.u, a.p)} style={s.demoItem}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--color-primary-border)'; (e.currentTarget as HTMLButtonElement).style.background = 'var(--color-primary-light)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--color-border)'; (e.currentTarget as HTMLButtonElement).style.background = '#fff'; }}
                >
                  <div style={s.demoAvatar}>{a.u.slice(0, 2).toUpperCase()}</div>
                  <div>
                    <div style={s.demoName}>@{a.u}</div>
                    <div style={s.demoRole}>{a.role}</div>
                    <div style={s.demoNote}>{a.note}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Reset Modal */}
      <Modal
        title="Reset mật khẩu"
        open={resetOpen}
        confirmLoading={resetLoading}
        onCancel={() => { setResetOpen(false); resetForm.resetFields(); }}
        onOk={() => void resetForm.submit()}
        okText="Cập nhật"
      >
        <Form form={resetForm} layout="vertical" onFinish={handleReset}>
          <Form.Item name="username" label="Tài khoản" rules={[{ required: true, message: 'Nhập tài khoản.' }]}>
            <Input autoComplete="username" />
          </Form.Item>
          <Form.Item name="fullName" label="Họ tên (tùy chọn — để xác thực)">
            <Input placeholder="Họ tên đầy đủ" />
          </Form.Item>
          <Form.Item name="newPassword" label="Mật khẩu mới"
            rules={[{ required: true, message: 'Nhập mật khẩu mới.' }, { min: 4, message: 'Tối thiểu 4 ký tự.' }]}
          >
            <Input.Password autoComplete="new-password" />
          </Form.Item>
          <Form.Item name="confirmPassword" label="Nhập lại mật khẩu" dependencies={['newPassword']}
            rules={[
              { required: true, message: 'Nhập lại mật khẩu.' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) return Promise.resolve();
                  return Promise.reject(new Error('Mật khẩu nhập lại không khớp.'));
                },
              }),
            ]}
          >
            <Input.Password autoComplete="new-password" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
