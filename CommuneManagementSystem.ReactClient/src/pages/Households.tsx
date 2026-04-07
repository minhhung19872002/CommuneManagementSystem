import React, { useEffect, useState, useCallback } from 'react';
import { Table, Button, Input, Select, Modal, Form, Space, Tag, message, Descriptions, Avatar, Tooltip } from 'antd';
import { PlusOutlined, SearchOutlined, ReloadOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { householdService } from '../services/householdService';
import { personService } from '../services/personService';
import { Household, Person } from '../types';

const statusColor: Record<string, string> = {
  Active: 'success', Moved: 'warning', Deleted: 'default',
};
const statusLabel: Record<string, string> = {
  Active: 'Hoạt động', Moved: 'Đã chuyển', Deleted: 'Đã xóa',
};

export default function Households() {
  const [data, setData] = useState<Household[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [modal, setModal] = useState<{ open: boolean; mode: 'create' | 'edit'; editing?: Household }>({ open: false, mode: 'create' });
  const [detailModal, setDetailModal] = useState<{ open: boolean; household?: Household; members: Person[] }>({ open: false, members: [] });
  const [persons, setPersons] = useState<Person[]>([]);
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await householdService.getAll(search || undefined, statusFilter || undefined);
      setData(res.data);
    } finally { setLoading(false); }
  }, [search, statusFilter]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { personService.getAll().then(r => setPersons(r.data)).catch(console.error); }, []);

  const handleDelete = async (id: number) => {
    Modal.confirm({
      title: 'Xác nhận xóa',
      content: 'Bạn có chắc muốn xóa hộ khẩu này?',
      okText: 'Xóa', okButtonProps: { danger: true },
      onOk: async () => {
        try { await householdService.delete(id); messageApi.success('Xóa thành công!'); load(); }
        catch { messageApi.error('Xóa thất bại!'); }
      }
    });
  };

  const openEdit = (h: Household) => {
    form.setFieldsValue({ householdNumber: h.householdNumber, address: h.address, headPersonId: h.headPersonId });
    setModal({ open: true, mode: 'edit', editing: h });
  };

  const openDetail = async (h: Household) => {
    try { const r = await householdService.getMembers(h.id); setDetailModal({ open: true, household: h, members: r.data }); }
    catch { setDetailModal({ open: true, household: h, members: [] }); }
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      if (modal.mode === 'create') {
        await householdService.create(values);
        messageApi.success('Thêm hộ khẩu thành công!');
      } else {
        await householdService.update(modal.editing!.id, { address: values.address, headPersonId: values.headPersonId });
        messageApi.success('Cập nhật thành công!');
      }
      setModal({ open: false, mode: 'create' });
      form.resetFields();
      load();
    } catch { messageApi.error('Có lỗi xảy ra!'); }
  };

  const columns: ColumnsType<Household> = [
    {
      title: 'Số hộ', dataIndex: 'householdNumber', key: 'householdNumber',
      render: (v) => <span style={{ fontWeight: 700, color: '#034AA0' }}>{v}</span>
    },
    { title: 'Địa chỉ', dataIndex: 'address', key: 'address', ellipsis: true },
    { title: 'Chủ hộ', dataIndex: 'headPersonName', key: 'headPersonName', render: (v) => v || '—', ellipsis: true },
    {
      title: 'Thành viên', dataIndex: 'memberCount', key: 'memberCount', width: 100, align: 'center',
      render: (v) => <Tag color="blue">{v} người</Tag>
    },
    {
      title: 'Trạng thái', dataIndex: 'status', key: 'status', width: 120,
      render: (s) => <Tag color={statusColor[s]}>{statusLabel[s] || s}</Tag>,
    },
    {
      title: 'Thao tác', key: 'actions', width: 130, align: 'center',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Xem chi tiết">
            <Button size="small" icon={<EyeOutlined />} onClick={() => openDetail(record)} />
          </Tooltip>
          <Tooltip title="Sửa">
            <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(record)} />
          </Tooltip>
          <Tooltip title="Xóa">
            <Button size="small" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)} />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <>
      {contextHolder}

      {/* Page Header */}
      <div style={{ padding: '24px 24px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#32373C', margin: 0, lineHeight: 1.2 }}>Quản lý Hộ khẩu</h1>
            <p style={{ fontSize: '13px', color: '#737373', margin: '4px 0 0' }}>{data.length} hộ khẩu</p>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => { form.resetFields(); setModal({ open: true, mode: 'create' }); }}
          >
            Thêm hộ khẩu
          </Button>
        </div>

        {/* Toolbar */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
          <Input
            prefix={<SearchOutlined style={{ color: '#737373' }} />}
            placeholder="Tìm số hộ, địa chỉ..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: '280px' }}
            allowClear
            onPressEnter={load}
          />
          <Select
            placeholder="Trạng thái"
            value={statusFilter || undefined}
            onChange={v => setStatusFilter(v || '')}
            allowClear
            style={{ width: '160px' }}
            options={[{ label: 'Hoạt động', value: 'Active' }, { label: 'Đã chuyển', value: 'Moved' }]}
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
            pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (t) => `${t} hộ khẩu` }}
          />
        </div>
      </div>

      {/* Create / Edit Modal */}
      <Modal
        title={modal.mode === 'create' ? 'Thêm hộ khẩu mới' : 'Sửa hộ khẩu'}
        open={modal.open}
        onCancel={() => { setModal({ open: false, mode: 'create' }); form.resetFields(); }}
        onOk={handleSave}
        okText={modal.mode === 'create' ? 'Thêm mới' : 'Lưu'}
        width={500}
      >
        <Form form={form} layout="vertical" style={{ marginTop: '16px' }}>
          <Form.Item
            name="householdNumber"
            label="Số hộ khẩu"
            rules={[{ required: true, message: 'Vui lòng nhập số hộ khẩu!' }]}
            extra={modal.mode === 'edit' && 'Số hộ khẩu không thể thay đổi.'}
          >
            <Input placeholder="VD: HK-004" disabled={modal.mode === 'edit'} />
          </Form.Item>
          <Form.Item
            name="address"
            label="Địa chỉ thường trú"
            rules={[{ required: true, message: 'Vui lòng nhập địa chỉ!' }]}
          >
            <Input placeholder="Thôn, Xã, Huyện..." />
          </Form.Item>
          <Form.Item
            name="headPersonId"
            label="Chủ hộ"
            rules={[{ required: true, message: 'Vui lòng chọn chủ hộ!' }]}
          >
            <Select
              showSearch
              optionFilterProp="children"
              placeholder="— Chọn nhân khẩu —"
              options={persons.map(p => ({ label: `${p.fullName} (${p.nationalId || 'chưa có'})`, value: p.id }))}
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* Detail Modal */}
      <Modal
        title={`Chi tiết: ${detailModal.household?.householdNumber || ''}`}
        open={detailModal.open}
        onCancel={() => setDetailModal({ open: false, members: [] })}
        footer={<Button onClick={() => setDetailModal({ open: false, members: [] })}>Đóng</Button>}
        width={680}
      >
        {detailModal.household && (
          <div>
            <Descriptions
              column={2}
              size="small"
              style={{ marginBottom: '20px' }}
              items={[
                { key: 'soho', label: 'Số hộ', children: <span style={{ fontWeight: 700, color: '#034AA0' }}>{detailModal.household.householdNumber}</span> },
                { key: 'tt', label: 'Trạng thái', children: <Tag color={statusColor[detailModal.household.status]}>{statusLabel[detailModal.household.status]}</Tag> },
                { key: 'dc', label: 'Địa chỉ', children: detailModal.household.address },
                { key: 'ch', label: 'Chủ hộ', children: detailModal.household.headPersonName || '—' },
                ...(detailModal.household.movedTo ? [{ key: 'ct', label: 'Chuyển đến', children: detailModal.household.movedTo }] : []),
              ]}
            />

            <div style={{ fontWeight: 700, fontSize: '13px', color: '#034AA0', marginBottom: '10px' }}>
              Thành viên ({detailModal.members.length})
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {detailModal.members.map(m => (
                <div key={m.id} style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '10px 12px', background: '#FAFAFA', borderRadius: '8px',
                  border: '1px solid #E5E5E5',
                }}>
                  <Avatar style={{ background: '#034AA0', flexShrink: 0, fontWeight: 700 }}>{m.fullName.charAt(0)}</Avatar>
                  <div style={{ overflow: 'hidden' }}>
                    <div style={{ fontWeight: 600, fontSize: '13px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.fullName}</div>
                    <div style={{ fontSize: '11px', color: '#737373' }}>{m.relationshipToHead} · {m.gender}</div>
                  </div>
                </div>
              ))}
              {detailModal.members.length === 0 && (
                <div style={{ gridColumn: '1/-1', textAlign: 'center', color: '#737373', padding: '20px' }}>
                  Chưa có thành viên
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
