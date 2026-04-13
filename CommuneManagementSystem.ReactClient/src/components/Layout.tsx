import React, { useEffect, useRef, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Bell, CalendarDays, ChevronDown, KeyRound, LogOut, Menu, Users } from 'lucide-react';
import { Badge, Button, Dropdown, Form, Input, message, Modal, Typography } from 'antd';
import type { MenuProps } from 'antd';
import Sidebar from './Sidebar';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import { notificationService } from '../services/notificationService';
import { NotificationItem } from '../types';
import { useMediaQuery } from '../utils/useMediaQuery';

const { Text } = Typography;

const routeMeta: Record<string, { title: string; breadcrumb: string }> = {
  '/': { title: 'Tổng quan', breadcrumb: 'Trang chủ' },
  '/households': { title: 'Hộ khẩu', breadcrumb: 'Dân cư / Hộ khẩu' },
  '/persons': { title: 'Nhân khẩu', breadcrumb: 'Dân cư / Nhân khẩu' },
  '/temporary-residence': { title: 'Tạm trú', breadcrumb: 'Dân cư / Tạm trú' },
  '/temporary-absence': { title: 'Tạm vắng', breadcrumb: 'Dân cư / Tạm vắng' },
  '/reports': { title: 'Báo cáo', breadcrumb: 'Phân tích / Báo cáo' },
  '/notifications': { title: 'Thông báo', breadcrumb: 'Phân tích / Thông báo' },
  '/meetings': { title: 'Lịch họp', breadcrumb: 'Phân tích / Lịch họp' },
  '/library': { title: 'Kho tài liệu', breadcrumb: 'Phân tích / Kho tài liệu' },
  '/feedback': { title: 'Phản ánh', breadcrumb: 'Phân tích / Phản ánh' },
  '/tasks': { title: 'Nhiệm vụ', breadcrumb: 'Điều hành / Nhiệm vụ' },
  '/projects': { title: 'Dự án', breadcrumb: 'Điều hành / Dự án' },
  '/human-resources': { title: 'Nhân sự & Lương', breadcrumb: 'Hệ thống / Nhân sự & Lương' },
  '/users': { title: 'Người dùng', breadcrumb: 'Hệ thống / Người dùng' },
  '/logs': { title: 'Nhật ký', breadcrumb: 'Hệ thống / Nhật ký' },
  '/login-history': { title: 'Lịch sử đăng nhập', breadcrumb: 'Hệ thống / Lịch sử đăng nhập' },
  '/settings': { title: 'Tham số', breadcrumb: 'Hệ thống / Tham số' },
  '/catalogs': { title: 'Danh mục', breadcrumb: 'Hệ thống / Danh mục' },
  '/user-groups': { title: 'Nhóm người dùng', breadcrumb: 'Hệ thống / Nhóm người dùng' },
  '/backup': { title: 'Sao lưu', breadcrumb: 'Hệ thống / Sao lưu' },
};

type ChangePasswordValues = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

type ProfileValues = {
  fullName: string;
  email?: string;
  phoneNumber?: string;
};

