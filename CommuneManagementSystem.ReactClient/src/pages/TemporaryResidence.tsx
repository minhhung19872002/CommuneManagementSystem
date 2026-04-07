import React, { useEffect, useState, useCallback } from 'react';
import { Table, Button, Input, Select, Modal, Form, Space, Tag, Avatar, message, Tooltip, Popconfirm } from 'antd';
import { PlusOutlined, ReloadOutlined, ClockCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { tempResidenceService } from '../services/reportService';
import { personService } from '../services/personService';
import { TempResidence, Person } from '../types';

const statusColor: Record<string, string> = {
  Active: 'processing', Expired: 'warning', Cancelled: 'default',
};
const statusLabel: Record<string, string> = {
  Active: 'Đang tạm trú', Expired: 'Hết hạn', Cancelled: 'Đã hủy',
};

export default function TemporaryResidence() {
  const [data, setData] = useState<TempResidence[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [modal, setModal] = useState<{ open: boolean }>({ open: false });
  const [extendModal, setExtendModal] = useState<{ open: boolean; id?: number }>({ open: false });
  const [persons, setPersons] = useState<Person[]>([]);
  const [form] = Form.useForm();
  const [extendForm] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();

  const load = useCallback(async () => {
    setLoading(true);
    try { const r = await tempResidenceService.getAll(statusFilter || undefined); setData(r.data); }
    finally { setLoading(false); }
  }, [statusFilter]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { personService.getAll(undefined, 'Alive').then(r => setPersons(r.data)).catch(console.error); }, []);

  const handleCreate = async () => {
    try {
      const values = await form.validateFields();
      await tempResidenceService.create(values);
      messageApi.success('Đăng ký tạm trú thành công!');
      setModal({ open: false });
      form.resetFields();
      load();
    } catch { messageApi.error('Có lỗi xảy ra!'); }
  };

  const handleExtend = async () => {
    try {
      const values = await extendForm.validateFields();
      await tempResidenceService.extend(extendModal.id!, values.newEndDate);
      messageApi.success('Gia hạn thành công!');
      setExtendModal({ open: false });
      extendForm.resetFields();
      load();
    } catch { messageApi.error('Có lỗi xảy ra!'); }
  };

  const handleCancel = async (id: number) => {
    try {
      await tempResidenceService.delete(id);
      messageApi.success('Hủy đăng ký tạm trú thành công!');
      load();
    } catch { messageApi.error('Hủy thất bại!'); }
  };

  const columns: ColumnsType<TempResidence> = [
    {
      title: 'Người tạm trú', key: 'person',
      render: (_, r) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Avatar style={{ background: '#0891B2', flexShrink: 0, fontWeight: 700 }}>
            {r.personName?.charAt(0) || '?'}
          </Avatar>
          <span style={{ fontWeight: 600 }}>{r.personName || '—'}</span>
        </div>
      ),
    },
    { title: 'Địa chỉ tạm trú', dataIndex: 'address', key: 'address', ellipsis: true },
    { title: 'Từ ngày', dataIndex: 'startDate', key: 'startDate', render: (v) => new Date(v).toLocaleDateString('vi-VN') },
    { title: 'Đến ngày', dataIndex: 'endDate', key: 'endDate', render: (v) => new Date(v).toLocaleDateString('vi-VN') },
    { title: 'Lý do', dataIndex: 'reason', key: 'reason', ellipsis: true, render: (v) => v || '—' },
    {
      title: 'Trạng thái', dataIndex: 'status', key: 'status',
      render: (s) => <Tag color={statusColor[s]}>{statusLabel[s] || s}</Tag>,
    },
    {
      title: 'Thao tác', key: 'actions', width: 160, align: 'center',
      render: (_, record) =>
        record.status === 'Active' ? (
          <Space size="small">
            <Tooltip title="Gia hạn">
              <Button size="small" icon={<ClockCircleOutlined />} onClick={() => setExtendModal({ open: true, id: record.id })} />
            </Tooltip>
            <Popconfirm title="Hủy đăng ký tạm trú?" onConfirm={() => handleCancel(record.id)}>
              <Tooltip title="Hủy">
                <Button size="small" danger icon={<CloseCircleOutlined />} />
              </Tooltip>
            </Popconfirm>
          </Space>
        ) : <span style={{ color: '#737373', fontSize: '12px' }}>—</span>,
    },
  ];

  return (
    <>
      {contextHolder}

      {/* Page Header */}
      <div style={{ padding: '24px 24px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#32373C', margin: 0, lineHeight: 1.2 }}>Quản lý Tạm trú</h1>
            <p style={{ fontSize: '13px', color: '#737373', margin: '4px 0 0' }}>{data.length} đăng ký tạm trú</p>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => { form.resetFields(); setModal({ open: true }); }}
          >
            Đăng ký tạm trú
          </Button>
        </div>

        {/* Toolbar */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
          <Select
            placeholder="Trạng thái"
            value={statusFilter || undefined}
            onChange={v => setStatusFilter(v || '')}
            allowClear
            style={{ width: '160px' }}
            options={[
              { label: 'Đang tạm trú', value: 'Active' },
              { label: 'Hết hạn', value: 'Expired' },
              { label: 'Đã hủy', value: 'Cancelled' },
            ]}
          />
          <Button icon={<ReloadOutlined />} onClick={load}>Làm mới</Button>
        </div>
      </div>

      {/* Table */}
      <div style={{ padding: '0 24px 24px' }}>
        <div style={{ background: '#fff', borderRadius: '8px', border: '1px solid #E5E5E5', overflow: 'hidden' }}>
          <Table
            columns={columns}
            dataSource={data}
            rowKey="id"
            loading={loading}
            scroll={{ x: 920 }}
            pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (t) => `${t} đăng ký` }}
          />
        </div>
      </div>

      {/* Create Modal */}
      <Modal
        title="Đăng ký tạm trú"
        open={modal.open}
        onCancel={() => { setModal({ open: false }); form.resetFields(); }}
        onOk={handleCreate}
        okText="Đăng ký"
        width={500}
      >
        <Form form={form} layout="vertical" style={{ marginTop: '16px' }}>
          <Form.Item
            name="personId"
            label="Người tạm trú"
            rules={[{ required: true, message: 'Vui lòng chọn người tạm trú!' }]}
          >
            <Select
              showSearch
              optionFilterProp="children"
              placeholder="— Chọn nhân khẩu —"
              options={persons.map(p => ({ label: `${p.fullName} (${p.nationalId || 'chưa có'})`, value: p.id }))}
            />
          </Form.Item>
          <Form.Item
            name="address"
            label="Địa chỉ tạm trú"
            rules={[{ required: true, message: 'Vui lòng nhập địa chỉ!' }]}
          >
            <Input placeholder="Thôn, Xã, Huyện..." />
          </Form.Item>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
            <Form.Item name="startDate" label="Từ ngày" rules={[{ required: true }]}>
              <Input type="date" style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="endDate" label="Đến ngày" rules={[{ required: true }]}>
              <Input type="date" style={{ width: '100%' }} />
            </Form.Item>
          </div>
          <Form.Item name="reason" label="Lý do">
            <Input placeholder="Công tác, Du lịch..." />
          </Form.Item>
        </Form>
      </Modal>

      {/* Extend Modal */}
      <Modal
        title="Gia hạn tạm trú"
        open={extendModal.open}
        onCancel={() => { setExtendModal({ open: false }); extendForm.resetFields(); }}
        onOk={handleExtend}
        okText="Gia hạn"
        width={400}
      >
        <Form form={extendForm} layout="vertical" style={{ marginTop: '16px' }}>
          <Form.Item name="newEndDate" label="Ngày kết thúc mới" rules={[{ required: true }]}>
            <Input type="date" style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
