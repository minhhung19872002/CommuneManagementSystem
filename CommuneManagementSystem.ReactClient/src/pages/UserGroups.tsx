import React, { useEffect, useState } from 'react';
import { Avatar, Button, Card, Form, Input, Modal, Popconfirm, Select, Space, Tag, message } from 'antd';
import { DeleteOutlined, EditOutlined, PlusOutlined, TeamOutlined } from '@ant-design/icons';
import { userGroupService } from '../services/userGroupService';
import { userService } from '../services/userService';
import { AppUser, UserGroup } from '../types';
import './UserGroups.css';

type GroupFormValues = {
  name: string;
  description: string;
  userIds: number[];
};

export default function UserGroups() {
  const [groups, setGroups] = useState<UserGroup[]>([]);
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{ open: boolean; mode: 'create' | 'edit'; group?: UserGroup }>({
    open: false,
    mode: 'create',
  });
  const [form] = Form.useForm<GroupFormValues>();
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    void load();
  }, []);

  const load = async () => {
    setLoading(true);
    try {
      const [groupResponse, userResponse] = await Promise.all([userGroupService.getAll(), userService.getAll()]);
      setGroups(groupResponse.data);
      setUsers(userResponse.data);
    } catch {
      messageApi.error('Không thể tải nhóm người dùng.');
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    form.resetFields();
    form.setFieldsValue({ userIds: [] });
    setModal({ open: true, mode: 'create' });
  };

  const openEdit = (group: UserGroup) => {
    form.setFieldsValue({
      name: group.name,
      description: group.description,
      userIds: group.userIds,
    });
    setModal({ open: true, mode: 'edit', group });
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      if (modal.mode === 'create') {
        await userGroupService.create(values);
        messageApi.success('Đã tạo nhóm người dùng.');
      } else {
        await userGroupService.update(modal.group!.id, values);
        messageApi.success('Đã cập nhật nhóm người dùng.');
      }

      setModal({ open: false, mode: 'create' });
      form.resetFields();
      void load();
    } catch (error: any) {
      if (error?.errorFields) {
        return;
      }
      messageApi.error(error?.response?.data?.message || 'Không thể lưu nhóm người dùng.');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await userGroupService.delete(id);
      messageApi.success('Đã xóa nhóm người dùng.');
      void load();
    } catch (error: any) {
      messageApi.error(error?.response?.data?.message || 'Không thể xóa nhóm người dùng.');
    }
  };

  return (
    <div className="civic-page page-wrapper">
      {contextHolder}

      <div className="civic-page-hero">
        <div className="civic-page-hero__inner">
          <div className="civic-page-hero__left">
            <div className="civic-page-hero__eyebrow">Hệ thống / Nhóm</div>
            <h1 className="civic-page-hero__title">Nhóm người dùng</h1>
            <p className="civic-page-hero__subtitle">
              Tạo và quản lý nhóm người dùng để phân quyền truy cập hệ thống.
            </p>
          </div>
          <div className="civic-page-hero__actions">
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
              Tạo nhóm
            </Button>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 }}>
        {groups.map((group) => (
          <Card
            key={group.id}
            loading={loading}
            className="ug-card"
            styles={{ body: { padding: 0 } }}
          >
            <div className="ug-card__header">
              <div>
                <div className="ug-card__name">{group.name}</div>
                <div className="ug-card__desc">{group.description}</div>
              </div>
              <Tag color="blue" icon={<TeamOutlined />}>
                {group.memberCount} thành viên
              </Tag>
            </div>

            <div className="ug-card__members">
              {group.userNames.map((memberName) => (
                <Tag key={memberName} className="ug-card__member-tag">
                  <Avatar size="small" style={{ marginRight: 6 }}>
                    {memberName.slice(0, 1).toUpperCase()}
                  </Avatar>
                  {memberName}
                </Tag>
              ))}
              {group.userNames.length === 0 && <span style={{ color: '#98A2B3' }}>Chưa có thành viên.</span>}
            </div>

            <div style={{ display: 'flex', borderTop: '1px solid #f0f0f0' }}>
              <Button type="link" icon={<EditOutlined />} onClick={() => openEdit(group)}>
                Sửa
              </Button>
              <Popconfirm title="Xóa nhóm này?" onConfirm={() => void handleDelete(group.id)} okText="Xóa">
                <Button type="link" danger icon={<DeleteOutlined />}>
                  Xóa
                </Button>
              </Popconfirm>
            </div>
          </Card>
        ))}
      </div>

      <Modal
        title={modal.mode === 'create' ? 'Tạo nhóm người dùng' : 'Cập nhật nhóm người dùng'}
        open={modal.open}
        onCancel={() => {
          setModal({ open: false, mode: 'create' });
          form.resetFields();
        }}
        onOk={() => void handleSave()}
        okText={modal.mode === 'create' ? 'Tạo mới' : 'Lưu thay đổi'}
        width={640}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="name" label="Tên nhóm" rules={[{ required: true, message: 'Nhập tên nhóm.' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Mô tả" rules={[{ required: true, message: 'Nhập mô tả nhóm.' }]}>
            <Input.TextArea rows={4} />
          </Form.Item>
          <Form.Item name="userIds" label="Thành viên">
            <Select
              mode="multiple"
              optionFilterProp="label"
              placeholder="Chọn tài khoản thuộc nhóm"
              options={users.map((user) => ({
                label: `${user.fullName} (@${user.username})`,
                value: user.id,
              }))}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}