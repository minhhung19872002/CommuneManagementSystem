import React, { useEffect, useState, useCallback } from 'react';
import { Table, Button, Input, Select, Modal, Form, Space, Tag, Avatar, Descriptions, message, Tooltip, Tabs } from 'antd';
import { PlusOutlined, SearchOutlined, ReloadOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { personService } from '../services/personService';
import { householdService } from '../services/householdService';
import { Person, Household } from '../types';

const statusColor: Record<string, string> = {
  Alive: 'success', Dead: 'error', Moved: 'warning', Deleted: 'default',
};
const statusLabel: Record<string, string> = {
  Alive: 'Đang sống', Dead: 'Đã mất', Moved: 'Đã chuyển', Deleted: 'Đã xóa',
};

export default function Persons() {
  const [data, setData] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [modal, setModal] = useState<{ open: boolean; mode: 'create' | 'edit'; editing?: Person }>({ open: false, mode: 'create' });
  const [detailModal, setDetailModal] = useState<{ open: boolean; person?: Person }>({ open: false });
  const [regModal, setRegModal] = useState<{ open: boolean; type: 'birth' | 'death' }>({ open: false, type: 'birth' });
  const [households, setHouseholds] = useState<Household[]>([]);
  const [form] = Form.useForm();
  const [regForm] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();

  const load = useCallback(async () => {
    setLoading(true);
    try { const res = await personService.getAll(search || undefined, statusFilter || undefined); setData(res.data); }
    finally { setLoading(false); }
  }, [search, statusFilter]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { householdService.getAll().then(r => setHouseholds(r.data)).catch(console.error); }, []);

  const openEdit = (p: Person) => {
    form.setFieldsValue({
      fullName: p.fullName, dateOfBirth: p.dateOfBirth.split('T')[0], gender: p.gender,
      nationalId: p.nationalId, nationalIdIssuedAt: p.nationalIdIssuedAt,
      nationalIdIssuedDate: p.nationalIdIssuedDate ? p.nationalIdIssuedDate.split('T')[0] : null,
      ethnicity: p.ethnicity, religion: p.religion, educationLevel: p.educationLevel,
      occupation: p.occupation, householdId: p.householdId, relationshipToHead: p.relationshipToHead,
    });
    setModal({ open: true, mode: 'edit', editing: p });
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      const payload = { ...values, householdId: values.householdId || null };
      if (modal.mode === 'create') {
        await personService.create(payload);
        messageApi.success('Thêm nhân khẩu thành công!');
      } else {
        await personService.update(modal.editing!.id, payload);
        messageApi.success('Cập nhật thành công!');
      }
      setModal({ open: false, mode: 'create' });
      form.resetFields();
      load();
    } catch { messageApi.error('Có lỗi xảy ra!'); }
  };

  const handleDelete = async (id: number) => {
    Modal.confirm({
      title: 'Xác nhận xóa', content: 'Bạn có chắc muốn xóa nhân khẩu này?',
      okText: 'Xóa', okButtonProps: { danger: true },
      onOk: async () => {
        try { await personService.delete(id); messageApi.success('Xóa thành công!'); load(); }
        catch { messageApi.error('Xóa thất bại!'); }
      }
    });
  };

  const handleRegister = async () => {
    try {
      const values = await regForm.validateFields();
      if (regModal.type === 'birth') {
        await personService.registerBirth(values);
        messageApi.success('Đăng ký khai sinh thành công!');
      } else {
        await personService.registerDeath(values);
        messageApi.success('Đăng ký khai tử thành công!');
      }
      setRegModal({ open: false, type: 'birth' });
      regForm.resetFields();
      load();
    } catch { messageApi.error('Có lỗi xảy ra!'); }
  };

  const columns: ColumnsType<Person> = [
    {
      title: 'Họ tên', dataIndex: 'fullName', key: 'fullName',
      render: (v) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Avatar style={{ background: '#034AA0', flexShrink: 0, fontWeight: 700 }}>{v.charAt(0)}</Avatar>
          <span style={{ fontWeight: 600 }}>{v}</span>
        </div>
      ),
    },
    {
      title: 'Ngày sinh', dataIndex: 'dateOfBirth', key: 'dateOfBirth',
      render: (v) => new Date(v).toLocaleDateString('vi-VN'),
      sorter: (a, b) => new Date(a.dateOfBirth).getTime() - new Date(b.dateOfBirth).getTime()
    },
    {
      title: 'GT', dataIndex: 'gender', key: 'gender', width: 60, align: 'center',
      render: (v) => <span style={{ fontSize: '16px' }}>{v === 'Nam' ? '♂️' : '♀️'}</span>,
    },
    { title: 'CCCD', dataIndex: 'nationalId', key: 'nationalId', render: (v) => v || '—', ellipsis: true },
    { title: 'Dân tộc', dataIndex: 'ethnicity', key: 'ethnicity', ellipsis: true },
    { title: 'Nghề nghiệp', dataIndex: 'occupation', key: 'occupation', render: (v) => v || '—', ellipsis: true },
    { title: 'Hộ khẩu', dataIndex: 'householdNumber', key: 'householdNumber', render: (v) => v || '—', ellipsis: true },
    {
      title: 'Trạng thái', dataIndex: 'status', key: 'status', width: 110,
      render: (s) => <Tag color={statusColor[s]}>{statusLabel[s] || s}</Tag>,
    },
    {
      title: 'Thao tác', key: 'actions', width: 130, align: 'center',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Xem chi tiết">
            <Button size="small" icon={<EyeOutlined />} onClick={() => setDetailModal({ open: true, person: record })} />
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
            <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#32373C', margin: 0, lineHeight: 1.2 }}>Quản lý Nhân khẩu</h1>
            <p style={{ fontSize: '13px', color: '#737373', margin: '4px 0 0' }}>{data.length} nhân khẩu</p>
          </div>
          <Space>
            <Button onClick={() => { regForm.resetFields(); setRegModal({ open: true, type: 'birth' }); }}>
              🍼 Khai sinh
            </Button>
            <Button danger onClick={() => { regForm.resetFields(); setRegModal({ open: true, type: 'death' }); }}>
              ⚰️ Khai tử
            </Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => { form.resetFields(); setModal({ open: true, mode: 'create' }); }}>
              Thêm nhân khẩu
            </Button>
          </Space>
        </div>

        {/* Toolbar */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
          <Input
            prefix={<SearchOutlined style={{ color: '#737373' }} />}
            placeholder="Tìm tên, CCCD..."
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
            options={[
              { label: 'Đang sống', value: 'Alive' },
              { label: 'Đã mất', value: 'Dead' },
              { label: 'Đã chuyển', value: 'Moved' },
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
            pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (t) => `${t} nhân khẩu` }}
          />
        </div>
      </div>

      {/* Create / Edit Modal */}
      <Modal
        title={modal.mode === 'create' ? 'Thêm nhân khẩu mới' : 'Sửa nhân khẩu'}
        open={modal.open}
        onCancel={() => { setModal({ open: false, mode: 'create' }); form.resetFields(); }}
        onOk={handleSave}
        okText={modal.mode === 'create' ? 'Thêm mới' : 'Lưu'}
        width={620}
      >
        <Form form={form} layout="vertical" style={{ marginTop: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
            <Form.Item name="fullName" label="Họ tên" rules={[{ required: true, message: 'Vui lòng nhập họ tên!' }]}>
              <Input placeholder="Nguyễn Văn A" />
            </Form.Item>
            <Form.Item name="dateOfBirth" label="Ngày sinh" rules={[{ required: true, message: 'Vui lòng nhập ngày sinh!' }]}>
              <Input type="date" style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="gender" label="Giới tính" rules={[{ required: true }]} initialValue="Nam">
              <Select options={[{ label: 'Nam', value: 'Nam' }, { label: 'Nữ', value: 'Nữ' }]} />
            </Form.Item>
            <Form.Item name="nationalId" label="Số CCCD">
              <Input placeholder="012345678901" />
            </Form.Item>
            <Form.Item name="nationalIdIssuedAt" label="Nơi cấp CCCD">
              <Input placeholder="Công an tỉnh..." />
            </Form.Item>
            <Form.Item name="nationalIdIssuedDate" label="Ngày cấp CCCD">
              <Input type="date" style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="ethnicity" label="Dân tộc" initialValue="Kinh">
              <Input placeholder="Kinh" />
            </Form.Item>
            <Form.Item name="religion" label="Tôn giáo" initialValue="Không">
              <Input placeholder="Không" />
            </Form.Item>
            <Form.Item name="educationLevel" label="Trình độ học vấn">
              <Input placeholder="VD: 12/12" />
            </Form.Item>
            <Form.Item name="occupation" label="Nghề nghiệp">
              <Input placeholder="Nông dân, Công nhân..." />
            </Form.Item>
            <Form.Item name="householdId" label="Hộ khẩu">
              <Select
                showSearch
                optionFilterProp="children"
                placeholder="— Chọn hộ khẩu —"
                allowClear
                options={households.map(h => ({ label: `${h.householdNumber} — ${h.address}`, value: h.id }))}
              />
            </Form.Item>
            <Form.Item name="relationshipToHead" label="Quan hệ chủ hộ">
              <Input placeholder="VD: Vợ, Con, Anh..." />
            </Form.Item>
          </div>
        </Form>
      </Modal>

      {/* Detail Modal */}
      <Modal
        title={`Chi tiết: ${detailModal.person?.fullName || ''}`}
        open={detailModal.open}
        onCancel={() => setDetailModal({ open: false })}
        footer={<Button onClick={() => setDetailModal({ open: false })}>Đóng</Button>}
        width={600}
      >
        {detailModal.person && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
              <Avatar size={56} style={{ background: '#034AA0', fontWeight: 800, fontSize: '22px' }}>
                {detailModal.person.fullName.charAt(0)}
              </Avatar>
              <div>
                <div style={{ fontWeight: 700, fontSize: '16px' }}>{detailModal.person.fullName}</div>
                <Tag color={statusColor[detailModal.person.status]} style={{ marginTop: '4px' }}>
                  {statusLabel[detailModal.person.status]}
                </Tag>
              </div>
            </div>
            <Descriptions
              column={2}
              size="small"
              bordered
              items={[
                { key: 'ns', label: 'Ngày sinh', children: new Date(detailModal.person.dateOfBirth).toLocaleDateString('vi-VN') },
                { key: 'gt', label: 'Giới tính', children: detailModal.person.gender },
                { key: 'cccd', label: 'CCCD', children: detailModal.person.nationalId || '—' },
                { key: 'nc', label: 'Nơi cấp', children: detailModal.person.nationalIdIssuedAt || '—' },
                { key: 'dt', label: 'Dân tộc', children: detailModal.person.ethnicity },
                { key: 'tg', label: 'Tôn giáo', children: detailModal.person.religion },
                { key: 'hv', label: 'Học vấn', children: detailModal.person.educationLevel || '—' },
                { key: 'nn', label: 'Nghề nghiệp', children: detailModal.person.occupation || '—' },
                { key: 'hk', label: 'Hộ khẩu', children: detailModal.person.householdNumber || 'Chưa có' },
                { key: 'qh', label: 'Quan hệ', children: detailModal.person.relationshipToHead || '—' },
              ]}
            />
          </div>
        )}
      </Modal>

      {/* Birth / Death Registration Modal */}
      <Modal
        title={regModal.type === 'birth' ? 'Đăng ký khai sinh' : 'Đăng ký khai tử'}
        open={regModal.open}
        onCancel={() => { setRegModal({ open: false, type: 'birth' }); regForm.resetFields(); }}
        onOk={handleRegister}
        okText="Đăng ký"
        width={520}
      >
        <Tabs
          activeKey={regModal.type}
          onChange={k => setRegModal({ open: true, type: k as 'birth' | 'death' })}
          style={{ marginBottom: '12px' }}
          items={[
            {
              key: 'birth', label: 'Khai sinh',
              children: (
                <Form form={regForm} layout="vertical">
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
                    <Form.Item name="fullName" label="Họ tên trẻ" rules={[{ required: true, message: 'Vui lòng nhập họ tên!' }]}>
                      <Input placeholder="Tên trẻ" />
                    </Form.Item>
                    <Form.Item name="dateOfBirth" label="Ngày sinh" rules={[{ required: true }]}>
                      <Input type="date" style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item name="gender" label="Giới tính" rules={[{ required: true }]} initialValue="Nam">
                      <Select options={[{ label: 'Nam', value: 'Nam' }, { label: 'Nữ', value: 'Nữ' }]} />
                    </Form.Item>
                    <Form.Item name="birthPlace" label="Nơi sinh">
                      <Input placeholder="Bệnh viện, Xã..." />
                    </Form.Item>
                    <Form.Item name="motherId" label="ID CCCD mẹ">
                      <Input type="number" placeholder="ID người mẹ" />
                    </Form.Item>
                    <Form.Item name="fatherId" label="ID CCCD cha">
                      <Input type="number" placeholder="ID người cha" />
                    </Form.Item>
                  </div>
                </Form>
              ),
            },
            {
              key: 'death', label: 'Khai tử',
              children: (
                <Form form={regForm} layout="vertical">
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
                    <Form.Item name="personId" label="ID nhân khẩu" rules={[{ required: true, message: 'Vui lòng nhập ID!' }]}>
                      <Input type="number" placeholder="ID người mất" />
                    </Form.Item>
                    <Form.Item name="dateOfDeath" label="Ngày mất" rules={[{ required: true }]}>
                      <Input type="date" style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item name="placeOfDeath" label="Nơi mất" rules={[{ required: true }]}>
                      <Input placeholder="Bệnh viện, Xã..." />
                    </Form.Item>
                    <Form.Item name="reason" label="Nguyên nhân">
                      <Input placeholder="Bệnh tật, Tai nạn..." />
                    </Form.Item>
                  </div>
                </Form>
              ),
            },
          ]}
        />
      </Modal>
    </>
  );
}
