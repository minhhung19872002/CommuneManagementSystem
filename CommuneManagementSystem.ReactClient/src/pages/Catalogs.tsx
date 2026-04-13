import React, { useEffect, useState } from 'react';
import { Button, Card, Descriptions, Form, Input, Modal, Popconfirm, Select, Space, Table, Tag, Tabs, message } from 'antd';
import './Catalogs.css';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { catalogService } from '../services/catalogService';
import { CatalogItem } from '../types';

type CatalogFormValues = {
  type: string;
  code: string;
  name: string;
  description?: string;
  isActive?: boolean;
};

export default function Catalogs() {
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{ open: boolean; mode: 'create' | 'edit'; item?: CatalogItem; type: string }>({
    open: false,
    mode: 'create',
    type: 'Field',
  });
  const [detailModal, setDetailModal] = useState<{ open: boolean; item?: CatalogItem }>({ open: false });
  const [activeTab, setActiveTab] = useState('Field');
  const [form] = Form.useForm<CatalogFormValues>();
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    void load();
  }, []);

  const load = async () => {
    setLoading(true);
    try {
      const response = await catalogService.getAll();
      setItems(response.data);
    } catch {
      messageApi.error('Không thể tải danh mục.');
    } finally {
      setLoading(false);
    }
  };

  const openCreate = (type: string) => {
    form.resetFields();
    form.setFieldsValue({ type, isActive: true });
    setModal({ open: true, mode: 'create', type });
  };

  const openEdit = (item: CatalogItem) => {
    form.setFieldsValue({
      type: item.type,
      code: item.code,
      name: item.name,
      description: item.description ?? undefined,
      isActive: item.isActive,
    });
    setModal({ open: true, mode: 'edit', item, type: item.type });
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      if (modal.mode === 'create') {
        await catalogService.create(values);
        messageApi.success('Đã tạo danh mục.');
      } else {
        await catalogService.update(modal.item!.id, {
          code: values.code,
          name: values.name,
          description: values.description,
          isActive: Boolean(values.isActive),
        });
        messageApi.success('Đã cập nhật danh mục.');
      }

      setModal({ open: false, mode: 'create', type: activeTab });
      form.resetFields();
      void load();
    } catch (error: any) {
      if (error?.errorFields) {
        return;
      }
      messageApi.error(error?.response?.data?.message || 'Không thể lưu danh mục.');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await catalogService.delete(id);
      messageApi.success('Đã xóa danh mục.');
      void load();
    } catch (error: any) {
      messageApi.error(error?.response?.data?.message || 'Không thể xóa danh mục.');
    }
  };

  const renderTable = (type: string) => {
    const data = items.filter((item) => item.type === type);
    const columns: ColumnsType<CatalogItem> = [
      { title: 'Mã', dataIndex: 'code', key: 'code', width: 130, render: (value: string) => <strong>{value}</strong> },
      { title: 'Tên', dataIndex: 'name', key: 'name' },
      { title: 'Mô tả', dataIndex: 'description', key: 'description' },
      {
        title: 'Trạng thái',
        dataIndex: 'isActive',
        key: 'isActive',
        width: 120,
        render: (value: boolean) => <Tag color={value ? 'success' : 'default'}>{value ? 'Sử dụng' : 'Ngừng'}</Tag>,
      },
      {
        title: 'Tác vụ',
        key: 'actions',
        width: 180,
        render: (_, record) => (
          <Space>
            <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(record)}>
              Sửa
            </Button>
            <Popconfirm title="Xóa danh mục này?" onConfirm={() => void handleDelete(record.id)} okText="Xóa">
              <Button size="small" danger icon={<DeleteOutlined />}>
                Xóa
              </Button>
            </Popconfirm>
          </Space>
        ),
      },
    ];

    return (
      <>
        <div className="civic-toolbar" style={{ borderRadius: 0, borderLeft: 'none', borderRight: 'none', borderTop: 'none', margin: 0 }}>
          <div className="civic-toolbar__filters" />
          <div className="civic-toolbar__actions">
            <Button type="primary" icon={<PlusOutlined />} onClick={() => openCreate(type)}>
              Thêm danh mục
            </Button>
          </div>
        </div>
        <div className="civic-table-wrapper" style={{ padding: '0 16px 16px' }}>
          <Table rowKey="id" loading={loading} dataSource={data} columns={columns} pagination={{ pageSize: 8 }} onRow={(record) => ({ onDoubleClick: () => setDetailModal({ open: true, item: record }) })} />
        </div>
      </>
    );
  };

  return (
    <div className="civic-page page-wrapper">
      {contextHolder}

      <div className="civic-page-hero">
        <div className="civic-page-hero__inner">
          <div className="civic-page-hero__left">
            <div className="civic-page-hero__eyebrow">Hệ thống / Danh mục</div>
            <h1 className="civic-page-hero__title">Danh mục hệ thống</h1>
            <p className="civic-page-hero__subtitle">
              Quản lý các danh mục lĩnh vực và đơn vị hành chính phục vụ nghiệp vụ.
            </p>
          </div>
        </div>
      </div>

      <Card className="civic-section" styles={{ body: { padding: '0 0 4px' } }}>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            { key: 'Field', label: 'Lĩnh vực', children: renderTable('Field') },
            { key: 'Unit', label: 'Đơn vị', children: renderTable('Unit') },
          ]}
        />
      </Card>

      <Modal
        title={modal.mode === 'create' ? 'Thêm danh mục' : 'Cập nhật danh mục'}
        open={modal.open}
        onCancel={() => {
          setModal({ open: false, mode: 'create', type: activeTab });
          form.resetFields();
        }}
        onOk={() => void handleSave()}
        okText={modal.mode === 'create' ? 'Thêm mới' : 'Lưu thay đổi'}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="type" label="Loại danh mục" rules={[{ required: true }]} initialValue={modal.type}>
            <Select
              disabled={modal.mode === 'edit'}
              options={[
                { label: 'Lĩnh vực', value: 'Field' },
                { label: 'Đơn vị', value: 'Unit' },
              ]}
            />
          </Form.Item>
          <Form.Item name="code" label="Mã" rules={[{ required: true, message: 'Nhập mã danh mục.' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="name" label="Tên" rules={[{ required: true, message: 'Nhập tên danh mục.' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Mô tả">
            <Input.TextArea rows={4} />
          </Form.Item>
          {modal.mode === 'edit' && (
            <Form.Item name="isActive" label="Trạng thái" rules={[{ required: true }]}>
              <Select
                options={[
                  { label: 'Đang sử dụng', value: true },
                  { label: 'Ngừng sử dụng', value: false },
                ]}
              />
            </Form.Item>
          )}
        </Form>
      </Modal>

      <Modal
        title="Chi tiết danh mục"
        open={detailModal.open}
        onCancel={() => setDetailModal({ open: false })}
        footer={null}
      >
        {detailModal.item && (
          <Descriptions column={1} style={{ marginTop: 12 }}>
            <Descriptions.Item label="Mã">{detailModal.item.code}</Descriptions.Item>
            <Descriptions.Item label="Tên">{detailModal.item.name}</Descriptions.Item>
            <Descriptions.Item label="Mô tả">{detailModal.item.description || '—'}</Descriptions.Item>
            <Descriptions.Item label="Loại">
              <Tag color="blue">{detailModal.item.type}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái">
              <Tag color={detailModal.item.isActive ? 'success' : 'default'}>
                {detailModal.item.isActive ? 'Sử dụng' : 'Ngừng'}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Ngày tạo">
              {new Date(detailModal.item.createdAt).toLocaleDateString('vi-VN')}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
}
