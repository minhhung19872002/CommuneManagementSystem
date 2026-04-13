import React, { useCallback, useEffect, useState } from 'react';
import {
  DeleteOutlined,
  EditOutlined,
  LockOutlined,
  PlusOutlined,
  UnlockOutlined,
} from '@ant-design/icons';
import { Avatar, Button, Card, Form, Input, Modal, Popconfirm, Select, Tag, message } from 'antd';
import { userService } from '../services/userService';
import { AppUser } from '../types';
import './Users.css';

const roleConfig: Record<string, { label: string; color: string; tagColor: string }> = {
  Admin: { label: 'Quản trị viên', color: '#7C3AED', tagColor: 'purple' },
  NhanKhau: { label: 'Cán bộ NK', color: '#2563EB', tagColor: 'blue' },
  HoKhau: { label: 'Cán bộ HK', color: '#10B981', tagColor: 'green' },
};

export default function Users() {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{ open: boolean; mode: 'create' | 'edit'; user?: AppUser }>({
    open: false,
    mode: 'create',
  });
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await userService.getAll();
      setUsers(response.data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const openCreate = () => {
    form.resetFields();
    setModal({ open: true, mode: 'create' });
  };

  const openEdit = (user: AppUser) => {
    form.setFieldsValue({
      username: user.username,
      fullName: user.fullName,
      role: user.role,
      status: user.status,
    });
    setModal({ open: true, mode: 'edit', user });
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      if (modal.mode === 'create') {
        await userService.create(values);
        messageApi.success('Thêm người dùng thành công.');
      } else {
        await userService.update(modal.user!.id, {
          fullName: values.fullName,
          role: values.role,
          status: values.status,
        });
        messageApi.success('Cập nhật vai trò thành công.');
      }

      setModal({ open: false, mode: 'create' });
      form.resetFields();
      void load();
    } catch (error: any) {
      messageApi.error(error?.response?.data?.message || 'Không thể lưu người dùng.');
    }
  };

  const handleToggle = async (user: AppUser) => {
    try {
      await userService.update(user.id, { status: user.status === 'Active' ? 'Inactive' : 'Active' });
      messageApi.success(user.status === 'Active' ? 'Đã khóa tài khoản.' : 'Đã mở khóa tài khoản.');
      void load();
    } catch {
      messageApi.error('Có lỗi xảy ra.');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await userService.delete(id);
      messageApi.success('Xóa người dùng thành công.');
      void load();
    } catch {
      messageApi.error('Xóa thất bại.');
    }
  };

  return (
    <div className="civic-page page-wrapper">
      {contextHolder}

      <div className="civic-page-hero">
        <div className="civic-page-hero__inner">
          <div className="civic-page-hero__left">
            <div className="civic-page-hero__eyebrow">Hệ thống / Người dùng</div>
            <h1 className="civic-page-hero__title">Quản lý Người dùng</h1>
            <p className="civic-page-hero__subtitle">
              Thêm, chỉnh sửa vai trò và quản lý trạng thái tài khoản người dùng trong hệ thống.
            </p>
          </div>
          <div className="civic-page-hero__actions">
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
              Thêm người dùng
            </Button>
          </div>
        </div>
      </div>

      <div className="responsive-grid responsive-grid--cards-wide" style={{ gap: '16px' }}>
        {users.map((user) => {
          const config = roleConfig[user.role] || roleConfig.NhanKhau;
          return (
            <Card
              key={user.id}
              loading={loading}
              className="users-card"
              styles={{ body: { padding: 0 } }}
            >
              <div
                className="users-card__header"
                style={{
                  background: `linear-gradient(135deg, ${config.color}12, ${config.color}04)`,
                }}
              >
                <Avatar size={48} style={{ background: config.color, fontWeight: 800, fontSize: '18px', flexShrink: 0 }}>
                  {user.fullName.charAt(0)}
                </Avatar>
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <div style={{ fontWeight: 700, fontSize: '15px', color: '#1a1a1a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {user.fullName}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px', flexWrap: 'wrap' }}>
                    <Tag color={config.tagColor} style={{ margin: 0 }}>{config.label}</Tag>
                    <Tag color={user.status === 'Active' ? 'success' : 'default'} style={{ margin: 0 }}>
                      {user.status === 'Active' ? 'Hoạt động' : 'Khóa'}
                    </Tag>
                  </div>
                </div>
              </div>

              <div className="users-card__body">
                <div className="users-card__meta-row">
                  {[
                    { label: 'Tài khoản', value: `@${user.username}` },
                    { label: 'Ngày tạo', value: new Date(user.createdAt).toLocaleDateString('vi-VN') },
                    ...(user.lastLoginAt
                      ? [{ label: 'Đăng nhập gần nhất', value: new Date(user.lastLoginAt).toLocaleString('vi-VN') }]
                      : []),
                  ].map((item) => (
                    <div key={item.label} className="users-card__meta-item">
                      <span className="users-card__meta-label">{item.label}</span>
                      <span className="users-card__meta-value">{item.value}</span>
                    </div>
                  ))}
                </div>

                <div className="users-card__actions">
                  <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(user)}>
                    Vai trò
                  </Button>
                  <Popconfirm
                    title={user.status === 'Active' ? 'Khóa tài khoản?' : 'Mở khóa tài khoản?'}
                    onConfirm={() => handleToggle(user)}
                    okText="Xác nhận"
                  >
                    <Button size="small" icon={user.status === 'Active' ? <LockOutlined /> : <UnlockOutlined />}>
                      {user.status === 'Active' ? 'Khóa' : 'Mở'}
                    </Button>
                  </Popconfirm>
                  <Popconfirm
                    title="Xóa người dùng?"
                    onConfirm={() => handleDelete(user.id)}
                    okText="Xóa"
                    okButtonProps={{ danger: true }}
                  >
                    <Button size="small" danger icon={<DeleteOutlined />} className="users-card__actions--full">
                      Xóa
                    </Button>
                  </Popconfirm>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {!loading && users.length === 0 && (
        <div className="civic-empty-state">
          Chưa có người dùng nào
        </div>
      )}

      <Modal
        title={modal.mode === 'create' ? 'Thêm người dùng mới' : 'Chỉnh sửa vai trò người dùng'}
        open={modal.open}
        onCancel={() => {
          setModal({ open: false, mode: 'create' });
          form.resetFields();
        }}
        onOk={() => void handleSubmit()}
        okText={modal.mode === 'create' ? 'Thêm mới' : 'Lưu thay đổi'}
        width={440}
      >
        <Form form={form} layout="vertical" style={{ marginTop: '16px' }}>
          <Form.Item name="username" label="Tài khoản" rules={[{ required: true, message: 'Vui lòng nhập tài khoản.' }]}>
            <Input placeholder="Tên đăng nhập" disabled={modal.mode === 'edit'} />
          </Form.Item>

          {modal.mode === 'create' && (
            <Form.Item
              name="password"
              label="Mật khẩu"
              rules={[
                { required: true, message: 'Vui lòng nhập mật khẩu.' },
                { min: 4, message: 'Mật khẩu tối thiểu 4 ký tự.' },
              ]}
            >
              <Input.Password placeholder="Mật khẩu" />
            </Form.Item>
          )}

          <Form.Item name="fullName" label="Họ tên" rules={[{ required: true, message: 'Vui lòng nhập họ tên.' }]}>
            <Input placeholder="Họ và tên đầy đủ" />
          </Form.Item>

          <Form.Item name="role" label="Vai trò" rules={[{ required: true }]}>
            <Select
              options={[
                { label: 'Quản trị viên', value: 'Admin' },
                { label: 'Cán bộ Nhân khẩu', value: 'NhanKhau' },
                { label: 'Cán bộ Hộ khẩu', value: 'HoKhau' },
              ]}
            />
          </Form.Item>

          {modal.mode === 'edit' && (
            <Form.Item name="status" label="Trạng thái" rules={[{ required: true }]}>
              <Select
                options={[
                  { label: 'Hoạt động', value: 'Active' },
                  { label: 'Khóa', value: 'Inactive' },
                ]}
              />
            </Form.Item>
          )}
        </Form>
      </Modal>
    </div>
  );
}