export default function Layout() {
  const { user, logout, updateUser } = useAuth();
  const isMobile = useMediaQuery('(max-width: 767px)');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const [changePasswordForm] = Form.useForm<ChangePasswordValues>();
  const [profileForm] = Form.useForm<ProfileValues>();
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    setProfileOpen(false);
    setMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!profileOpen) {
      return undefined;
    }

    const handler = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [profileOpen]);

  useEffect(() => {
    if (user?.passwordWarningMessage && !sessionStorage.getItem('password-warning-shown')) {
      messageApi.warning(user.passwordWarningMessage);
      sessionStorage.setItem('password-warning-shown', '1');
    }
  }, [messageApi, user?.passwordWarningMessage]);

  useEffect(() => {
    notificationService.getAll({ status: 'Published' })
      .then((response) => {
        setNotifications(response.data);
        setUnreadCount(response.data.length);
      })
      .catch(() => undefined);
  }, []);

  const currentMeta = routeMeta[location.pathname] ?? routeMeta['/'];
  const initials = user?.fullName
    ?.split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((segment) => segment[0])
    .join('')
    .toUpperCase() ?? 'U';
  const today = new Date().toLocaleDateString('vi-VN', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  const roleLabel = user?.role === 'Admin'
    ? 'Quản trị viên'
    : user?.role === 'NhanKhau'
      ? 'Cán bộ nhân khẩu'
      : 'Cán bộ hộ khẩu';

  const dropdownItems: MenuProps['items'] = [
    {
      key: 'change-pw',
      label: 'Đổi mật khẩu',
      icon: <KeyRound size={14} />,
      onClick: () => {
        setProfileOpen(false);
        setChangePasswordOpen(true);
      },
    },
    {
      key: 'profile',
      label: 'Hồ sơ tài khoản',
      icon: <Users size={14} />,
      onClick: () => {
        setProfileOpen(false);
        profileForm.setFieldsValue({
          fullName: user?.fullName || '',
          email: user?.email || undefined,
          phoneNumber: user?.phoneNumber || undefined,
        });
        setProfileModalOpen(true);
      },
    },
    { type: 'divider' },
    {
      key: 'logout',
      label: 'Đăng xuất',
      icon: <LogOut size={14} />,
      danger: true,
      onClick: () => {
        setProfileOpen(false);
        logout();
      },
    },
  ];

  const handleChangePassword = async () => {
    try {
      const values = await changePasswordForm.validateFields();
      setChangingPassword(true);
      await authService.changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      messageApi.success('Đã đổi mật khẩu.');
      setChangePasswordOpen(false);
      changePasswordForm.resetFields();
      sessionStorage.removeItem('password-warning-shown');
    } catch (error: any) {
      if (error?.errorFields) {
        return;
      }
      messageApi.error(error?.response?.data?.message || 'Không thể đổi mật khẩu.');
    } finally {
      setChangingPassword(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      const values = await profileForm.validateFields();
      setSavingProfile(true);
      const response = await authService.updateProfile(values);
      updateUser(response.data);
      messageApi.success('Đã cập nhật hồ sơ.');
      setProfileModalOpen(false);
    } catch (error: any) {
      if (error?.errorFields) {
        return;
      }
      messageApi.error(error?.response?.data?.message || 'Không thể cập nhật hồ sơ.');
    } finally {
      setSavingProfile(false);
    }
  };

  const notificationPanelWidth = isMobile ? 'min(320px, calc(100vw - 24px))' : 360;
  const profilePanelWidth = isMobile ? 'min(240px, calc(100vw - 24px))' : 220;

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {contextHolder}

      <Sidebar
        onNavigate={() => undefined}
        userRole={user?.role}
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed((value) => !value)}
        mobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
      />

      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <header
          style={{
            minHeight: isMobile ? 56 : 64,
            borderBottom: '1px solid var(--color-border)',
            background: 'var(--color-surface)',
            display: 'flex',
            alignItems: 'center',
            padding: isMobile ? '10px 12px' : '0 24px',
            gap: isMobile ? 10 : 16,
            flexShrink: 0,
          }}
        >
          <Button
            type="text"
            icon={<Menu size={18} />}
            onClick={() => setMobileMenuOpen((value) => !value)}
            className="mobile-menu-btn"
            style={{ fontSize: 18, marginRight: isMobile ? 4 : 12 }}
          />

          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: isMobile ? 10 : 11,
                color: 'var(--color-text-muted)',
                fontWeight: 600,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {currentMeta.breadcrumb}
            </div>
            <div
              style={{
                fontSize: isMobile ? 16 : 17,
                fontWeight: 700,
                color: 'var(--color-text)',
                lineHeight: 1.2,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {currentMeta.title}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 6 : 10, flexShrink: 0 }}>
            {!isMobile && (
              <div
                className="topbar-date-badge"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '6px 12px',
                  borderRadius: 8,
                  background: 'var(--color-surface-secondary)',
                  border: '1px solid var(--color-border)',
                  fontSize: 12,
                  color: 'var(--color-text-secondary)',
                  fontWeight: 500,
                }}
              >
                <CalendarDays size={14} />
                <span>{today}</span>
              </div>
            )}

            <Dropdown
              trigger={['click']}
              placement="bottomRight"
              popupRender={() => (
                <div
                  style={{
                    width: notificationPanelWidth,
                    background: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 16,
                    boxShadow: 'var(--shadow-lg)',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      padding: '14px 20px',
                      borderBottom: '1px solid var(--color-border)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <Text strong style={{ fontSize: 15 }}>Thông báo</Text>
                    {unreadCount > 0 && (
                      <Badge count={unreadCount} style={{ backgroundColor: '#DC2626' }} />
                    )}
                  </div>

                  {notifications.length === 0 ? (
                    <div style={{ padding: 32, textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>
                      Không có thông báo nào.
                    </div>
                  ) : (
                    <div style={{ maxHeight: isMobile ? 320 : 360, overflowY: 'auto' }}>
                      {notifications.slice(0, 10).map((item) => (
                        <div
                          key={item.id}
                          style={{
                            padding: '12px 20px',
                            borderBottom: '1px solid var(--color-border)',
                            cursor: 'pointer',
                            transition: 'background 0.15s',
                          }}
                          onMouseEnter={(event) => { event.currentTarget.style.background = 'var(--color-surface-secondary)'; }}
                          onMouseLeave={(event) => { event.currentTarget.style.background = ''; }}
                        >
                          <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--color-text)', marginBottom: 2 }}>{item.title}</div>
                          <div style={{ fontSize: 12, color: '#94a3b8' }}>{item.summary}</div>
                          <div style={{ fontSize: 11, color: '#cbd5e1', marginTop: 4 }}>
                            {new Date(item.createdAt).toLocaleString('vi-VN')}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div
                    style={{ padding: '10px 20px', textAlign: 'center', borderTop: '1px solid var(--color-border)', cursor: 'pointer' }}
                    onClick={() => navigate('/notifications')}
                  >
                    <Text style={{ fontSize: 13, color: 'var(--color-primary)' }}>Xem tất cả thông báo</Text>
                  </div>
                </div>
              )}
            >
              <Badge count={unreadCount} size="small" offset={[-2, 2]} style={{ backgroundColor: unreadCount > 0 ? '#DC2626' : undefined }}>
                <Button type="text" icon={<Bell size={18} />} />
              </Badge>
            </Dropdown>

            <div ref={profileMenuRef} style={{ position: 'relative' }}>
              <Button
                type="text"
                onClick={() => setProfileOpen((value) => !value)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  height: 40,
                  padding: isMobile ? '0 8px' : '0 12px',
                  border: '1px solid var(--color-border)',
                  borderRadius: 10,
                }}
              >
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 8,
                    background: 'var(--color-primary)',
                    color: '#fff',
                    fontSize: 12,
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {initials}
                </div>

                {!isMobile && (
                  <>
                    <div style={{ textAlign: 'left', lineHeight: 1.3, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          color: 'var(--color-text)',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          maxWidth: 140,
                        }}
                      >
                        {user?.fullName ?? 'Người dùng'}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{roleLabel}</div>
                    </div>
                    <ChevronDown
                      size={14}
                      style={{
                        color: 'var(--color-text-muted)',
                        transition: 'transform 0.2s',
                        transform: profileOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                      }}
                    />
                  </>
                )}
              </Button>

              {profileOpen && (
                <div
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 8px)',
                    right: 0,
                    width: profilePanelWidth,
                    background: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-lg)',
                    boxShadow: 'var(--shadow-lg)',
                    overflow: 'hidden',
                    zIndex: 50,
                  }}
                >
                  <div
                    style={{
                      padding: 16,
                      background: 'var(--color-surface-secondary)',
                      borderBottom: '1px solid var(--color-border)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                    }}
                  >
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 10,
                        background: 'var(--color-primary)',
                        color: '#fff',
                        fontSize: 14,
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {initials}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.fullName}</div>
                      <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>@{user?.username}</div>
                    </div>
                  </div>

                  <div style={{ padding: 8 }}>
                    {dropdownItems.filter((item) => item && item.key !== 'divider').map((item) => (
                      <div
                        key={item!.key}
                        onClick={() => (item as any).onClick?.()}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          padding: '9px 12px',
                          borderRadius: 8,
                          cursor: 'pointer',
                          fontSize: 13,
                          fontWeight: 500,
                          color: (item as any).danger ? 'var(--color-danger)' : 'var(--color-text)',
                          transition: 'background 0.15s',
                          background: 'transparent',
                        }}
                        onMouseEnter={(event) => {
                          event.currentTarget.style.background = (item as any).danger
                            ? 'var(--color-danger-bg)'
                            : 'var(--color-surface-secondary)';
                        }}
                        onMouseLeave={(event) => {
                          event.currentTarget.style.background = 'transparent';
                        }}
                      >
                        <span style={{ color: 'var(--color-text-muted)' }}>{(item as any).icon}</span>
                        {(item as any).label}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <main style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
          <Outlet />
        </main>
      </div>

      <Modal
        title="Đổi mật khẩu"
        open={changePasswordOpen}
        confirmLoading={changingPassword}
        onCancel={() => {
          setChangePasswordOpen(false);
          changePasswordForm.resetFields();
        }}
        onOk={() => void handleChangePassword()}
        okText="Cập nhật"
      >
        <Form form={changePasswordForm} layout="vertical">
          <Form.Item name="currentPassword" label="Mật khẩu hiện tại" rules={[{ required: true, message: 'Nhập mật khẩu hiện tại.' }]}>
            <Input.Password autoComplete="current-password" />
          </Form.Item>
          <Form.Item
            name="newPassword"
            label="Mật khẩu mới"
            rules={[
              { required: true, message: 'Nhập mật khẩu mới.' },
              { min: 4, message: 'Tối thiểu 4 ký tự.' },
            ]}
          >
            <Input.Password autoComplete="new-password" />
          </Form.Item>
          <Form.Item
            name="confirmPassword"
            label="Nhập lại mật khẩu mới"
            dependencies={['newPassword']}
            rules={[
              { required: true, message: 'Nhập lại mật khẩu.' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Mật khẩu nhập lại không khớp.'));
                },
              }),
            ]}
          >
            <Input.Password autoComplete="new-password" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Hồ sơ tài khoản"
        open={profileModalOpen}
        confirmLoading={savingProfile}
        onCancel={() => {
          setProfileModalOpen(false);
          profileForm.resetFields();
        }}
        onOk={() => void handleSaveProfile()}
        okText="Lưu thay đổi"
      >
        <div style={{ marginBottom: 16, padding: 12, background: 'var(--color-surface-secondary)', borderRadius: 8, fontSize: 13 }}>
          <div><strong>Tài khoản:</strong> @{user?.username}</div>
          <div><strong>Vai trò:</strong> {roleLabel}</div>
        </div>
        <Form form={profileForm} layout="vertical">
          <Form.Item name="fullName" label="Họ tên" rules={[{ required: true, message: 'Nhập họ tên.' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="email" label="Email">
            <Input type="email" />
          </Form.Item>
          <Form.Item name="phoneNumber" label="Số điện thoại">
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
