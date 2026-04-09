import React, { useEffect, useState } from 'react';
import {
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  PlusOutlined,
  SendOutlined,
} from '@ant-design/icons';
import {
  Button,
  Card,
  Form,
  Input,
  Modal,
  Popconfirm,
  Select,
  Space,
  Switch,
  Table,
  Tag,
  Typography,
  message,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { notificationService } from '../services/notificationService';
import { NotificationItem } from '../types';
import { useAuth } from '../context/AuthContext';

const statusConfig: Record<string, { label: string; color: string }> = {
  Draft: { label: 'Bản nháp', color: 'default' },
  Published: { label: 'Đã đăng', color: 'success' },
  Rejected: { label: 'Từ chối', color: 'error' },
};

const audienceConfig: Record<string, string> = {
  Admin: 'Admin',
  NhanKhau: 'Nhân khẩu',
  HoKhau: 'Hộ khẩu',
};

type NotificationFormValues = {
  title: string;
  summary: string;
  content: string;
  audienceRole?: string;
};

type ReviewFormValues = {
  status: string;
  reviewNote?: string;
};

export default function Notifications() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'Admin';
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    mine: false,
  });
  const [editor, setEditor] = useState<{ open: boolean; mode: 'create' | 'edit'; item?: NotificationItem }>({
    open: false,
    mode: 'create',
  });
  const [reviewer, setReviewer] = useState<{ open: boolean; item?: NotificationItem }>({ open: false });
  const [form] = Form.useForm<NotificationFormValues>();
  const [reviewForm] = Form.useForm<ReviewFormValues>();
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    void load();
  }, [filters.search, filters.status, filters.mine]);

  const load = async () => {
    setLoading(true);
    try {
      const response = await notificationService.getAll({
        search: filters.search || undefined,
        status: filters.status || undefined,
        mine: filters.mine || undefined,
      });
      setItems(response.data);
    } catch {
      messageApi.error('Không thể tải danh sách thông báo.');
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    form.resetFields();
    form.setFieldsValue({ audienceRole: undefined });
    setEditor({ open: true, mode: 'create' });
  };

  const openEdit = (item: NotificationItem) => {
    form.setFieldsValue({
      title: item.title,
      summary: item.summary,
      content: item.content,
      audienceRole: item.audienceRole ?? undefined,
    });
    setEditor({ open: true, mode: 'edit', item });
  };

  const openReview = (item: NotificationItem) => {
    reviewForm.setFieldsValue({
      status: item.status === 'Published' ? 'Published' : 'Rejected',
      reviewNote: item.reviewNote ?? undefined,
    });
    setReviewer({ open: true, item });
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();

      if (editor.mode === 'create') {
        await notificationService.create(values);
        messageApi.success('Đã tạo thông báo.');
      } else {
        await notificationService.update(editor.item!.id, values);
        messageApi.success('Đã cập nhật thông báo.');
      }

      setEditor({ open: false, mode: 'create' });
      form.resetFields();
      void load();
    } catch (error: any) {
      if (error?.errorFields) {
        return;
      }
      messageApi.error(error?.response?.data?.message || 'Không thể lưu thông báo.');
    }
  };

  const handleReview = async () => {
    try {
      const values = await reviewForm.validateFields();
      await notificationService.review(reviewer.item!.id, values);
      messageApi.success('Đã cập nhật trạng thái thông báo.');
      setReviewer({ open: false });
      reviewForm.resetFields();
      void load();
    } catch (error: any) {
      if (error?.errorFields) {
        return;
      }
      messageApi.error(error?.response?.data?.message || 'Không thể duyệt thông báo.');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await notificationService.delete(id);
      messageApi.success('Đã xóa thông báo.');
      void load();
    } catch (error: any) {
      messageApi.error(error?.response?.data?.message || 'Không thể xóa thông báo.');
    }
  };

  const columns: ColumnsType<NotificationItem> = [
    {
      title: 'Thông báo',
      key: 'title',
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 700, color: '#18212F' }}>{record.title}</div>
          <Typography.Paragraph
            ellipsis={{ rows: 2, expandable: false }}
            style={{ margin: '4px 0 0', color: '#667085', maxWidth: 420 }}
          >
            {record.summary}
          </Typography.Paragraph>
        </div>
      ),
    },
    {
      title: 'Đối tượng',
      dataIndex: 'audienceRole',
      key: 'audienceRole',
      width: 140,
      render: (value: string | null) => <Tag color="blue">{value ? audienceConfig[value] || value : 'Tất cả'}</Tag>,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (value: string) => {
        const config = statusConfig[value] ?? { label: value, color: 'default' };
        return <Tag color={config.color}>{config.label}</Tag>;
      },
    },
    {
      title: 'Người tạo',
      key: 'createdByName',
      width: 220,
      render: (_, record) => (
        <div>
          <div>{record.createdByName}</div>
          <div style={{ color: '#667085', fontSize: 12 }}>{new Date(record.createdAt).toLocaleString('vi-VN')}</div>
        </div>
      ),
    },
    {
      title: 'Ghi chú duyệt',
      key: 'reviewNote',
      width: 220,
      render: (_, record) => record.reviewNote || record.reviewedByName || '-',
    },
    {
      title: 'Tác vụ',
      key: 'actions',
      width: 220,
      render: (_, record) => {
        const canEdit = isAdmin || record.createdByName === user?.fullName;

        return (
          <Space wrap>
            <Button
              size="small"
              icon={<EyeOutlined />}
              onClick={() =>
                Modal.info({
                  title: record.title,
                  width: 640,
                  content: (
                    <div style={{ whiteSpace: 'pre-wrap', marginTop: 12 }}>
                      <p style={{ marginBottom: 12, color: '#667085' }}>{record.summary}</p>
                      <div>{record.content}</div>
                    </div>
                  ),
                })
              }
            >
              Xem
            </Button>
            {canEdit && (
              <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(record)}>
                Sửa
              </Button>
            )}
            {isAdmin && (
              <Button size="small" type="primary" ghost icon={<SendOutlined />} onClick={() => openReview(record)}>
                Duyệt
              </Button>
            )}
            {canEdit && (
              <Popconfirm title="Xóa thông báo này?" onConfirm={() => void handleDelete(record.id)} okText="Xóa">
                <Button size="small" danger icon={<DeleteOutlined />}>
                  Xóa
                </Button>
              </Popconfirm>
            )}
          </Space>
        );
      },
    },
  ];

  const draftCount = items.filter((item) => item.status === 'Draft').length;
  const publishedCount = items.filter((item) => item.status === 'Published').length;

  return (
    <>
      {contextHolder}

      <div style={{ padding: '24px 24px 0' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 20 }}>
          {[
            { label: 'Tổng thông báo', value: items.length, color: '#034AA0' },
            { label: 'Bản nháp', value: draftCount, color: '#D97706' },
            { label: 'Đã đăng', value: publishedCount, color: '#059669' },
          ].map((card) => (
            <Card key={card.label} style={{ borderRadius: 18 }}>
              <div style={{ color: '#667085', fontSize: 13 }}>{card.label}</div>
              <div style={{ fontSize: 32, fontWeight: 800, color: card.color, marginTop: 4 }}>{card.value}</div>
            </Card>
          ))}
        </div>

        <Card style={{ borderRadius: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', marginBottom: 16 }}>
            <Space wrap>
              <Input
                placeholder="Tìm tiêu đề hoặc nội dung"
                value={filters.search}
                onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))}
                allowClear
                style={{ width: 260 }}
              />
              <Select
                placeholder="Trạng thái"
                value={filters.status || undefined}
                onChange={(value) => setFilters((current) => ({ ...current, status: value || '' }))}
                allowClear
                style={{ width: 180 }}
                options={[
                  { label: 'Bản nháp', value: 'Draft' },
                  { label: 'Đã đăng', value: 'Published' },
                  { label: 'Từ chối', value: 'Rejected' },
                ]}
              />
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Switch checked={filters.mine} onChange={(checked) => setFilters((current) => ({ ...current, mine: checked }))} />
                <span style={{ color: '#667085' }}>Chỉ hiển của tôi</span>
              </div>
            </Space>

            <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
              Tạo thông báo
            </Button>
          </div>

          <Table
            rowKey="id"
            loading={loading}
            columns={columns}
            dataSource={items}
            pagination={{ pageSize: 8 }}
            scroll={{ x: 1100 }}
          />
        </Card>
      </div>

      <Modal
        title={editor.mode === 'create' ? 'Tạo thông báo' : 'Cập nhật thông báo'}
        open={editor.open}
        onCancel={() => {
          setEditor({ open: false, mode: 'create' });
          form.resetFields();
        }}
        onOk={() => void handleSave()}
        okText={editor.mode === 'create' ? 'Tạo mới' : 'Lưu thay đổi'}
        width={720}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="title" label="Tiêu đề" rules={[{ required: true, message: 'Nhập tiêu đề thông báo.' }]}>
            <Input placeholder="Thông báo họp giao ban, điều chỉnh lịch..." />
          </Form.Item>
          <Form.Item name="summary" label="Tóm tắt" rules={[{ required: true, message: 'Nhập mô tả ngắn.' }]}>
            <Input.TextArea rows={2} maxLength={240} showCount />
          </Form.Item>
          <Form.Item name="content" label="Nội dung" rules={[{ required: true, message: 'Nhập nội dung thông báo.' }]}>
            <Input.TextArea rows={8} />
          </Form.Item>
          <Form.Item name="audienceRole" label="Nhóm nhận">
            <Select
              allowClear
              placeholder="Tất cả người dùng"
              options={[
                { label: 'Tất cả', value: '' },
                { label: 'Admin', value: 'Admin' },
                { label: 'Nhân khẩu', value: 'NhanKhau' },
                { label: 'Hộ khẩu', value: 'HoKhau' },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Duyệt thông báo"
        open={reviewer.open}
        onCancel={() => {
          setReviewer({ open: false });
          reviewForm.resetFields();
        }}
        onOk={() => void handleReview()}
        okText="Cập nhật"
      >
        <Form form={reviewForm} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="status" label="Trạng thái" rules={[{ required: true, message: 'Chọn trạng thái.' }]}>
            <Select
              options={[
                { label: 'Đăng thông báo', value: 'Published' },
                { label: 'Từ chối', value: 'Rejected' },
              ]}
            />
          </Form.Item>
          <Form.Item name="reviewNote" label="Ghi chú">
            <Input.TextArea rows={4} placeholder="Lý do phê duyệt hoặc từ chối" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
