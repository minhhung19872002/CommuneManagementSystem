import React, { useEffect, useState, useCallback } from 'react';
import { Button, Modal, Form, Input, Select, Card, Tag, Avatar, message, Popconfirm } from 'antd';
import { PlusOutlined, LockOutlined, UnlockOutlined, DeleteOutlined } from '@ant-design/icons';
import { userService } from '../services/userService';
import { AppUser } from '../types';

const roleConfig: Record<string, { label: string; color: string; tagColor: string }> = {
  Admin:    { label: 'Quản trị viên', color: '#7C3AED', tagColor: 'purple' },
  NhanKhau: { label: 'Cán bộ NK', color: '#2563EB', tagColor: 'blue' },
  HoKhau:  { label: 'Cán bộ HK', color: '#10B981', tagColor: 'green' },
};

export default function Users() {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();

  const load = useCallback(async () => {
    setLoading(true);
    try { const r = await userService.getAll(); setUsers(r.data); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async () => {
    try {
      const values = await form.validateFields();
      await userService.create(values);
      messageApi.success('Thêm người dùng thành công!');
      setModal(false);
      form.resetFields();
      load();
    } catch { messageApi.error('Có lỗi xảy ra!'); }
  };

  const handleToggle = async (u: AppUser) => {
    try {
      await userService.update(u.id, { status: u.status === 'Active' ? 'Inactive' : 'Active' });
      messageApi.success(u.status === 'Active' ? 'Đã khóa tài khoản!' : 'Đã mở khóa tài khoản!');
      load();
    } catch { messageApi.error('Có lỗi xảy ra!'); }
  };

  const handleDelete = async (id: number) => {
    try {
      await userService.delete(id);
      messageApi.success('Xóa người dùng thành công!');
      load();
    } catch { messageApi.error('Xóa thất bại!'); }
  };

  return (
    <>
      {contextHolder}

      {/* Page Header */}
      <div style={{ padding: '24px 24px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#32373C', margin: 0, lineHeight: 1.2 }}>Quản lý Người dùng</h1>
            <p style={{ fontSize: '13px', color: '#737373', margin: '4px 0 0' }}>{users.length} người dùng</p>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => { form.resetFields(); setModal(true); }}
          >
            Thêm người dùng
          </Button>
        </div>

        {/* User Cards Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
          {users.map(u => {
            const cfg = roleConfig[u.role] || roleConfig.NhanKhau;
            return (
              <Card
                key={u.id}
                loading={loading}
                style={{ borderRadius: '8px', border: '1px solid #E5E5E5' }}
                styles={{ body: { padding: 0 } }}
              >
                {/* Card Header */}
                <div style={{
                  padding: '20px',
                  background: `linear-gradient(135deg, ${cfg.color}15, ${cfg.color}05)`,
                  borderBottom: '1px solid #E5E5E5',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '14px',
                }}>
                  <Avatar
                    size={48}
                    style={{ background: cfg.color, fontWeight: 800, fontSize: '18px', flexShrink: 0 }}
                  >
                    {u.fullName.charAt(0)}
                  </Avatar>
                  <div style={{ flex: 1, overflow: 'hidden' }}>
                    <div style={{ fontWeight: 700, fontSize: '15px', color: '#32373C', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {u.fullName}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px', flexWrap: 'wrap' }}>
                      <Tag color={cfg.tagColor} style={{ margin: 0 }}>{cfg.label}</Tag>
                      <Tag color={u.status === 'Active' ? 'success' : 'default'} style={{ margin: 0 }}>
                        {u.status === 'Active' ? 'Hoạt động' : 'Khóa'}
                      </Tag>
                    </div>
                  </div>
                </div>
                {/* Card Body */}
                <div style={{ padding: '16px 20px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {[
                      { label: 'Tài khoản', value: `@${u.username}` },
                      { label: 'Ngày tạo', value: new Date(u.createdAt).toLocaleDateString('vi-VN') },
                      ...(u.lastLoginAt ? [{ label: 'Đăng nhập gần nhất', value: new Date(u.lastLoginAt).toLocaleString('vi-VN') }] : []),
                    ].map(item => (
                      <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '12px', color: '#737373' }}>{item.label}</span>
                        <span style={{ fontSize: '12.5px', fontWeight: 500, color: '#32373C' }}>{item.value}</span>
                      </div>
                    ))}
                  </div>
                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '8px', marginTop: '14px', paddingTop: '14px', borderTop: '1px solid #F5F5F5' }}>
                    <Popconfirm
                      title={u.status === 'Active' ? 'Khóa tài khoản?' : 'Mở khóa tài khoản?'}
                      onConfirm={() => handleToggle(u)}
                      okText="Xác nhận"
                    >
                      <Button
                        size="small"
                        icon={u.status === 'Active' ? <LockOutlined /> : <UnlockOutlined />}
                        style={{
                          flex: 1,
                          borderRadius: '6px', fontWeight: 600,
                          background: u.status === 'Active' ? '#FFFBEB' : '#ECFDF5',
                          color: u.status === 'Active' ? '#D97706' : '#059669',
                          borderColor: u.status === 'Active' ? '#FCD34D' : '#6EE7B7',
                        }}
                      >
                        {u.status === 'Active' ? 'Khóa' : 'Mở'}
                      </Button>
                    </Popconfirm>
                    <Popconfirm title="Xóa người dùng?" onConfirm={() => handleDelete(u.id)} okText="Xóa" okButtonProps={{ danger: true }}>
                      <Button size="small" danger icon={<DeleteOutlined />} style={{ flex: 1, borderRadius: '6px', fontWeight: 600 }}>
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
          <div style={{ textAlign: 'center', padding: '60px', color: '#737373' }}>
            Chưa có người dùng nào
          </div>
        )}
      </div>

      {/* Create User Modal */}
      <Modal
        title="Thêm người dùng mới"
        open={modal}
        onCancel={() => { setModal(false); form.resetFields(); }}
        onOk={handleCreate}
        okText="Thêm mới"
        width={440}
      >
        <Form form={form} layout="vertical" style={{ marginTop: '16px' }}>
          <Form.Item name="username" label="Tài khoản" rules={[{ required: true, message: 'Vui lòng nhập tài khoản!' }]}>
            <Input placeholder="Tên đăng nhập" />
          </Form.Item>
          <Form.Item
            name="password"
            label="Mật khẩu"
            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }, { min: 4, message: 'Mật khẩu tối thiểu 4 ký tự!' }]}
          >
            <Input.Password placeholder="Mật khẩu" />
          </Form.Item>
          <Form.Item name="fullName" label="Họ tên" rules={[{ required: true, message: 'Vui lòng nhập họ tên!' }]}>
            <Input placeholder="Họ và tên đầy đủ" />
          </Form.Item>
          <Form.Item name="role" label="Vai trò" rules={[{ required: true }]} initialValue="NhanKhau">
            <Select
              options={[
                { label: 'Quản trị viên', value: 'Admin' },
                { label: 'Cán bộ Nhân khẩu', value: 'NhanKhau' },
                { label: 'Cán bộ Hộ khẩu', value: 'HoKhau' },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
