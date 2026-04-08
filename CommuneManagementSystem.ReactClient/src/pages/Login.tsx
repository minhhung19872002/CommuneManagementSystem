import React, { useState } from 'react';
import { Button, Form, Input, message } from 'antd';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { ArrowRight, Building2, ShieldCheck } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

interface LoginForm {
  username: string;
  password: string;
}

const demoAccounts = [
  { u: 'admin', p: '123', role: 'Quản trị viên', note: 'Toàn quyền vận hành hệ thống' },
  { u: 'nhankhau', p: '123', role: 'Cán bộ nhân khẩu', note: 'Phụ trách hồ sơ công dân' },
  { u: 'hokhau', p: '123', role: 'Cán bộ hộ khẩu', note: 'Phụ trách biến động hộ dân' },
];

const highlightMetrics = [
  { value: '24/7', label: 'Giám sát dữ liệu thời gian thực' },
  { value: '03', label: 'Nhóm nghiệp vụ được phân quyền' },
  { value: '100%', label: 'Luồng báo cáo số hóa nội bộ' },
];

export default function Login() {
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm<LoginForm>();

  const resolveLoginError = (error: unknown) => {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;

      if (status === 401) {
        return 'Tài khoản hoặc mật khẩu không đúng.';
      }

      if (status === 502 || status === 503 || status === 504 || error.code === 'ERR_NETWORK') {
        return 'Không kết nối được máy chủ API. Hãy chạy backend tại http://127.0.0.1:5068 rồi thử lại.';
      }
    }

    return 'Đăng nhập thất bại. Vui lòng thử lại.';
  };

  const onFinish = async (values: LoginForm) => {
    setLoading(true);
    try {
      await login(values.username, values.password);
    } catch (error) {
      message.error(resolveLoginError(error));
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (username: string, password: string) => {
    form.setFieldsValue({ username, password });
  };

  return (
    <div
      data-testid="login-page"
      className="relative min-h-screen overflow-hidden px-4 py-6 lg:px-6 lg:py-8"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(3,74,160,0.18),_transparent_30%),radial-gradient(circle_at_80%_10%,_rgba(26,116,218,0.12),_transparent_18%)]" />

      <div className="relative mx-auto flex min-h-[calc(100vh-3rem)] max-w-6xl overflow-hidden rounded-[32px] border border-white/70 bg-white/74 shadow-[0_30px_80px_rgba(15,23,42,0.12)] backdrop-blur-xl">
        <section className="hidden w-[44%] flex-col justify-between bg-[linear-gradient(160deg,#034AA0_0%,#0C56B6_52%,#1A74DA_100%)] p-10 text-white lg:flex">
          <div>
            <div className="inline-flex items-center gap-3 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white/90 backdrop-blur">
              <Building2 className="h-4 w-4" />
              Commune Data Hub
            </div>

            <div className="mt-10 space-y-5">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/12 px-4 py-2 text-sm font-semibold text-white/90">
                <ShieldCheck className="h-4 w-4" />
                Nền tảng tác nghiệp hành chính địa phương
              </div>

              <div>
                <h1 className="max-w-md text-4xl font-extrabold leading-tight tracking-[-0.04em]">
                  Không gian điều hành dân cư thống nhất cho cấp xã.
                </h1>
                <p className="mt-4 max-w-lg text-sm leading-7 text-white/80">
                  Theo dõi hộ khẩu, nhân khẩu, biến động tạm trú và báo cáo vận hành trong một giao diện
                  rõ ràng, nhất quán và dễ sử dụng cho cán bộ nghiệp vụ.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid gap-4">
              {highlightMetrics.map((metric) => (
                <div
                  key={metric.label}
                  className="rounded-[24px] border border-white/16 bg-white/10 p-5 backdrop-blur-sm"
                >
                  <p className="text-3xl font-extrabold tracking-[-0.04em]">{metric.value}</p>
                  <p className="mt-2 text-sm leading-6 text-white/78">{metric.label}</p>
                </div>
              ))}
            </div>

            <div className="rounded-[24px] border border-white/16 bg-slate-950/10 p-5">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/70">Điểm nhấn giao diện</p>
              <div className="mt-4 grid gap-3 text-sm text-white/82">
                <div className="flex items-center justify-between rounded-2xl bg-white/10 px-4 py-3">
                  <span>Thanh điều hướng theo vai trò</span>
                  <ArrowRight className="h-4 w-4" />
                </div>
                <div className="flex items-center justify-between rounded-2xl bg-white/10 px-4 py-3">
                  <span>Dashboard chỉ số trực quan</span>
                  <ArrowRight className="h-4 w-4" />
                </div>
                <div className="flex items-center justify-between rounded-2xl bg-white/10 px-4 py-3">
                  <span>Biểu mẫu và bảng thống nhất</span>
                  <ArrowRight className="h-4 w-4" />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="flex flex-1 items-center justify-center px-5 py-8 sm:px-8 lg:px-12">
          <div className="w-full max-w-lg">
            <div className="mb-8 lg:hidden">
              <div className="inline-flex items-center gap-2 rounded-full bg-[#ebf3fc] px-4 py-2 text-sm font-semibold text-primary">
                <Building2 className="h-4 w-4" />
                Commune Data Hub
              </div>
            </div>

            <div className="mb-8">
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#61748f]">
                Hệ thống quản lý dân cư
              </p>
              <h2 className="mt-3 text-3xl font-extrabold tracking-[-0.04em] text-[#1d2736]">
                Đăng nhập để tiếp tục phiên làm việc
              </h2>
              <p className="mt-3 text-sm leading-7 text-[#6b7280]">
                Sử dụng tài khoản đã được cấp để truy cập bảng điều hành, hồ sơ công dân và các báo cáo
                tác nghiệp của hệ thống.
              </p>
            </div>

            <div className="rounded-[28px] border border-white/75 bg-white/92 p-6 shadow-[0_24px_60px_rgba(15,23,42,0.08)] sm:p-7">
              <Form form={form} layout="vertical" onFinish={onFinish} size="large" data-testid="login-form">
                <Form.Item
                  name="username"
                  label="Tài khoản"
                  rules={[{ required: true, message: 'Vui lòng nhập tài khoản.' }]}
                >
                  <Input
                    data-testid="login-username"
                    prefix={<UserOutlined className="text-[#7b8aa5]" />}
                    placeholder="Nhập tài khoản..."
                    autoComplete="username"
                  />
                </Form.Item>

                <Form.Item
                  name="password"
                  label="Mật khẩu"
                  rules={[{ required: true, message: 'Vui lòng nhập mật khẩu.' }]}
                >
                  <Input.Password
                    data-testid="login-password"
                    prefix={<LockOutlined className="text-[#7b8aa5]" />}
                    placeholder="Nhập mật khẩu..."
                    autoComplete="current-password"
                  />
                </Form.Item>

                <Button
                  data-testid="login-submit"
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  className="mt-2 h-12 w-full !rounded-2xl !font-extrabold"
                >
                  Đăng nhập hệ thống
                </Button>
              </Form>
            </div>

            <div className="mt-5 rounded-[28px] border border-white/75 bg-white/85 p-5 shadow-[0_20px_45px_rgba(15,23,42,0.06)]">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-extrabold text-[#1d2736]">Tài khoản demo</p>
                  <p className="text-xs leading-5 text-[#6b7280]">Nhấn để tự động điền thông tin đăng nhập.</p>
                </div>
                <span className="rounded-full bg-[#ebf3fc] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-primary">
                  Quick Fill
                </span>
              </div>

              <div className="space-y-3">
                {demoAccounts.map((account) => (
                  <button
                    key={account.u}
                    type="button"
                    data-testid={`demo-account-${account.u}`}
                    onClick={() => fillDemo(account.u, account.p)}
                    className="flex w-full items-center gap-4 rounded-[22px] border border-[#e3ebf6] bg-[#f8fbff] px-4 py-4 text-left transition hover:border-[#c3d9f4] hover:bg-white"
                  >
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#ebf3fc] font-extrabold text-primary">
                      {account.u.slice(0, 2).toUpperCase()}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-extrabold text-[#1d2736]">{account.u}</span>
                        <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-bold text-[#61748f]">
                          {account.role}
                        </span>
                      </div>
                      <p className="mt-1 truncate text-xs leading-5 text-[#6b7280]">{account.note}</p>
                    </div>

                    <ArrowRight className="h-4 w-4 flex-none text-[#7b8aa5]" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
