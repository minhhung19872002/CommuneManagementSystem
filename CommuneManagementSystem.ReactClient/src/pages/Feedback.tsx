import React, { useEffect, useState } from 'react';
import {
  EditOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import {
  Button,
  Card,
  Form,
  Input,
  Modal,
  Select,
  Space,
  Table,
  Tag,
  Typography,
  message,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { feedbackService } from '../services/feedbackService';
import { FeedbackItem } from '../types';

type CreateFeedbackFormValues = {
  fullName: string;
  contactInfo: string;
  title: string;
  content: string;
};

type UpdateFeedbackFormValues = {
  status: string;
  resolutionNote?: string;
};

const statusConfig: Record<string, { label: string; color: string }> = {
  Pending: { label: 'Chờ xử lý', color: 'warning' },
  Processing: { label: 'Đang xử lý', color: 'processing' },
  Resolved: { label: 'Đã xử lý', color: 'success' },
  Rejected: { label: 'Từ chối', color: 'error' },
};

export default function Feedback() {
  const [items, setItems] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ search: '', status: '' });
  const [creatorOpen, setCreatorOpen] = useState(false);
  const [editor, setEditor] = useState<{ open: boolean; item?: FeedbackItem }>({ open: false });
  const [createForm] = Form.useForm<CreateFeedbackFormValues>();
  const [updateForm] = Form.useForm<UpdateFeedbackFormValues>();
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    void load();
  }, [filters.search, filters.status]);

  const load = async () => {
    setLoading(true);
    try {
      const response = await feedbackService.getAll({
        search: filters.search || undefined,
        status: filters.status || undefined,
      });
      setItems(response.data);
    } catch {
      messageApi.error('Không thể tải danh sách phản ánh.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      const values = await createForm.validateFields();
      await feedbackService.create(values);
      messageApi.success('Đã ghi nhận phản ánh.');
      setCreatorOpen(false);
      createForm.resetFields();
      void load();
    } catch (error: any) {
      if (error?.errorFields) {
        return;
      }
      messageApi.error(error?.response?.data?.message || 'Không thể tạo phản ánh.');
    }
  };

  const openUpdate = (item: FeedbackItem) => {
    updateForm.setFieldsValue({
      status: item.status,
      resolutionNote: item.resolutionNote ?? undefined,
    });
    setEditor({ open: true, item });
  };

  const handleUpdate = async () => {
    try {
      const values = await updateForm.validateFields();
      await feedbackService.update(editor.item!.id, values);
      messageApi.success('Đã cập nhật kết quả xử lý.');
      setEditor({ open: false });
      updateForm.resetFields();
      void load();
    } catch (error: any) {
      if (error?.errorFields) {
        return;
      }
      messageApi.error(error?.response?.data?.message || 'Không thể cập nhật phản ánh.');
    }
  };

  const columns: ColumnsType<FeedbackItem> = [
    {
      title: 'Người gửi',
      key: 'fullName',
      width: 220,
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 700 }}>{record.fullName}</div>
          <div style={{ color: '#667085', fontSize: 12 }}>{record.contactInfo}</div>
        </div>
      ),
    },
    {
      title: 'Nội dung',
      key: 'title',
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 700 }}>{record.title}</div>
          <Typography.Paragraph ellipsis={{ rows: 2 }} style={{ margin: '4px 0 0', color: '#667085', maxWidth: 420 }}>
            {record.content}
          </Typography.Paragraph>
        </div>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 140,
      render: (value: string) => {
        const config = statusConfig[value] ?? { label: value, color: 'default' };
        return <Tag color={config.color}>{config.label}</Tag>;
      },
    },
    {
      title: 'Xử lý',
      key: 'processedByName',
      width: 220,
      render: (_, record) =>
        record.processedAt ? (
          <div>
            <div>{record.processedByName || 'Hệ thống'}</div>
            <div style={{ color: '#667085', fontSize: 12 }}>{new Date(record.processedAt).toLocaleString('vi-VN')}</div>
          </div>
        ) : (
          'Chưa xử lý'
        ),
    },
    {
      title: 'Tác vụ',
      key: 'actions',
      width: 160,
      render: (_, record) => (
        <Button size="small" icon={<EditOutlined />} onClick={() => openUpdate(record)}>
          Cập nhật
        </Button>
      ),
    },
  ];

  return (
    <>
      {contextHolder}

      <div style={{ padding: '24px 24px 0' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 20 }}>
          {[
            { label: 'Tổng phản ánh', value: items.length, color: '#034AA0' },
            { label: 'Chờ xử lý', value: items.filter((item) => item.status === 'Pending').length, color: '#D97706' },
            { label: 'Đã xử lý', value: items.filter((item) => item.status === 'Resolved').length, color: '#059669' },
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
                placeholder="Tìm người gửi, tiêu đề, nội dung"
                value={filters.search}
                onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))}
                allowClear
                style={{ width: 280 }}
              />
              <Select
                placeholder="Trạng thái"
                value={filters.status || undefined}
                onChange={(value) => setFilters((current) => ({ ...current, status: value || '' }))}
                allowClear
                style={{ width: 180 }}
                options={Object.entries(statusConfig).map(([value, config]) => ({
                  label: config.label,
                  value,
                }))}
              />
            </Space>

            <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreatorOpen(true)}>
              Tạo phản ánh
            </Button>
          </div>

          <Table
            rowKey="id"
            loading={loading}
            dataSource={items}
            columns={columns}
            pagination={{ pageSize: 8 }}
            scroll={{ x: 980 }}
          />
        </Card>
      </div>

      <Modal
        title="Tạo phản ánh, kiến nghị"
        open={creatorOpen}
        onCancel={() => {
          setCreatorOpen(false);
          createForm.resetFields();
        }}
        onOk={() => void handleCreate()}
        okText="Gửi phản ánh"
        width={720}
      >
        <Form form={createForm} layout="vertical" style={{ marginTop: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
            <Form.Item name="fullName" label="Họ tên" rules={[{ required: true, message: 'Nhập họ tên.' }]}>
              <Input />
            </Form.Item>
            <Form.Item name="contactInfo" label="Liên hệ" rules={[{ required: true, message: 'Nhập thông tin liên hệ.' }]}>
              <Input placeholder="Số điện thoại, email..." />
            </Form.Item>
          </div>
          <Form.Item name="title" label="Tiêu đề" rules={[{ required: true, message: 'Nhập tiêu đề phản ánh.' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="content" label="Nội dung" rules={[{ required: true, message: 'Nhập nội dung phản ánh.' }]}>
            <Input.TextArea rows={7} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={`Cập nhật kết quả xử lý: ${editor.item?.title || ''}`}
        open={editor.open}
        onCancel={() => {
          setEditor({ open: false });
          updateForm.resetFields();
        }}
        onOk={() => void handleUpdate()}
        okText="Lưu kết quả"
      >
        <Form form={updateForm} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="status" label="Trạng thái" rules={[{ required: true, message: 'Chọn trạng thái.' }]}>
            <Select
              options={[
                { label: 'Chờ xử lý', value: 'Pending' },
                { label: 'Đang xử lý', value: 'Processing' },
                { label: 'Đã xử lý', value: 'Resolved' },
                { label: 'Từ chối', value: 'Rejected' },
              ]}
            />
          </Form.Item>
          <Form.Item name="resolutionNote" label="Kết quả xử lý">
            <Input.TextArea rows={5} placeholder="Nội dung phản hồi, hướng xử lý, kết quả giải quyết" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
