import React, { useEffect, useState } from 'react';
import {
  DeleteOutlined,
  DownloadOutlined,
  EditOutlined,
  InboxOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import './Library.css';
import {
  Button,
  Card,
  Descriptions,
  Form,
  Input,
  Modal,
  Popconfirm,
  Select,
  Space,
  Table,
  Tag,
  Typography,
  message,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { libraryService } from '../services/libraryService';
import { LibraryDocument } from '../types';

type LibraryFormValues = {
  title: string;
  description: string;
  category: string;
};

const categories = ['Mẫu biểu', 'Quy trình', 'Văn bản', 'Báo cáo', 'Khác'];

const formatFileSize = (size: number) => {
  if (size >= 1024 * 1024) {
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  }
  if (size >= 1024) {
    return `${Math.round(size / 1024)} KB`;
  }
  return `${size} B`;
};

export default function Library() {
  const [items, setItems] = useState<LibraryDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ search: '', category: '' });
  const [editor, setEditor] = useState<{ open: boolean; mode: 'create' | 'edit'; item?: LibraryDocument }>({
    open: false,
    mode: 'create',
  });
  const [detailModal, setDetailModal] = useState<{ open: boolean; item?: LibraryDocument }>({ open: false });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [form] = Form.useForm<LibraryFormValues>();
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    void load();
  }, [filters.search, filters.category]);

  const load = async () => {
    setLoading(true);
    try {
      const response = await libraryService.getAll({
        search: filters.search || undefined,
        category: filters.category || undefined,
      });
      setItems(response.data);
    } catch {
      messageApi.error('Không thể tải kho tài liệu.');
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    form.resetFields();
    setSelectedFile(null);
    setEditor({ open: true, mode: 'create' });
  };

  const openEdit = (item: LibraryDocument) => {
    form.setFieldsValue({
      title: item.title,
      description: item.description,
      category: item.category,
    });
    setSelectedFile(null);
    setEditor({ open: true, mode: 'edit', item });
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();

      if (editor.mode === 'create') {
        if (!selectedFile) {
          messageApi.warning('Chọn tệp tài liệu trước khi lưu.');
          return;
        }

        await libraryService.create({
          ...values,
          file: selectedFile,
        });
        messageApi.success('Đã tải tài liệu lên kho chung.');
      } else {
        await libraryService.update(editor.item!.id, values);
        messageApi.success('Đã cập nhật tài liệu.');
      }

      setEditor({ open: false, mode: 'create' });
      form.resetFields();
      setSelectedFile(null);
      void load();
    } catch (error: any) {
      if (error?.errorFields) {
        return;
      }
      messageApi.error(error?.response?.data?.message || 'Không thể lưu tài liệu.');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await libraryService.delete(id);
      messageApi.success('Đã xóa tài liệu.');
      void load();
    } catch (error: any) {
      messageApi.error(error?.response?.data?.message || 'Không thể xóa tài liệu.');
    }
  };

  const handleDownload = async (item: LibraryDocument) => {
    try {
      const response = await libraryService.download(item.id);
      const url = URL.createObjectURL(response.data);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = item.fileName;
      anchor.click();
      URL.revokeObjectURL(url);
    } catch {
      messageApi.error('Không thể tải xuống tài liệu.');
    }
  };

  const columns: ColumnsType<LibraryDocument> = [
    {
      title: 'Tài liệu',
      key: 'title',
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 700 }}>{record.title}</div>
          <Typography.Paragraph ellipsis={{ rows: 2 }} style={{ margin: '4px 0 0', color: '#667085', maxWidth: 420 }}>
            {record.description}
          </Typography.Paragraph>
        </div>
      ),
    },
    {
      title: 'Danh mục',
      dataIndex: 'category',
      key: 'category',
      width: 150,
      render: (value: string) => <Tag color="blue">{value}</Tag>,
    },
    {
      title: 'Tệp',
      key: 'fileName',
      width: 240,
      render: (_, record) => (
        <div>
          <div>{record.fileName}</div>
          <div style={{ color: '#667085', fontSize: 12 }}>{formatFileSize(record.fileSize)}</div>
        </div>
      ),
    },
    {
      title: 'Cập nhật',
      key: 'uploadedAt',
      width: 220,
      render: (_, record) => (
        <div>
          <div>{record.uploadedBy}</div>
          <div style={{ color: '#667085', fontSize: 12 }}>{new Date(record.uploadedAt).toLocaleString('vi-VN')}</div>
        </div>
      ),
    },
    {
      title: 'Tác vụ',
      key: 'actions',
      width: 220,
      render: (_, record) => (
        <Space wrap>
          <Button size="small" icon={<DownloadOutlined />} onClick={() => void handleDownload(record)}>
            Tải xuống
          </Button>
          <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(record)}>
            Sửa
          </Button>
          <Popconfirm title="Xóa tài liệu này?" onConfirm={() => void handleDelete(record.id)} okText="Xóa">
            <Button size="small" danger icon={<DeleteOutlined />}>
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="civic-page page-wrapper">
      {contextHolder}

      <div className="civic-page-hero">
        <div className="civic-page-hero__inner">
          <div className="civic-page-hero__left">
            <div className="civic-page-hero__eyebrow">Quản lý / Kho tài liệu</div>
            <h1 className="civic-page-hero__title">Kho tài liệu</h1>
            <p className="civic-page-hero__subtitle">
              Lưu trữ, quản lý và chia sẻ tài liệu nội bộ cho cán bộ nghiệp vụ.
            </p>
          </div>
          <div className="civic-page-hero__stats">
            <div className="civic-page-hero__stat">
              <div className="civic-page-hero__stat-value">{items.length}</div>
              <div className="civic-page-hero__stat-label">Tổng tài liệu</div>
            </div>
            <div className="civic-page-hero__stat">
              <div className="civic-page-hero__stat-value">{items.filter((item) => item.category === 'Mẫu biểu').length}</div>
              <div className="civic-page-hero__stat-label">Mẫu biểu</div>
            </div>
            <div className="civic-page-hero__stat">
              <div className="civic-page-hero__stat-value">{items.filter((item) => item.category === 'Văn bản').length}</div>
              <div className="civic-page-hero__stat-label">Văn bản</div>
            </div>
          </div>
        </div>
      </div>

      <Card className="civic-section" styles={{ body: { padding: 0 } }}>
        <div className="civic-toolbar" style={{ marginBottom: 0, borderRadius: 0, borderLeft: 'none', borderRight: 'none', borderTop: 'none' }}>
          <div className="civic-toolbar__filters">
            <Space wrap>
              <Input
                placeholder="Tìm tên tài liệu, mô tả, tên tệp"
                value={filters.search}
                onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))}
                allowClear
                style={{ width: 280 }}
              />
              <Select
                placeholder="Danh mục"
                value={filters.category || undefined}
                onChange={(value) => setFilters((current) => ({ ...current, category: value || '' }))}
                allowClear
                style={{ width: 180 }}
                options={categories.map((item) => ({ label: item, value: item }))}
              />
            </Space>
          </div>
          <div className="civic-toolbar__actions">
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
              Tải tài liệu
            </Button>
          </div>
        </div>

        <div className="civic-table-wrapper" style={{ padding: '0 16px 16px' }}>
          <Table
            rowKey="id"
            loading={loading}
            dataSource={items}
            columns={columns}
            pagination={{ pageSize: 8 }}
            scroll={{ x: 1080 }}
            onRow={(record) => ({ onDoubleClick: () => setDetailModal({ open: true, item: record }) })}
          />
        </div>
      </Card>

      <Modal
        title={editor.mode === 'create' ? 'Tải tài liệu mới' : 'Cập nhật thông tin tài liệu'}
        open={editor.open}
        onCancel={() => {
          setEditor({ open: false, mode: 'create' });
          setSelectedFile(null);
          form.resetFields();
        }}
        onOk={() => void handleSave()}
        okText={editor.mode === 'create' ? 'Tải lên' : 'Lưu thay đổi'}
        width={680}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="title" label="Tiêu đề" rules={[{ required: true, message: 'Nhập tiêu đề tài liệu.' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Mô tả" rules={[{ required: true, message: 'Nhập mô tả ngắn.' }]}>
            <Input.TextArea rows={4} />
          </Form.Item>
          <Form.Item name="category" label="Danh mục" rules={[{ required: true, message: 'Chọn danh mục.' }]}>
            <Select options={categories.map((item) => ({ label: item, value: item }))} />
          </Form.Item>

          {editor.mode === 'create' && (
            <div className="library-upload-zone">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, color: '#2563eb' }}>
                <InboxOutlined />
                <strong>Chọn tệp để đưa vào kho tài liệu</strong>
              </div>
              <input
                type="file"
                onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)}
                style={{ width: '100%' }}
              />
              <div style={{ color: '#667085', fontSize: 12, marginTop: 8 }}>
                {selectedFile ? `Đã chọn: ${selectedFile.name}` : 'Hỗ trợ tệp PDF, DOCX, XLSX, Hình ảnh...'}
              </div>
            </div>
          )}
        </Form>
      </Modal>

      <Modal
        title="Chi tiết tài liệu"
        open={detailModal.open}
        onCancel={() => setDetailModal({ open: false })}
        footer={null}
        width={600}
      >
        {detailModal.item && (
          <Descriptions column={1} style={{ marginTop: 12 }}>
            <Descriptions.Item label="Tiêu đề">{detailModal.item.title}</Descriptions.Item>
            <Descriptions.Item label="Mô tả">{detailModal.item.description}</Descriptions.Item>
            <Descriptions.Item label="Danh mục">
              <Tag color="blue">{detailModal.item.category}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Tệp">
              {detailModal.item.fileName} ({formatFileSize(detailModal.item.fileSize)})
            </Descriptions.Item>
            <Descriptions.Item label="Người tải lên">{detailModal.item.uploadedBy}</Descriptions.Item>
            <Descriptions.Item label="Ngày tải lên">
              {new Date(detailModal.item.uploadedAt).toLocaleString('vi-VN')}
            </Descriptions.Item>
            <Descriptions.Item label="Tải xuống">
              <a href={detailModal.item.downloadUrl} target="_blank" rel="noopener noreferrer">
                Mở tệp
              </a>
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
}
