import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ApartmentOutlined,
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  ExportOutlined,
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import {
  Avatar,
  Button,
  Card,
  Descriptions,
  Form,
  Input,
  Modal,
  Select,
  Space,
  Table,
  Tag,
  Tooltip,
  message,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { householdService } from '../services/householdService';
import { personService } from '../services/personService';
import { Household, Person } from '../types';

const statusColor: Record<string, string> = {
  Active: 'success',
  Moved: 'warning',
  Deleted: 'default',
};

const statusLabel: Record<string, string> = {
  Active: 'Hoạt động',
  Moved: 'Đã chuyển',
  Deleted: 'Đã xóa',
};

export default function Households() {
  const [data, setData] = useState<Household[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [modal, setModal] = useState<{ open: boolean; mode: 'create' | 'edit'; editing?: Household }>({
    open: false,
    mode: 'create',
  });
  const [detailModal, setDetailModal] = useState<{ open: boolean; household?: Household; members: Person[] }>({
    open: false,
    members: [],
  });
  const [splitModal, setSplitModal] = useState<{ open: boolean; household?: Household; members: Person[] }>({
    open: false,
    members: [],
  });
  const [moveModal, setMoveModal] = useState<{ open: boolean; household?: Household }>({ open: false });
  const [persons, setPersons] = useState<Person[]>([]);
  const [form] = Form.useForm();
  const [splitForm] = Form.useForm();
  const [moveForm] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await householdService.getAll(search || undefined, statusFilter || undefined);
      setData(response.data);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    personService.getAll().then((response) => setPersons(response.data)).catch(console.error);
  }, []);

  const activeCount = useMemo(() => data.filter((item) => item.status === 'Active').length, [data]);
  const splitMemberIds = Form.useWatch<number[]>('memberIds', splitForm) || [];

  const handleDelete = async (id: number) => {
    Modal.confirm({
      title: 'Xác nhận xóa',
      content: 'Bạn có chắc muốn xóa hộ khẩu này?',
      okText: 'Xóa',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await householdService.delete(id);
          messageApi.success('Xóa hộ khẩu thành công.');
          void load();
        } catch (error: any) {
          messageApi.error(error?.response?.data?.message || 'Không thể xóa hộ khẩu.');
        }
      },
    });
  };

  const openEdit = (household: Household) => {
    form.setFieldsValue({
      householdNumber: household.householdNumber,
      address: household.address,
      headPersonId: household.headPersonId,
    });
    setModal({ open: true, mode: 'edit', editing: household });
  };

  const openDetail = async (household: Household) => {
    try {
      const response = await householdService.getMembers(household.id);
      setDetailModal({ open: true, household, members: response.data });
    } catch {
      setDetailModal({ open: true, household, members: [] });
    }
  };

  const openSplit = async (household: Household) => {
    try {
      const response = await householdService.getMembers(household.id);
      const eligibleMembers = response.data.filter((member) => member.id !== household.headPersonId);

      splitForm.resetFields();
      splitForm.setFieldsValue({
        newHouseholdNumber: `${household.householdNumber}-T`,
        newAddress: household.address,
      });
      setSplitModal({ open: true, household, members: eligibleMembers });
    } catch {
      messageApi.error('Không thể tải danh sách thành viên để tách hộ.');
    }
  };

  const openMove = (household: Household) => {
    moveForm.resetFields();
    moveForm.setFieldsValue({ moveDate: new Date().toISOString().slice(0, 10) });
    setMoveModal({ open: true, household });
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();

      if (modal.mode === 'create') {
        await householdService.create(values);
        messageApi.success('Thêm hộ khẩu thành công.');
      } else {
        await householdService.update(modal.editing!.id, {
          address: values.address,
          headPersonId: values.headPersonId,
        });
        messageApi.success('Cập nhật hộ khẩu thành công.');
      }

      setModal({ open: false, mode: 'create' });
      form.resetFields();
      void load();
    } catch (error: any) {
      messageApi.error(error?.response?.data?.message || 'Không thể lưu thay đổi.');
    }
  };

  const handleSplit = async () => {
    try {
      const values = await splitForm.validateFields();
      await householdService.split({
        originalId: splitModal.household!.id,
        newHouseholdNumber: values.newHouseholdNumber,
        newAddress: values.newAddress,
        newHeadPersonId: values.newHeadPersonId,
        memberIds: values.memberIds,
      });

      messageApi.success('Tách hộ khẩu thành công.');
      setSplitModal({ open: false, members: [] });
      splitForm.resetFields();
      void load();
    } catch (error: any) {
      messageApi.error(error?.response?.data?.message || 'Không thể tách hộ khẩu.');
    }
  };

  const handleMove = async () => {
    try {
      const values = await moveForm.validateFields();
      await householdService.move({
        householdId: moveModal.household!.id,
        movedTo: values.movedTo,
        moveDate: values.moveDate,
      });

      messageApi.success('Chuyển hộ khẩu thành công.');
      setMoveModal({ open: false });
      moveForm.resetFields();
      void load();
    } catch (error: any) {
      messageApi.error(error?.response?.data?.message || 'Không thể chuyển hộ khẩu.');
    }
  };

  const columns: ColumnsType<Household> = [
    {
      title: 'Số hộ',
      dataIndex: 'householdNumber',
      key: 'householdNumber',
      render: (value: string) => <span className="table-primary-text">{value}</span>,
    },
    {
      title: 'Địa chỉ',
      dataIndex: 'address',
      key: 'address',
      ellipsis: true,
    },
    {
      title: 'Chủ hộ',
      dataIndex: 'headPersonName',
      key: 'headPersonName',
      render: (value: string) => value || '—',
      ellipsis: true,
    },
    {
      title: 'Thành viên',
      dataIndex: 'memberCount',
      key: 'memberCount',
      width: 120,
      align: 'center',
      render: (value: number) => <Tag color="blue">{value} người</Tag>,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (value: string) => <Tag color={statusColor[value]}>{statusLabel[value] || value}</Tag>,
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 220,
      align: 'center',
      render: (_, record) => (
        <Space size="small" wrap>
          <Tooltip title="Xem chi tiết">
            <Button size="small" icon={<EyeOutlined />} onClick={() => void openDetail(record)} />
          </Tooltip>
          <Tooltip title="Sửa">
            <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(record)} />
          </Tooltip>
          <Tooltip title="Tách hộ">
            <Button
              size="small"
              icon={<ApartmentOutlined />}
              onClick={() => void openSplit(record)}
              disabled={record.status !== 'Active' || record.memberCount < 2}
            />
          </Tooltip>
          <Tooltip title="Chuyển đi">
            <Button
              size="small"
              icon={<ExportOutlined />}
              onClick={() => openMove(record)}
              disabled={record.status !== 'Active'}
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <Button size="small" danger icon={<DeleteOutlined />} onClick={() => void handleDelete(record.id)} />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="management-page" data-testid="households-page">
      {contextHolder}

      <section className="management-page__hero">
        <div className="management-page__copy">
          <p className="management-page__eyebrow">Dân cư / Hộ khẩu</p>
          <h1 className="management-page__title">Hồ sơ hộ gia đình</h1>
          <p className="management-page__subtitle">
            Quản lý số hộ, địa chỉ cư trú, luồng tách hộ và chuyển hộ trong phạm vi xã.
          </p>
        </div>

        <div className="management-page__meta">
          <div className="management-page__stat">
            <span className="management-page__stat-value">{data.length}</span>
            <span className="management-page__stat-label">Hộ khẩu hiện có</span>
          </div>
          <div className="management-page__stat">
            <span className="management-page__stat-value">{activeCount}</span>
            <span className="management-page__stat-label">Đang hoạt động</span>
          </div>
          <div className="management-page__actions">
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                form.resetFields();
                setModal({ open: true, mode: 'create' });
              }}
            >
              Thêm hộ khẩu
            </Button>
          </div>
        </div>
      </section>

      <section className="management-toolbar">
        <Input
          data-testid="households-search-input"
          className="management-toolbar__grow"
          prefix={<SearchOutlined />}
          placeholder="Tìm theo số hộ hoặc địa chỉ"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          allowClear
          onPressEnter={() => void load()}
        />

        <Select
          placeholder="Trạng thái"
          value={statusFilter || undefined}
          onChange={(value) => setStatusFilter(value || '')}
          allowClear
          style={{ width: 180 }}
          options={[
            { label: 'Hoạt động', value: 'Active' },
            { label: 'Đã chuyển', value: 'Moved' },
          ]}
        />

        <Button icon={<ReloadOutlined />} onClick={() => void load()}>
          Làm mới
        </Button>
      </section>

      <Card className="management-table-card">
        <Table
          columns={columns}
          dataSource={data}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `${total} hộ khẩu`,
          }}
        />
      </Card>

      <Modal
        title={modal.mode === 'create' ? 'Thêm hộ khẩu mới' : 'Chỉnh sửa hộ khẩu'}
        open={modal.open}
        onCancel={() => {
          setModal({ open: false, mode: 'create' });
          form.resetFields();
        }}
        onOk={() => void handleSave()}
        okText={modal.mode === 'create' ? 'Tạo mới' : 'Lưu thay đổi'}
        width={520}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="householdNumber"
            label="Số hộ khẩu"
            rules={[{ required: true, message: 'Vui lòng nhập số hộ khẩu.' }]}
            extra={modal.mode === 'edit' ? 'Số hộ khẩu không thể thay đổi sau khi tạo.' : undefined}
          >
            <Input placeholder="Ví dụ: HK-004" disabled={modal.mode === 'edit'} />
          </Form.Item>

          <Form.Item
            name="address"
            label="Địa chỉ thường trú"
            rules={[{ required: true, message: 'Vui lòng nhập địa chỉ thường trú.' }]}
          >
            <Input placeholder="Thôn, xã, huyện..." />
          </Form.Item>

          <Form.Item
            name="headPersonId"
            label="Chủ hộ"
            rules={[{ required: true, message: 'Vui lòng chọn chủ hộ.' }]}
          >
            <Select
              showSearch
              optionFilterProp="label"
              placeholder="Chọn nhân khẩu"
              options={persons.map((person) => ({
                label: `${person.fullName} (${person.nationalId || 'chưa có CCCD'})`,
                value: person.id,
              }))}
            />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={`Chi tiết hộ khẩu ${detailModal.household?.householdNumber || ''}`}
        open={detailModal.open}
        onCancel={() => setDetailModal({ open: false, members: [] })}
        footer={<Button onClick={() => setDetailModal({ open: false, members: [] })}>Đóng</Button>}
        width={720}
      >
        {detailModal.household && (
          <div className="management-section">
            <Descriptions
              column={2}
              size="small"
              items={[
                {
                  key: 'householdNumber',
                  label: 'Số hộ',
                  children: <span className="table-primary-text">{detailModal.household.householdNumber}</span>,
                },
                {
                  key: 'status',
                  label: 'Trạng thái',
                  children: (
                    <Tag color={statusColor[detailModal.household.status]}>
                      {statusLabel[detailModal.household.status]}
                    </Tag>
                  ),
                },
                { key: 'address', label: 'Địa chỉ', children: detailModal.household.address },
                { key: 'head', label: 'Chủ hộ', children: detailModal.household.headPersonName || '—' },
                ...(detailModal.household.movedTo
                  ? [{ key: 'movedTo', label: 'Chuyển đến', children: detailModal.household.movedTo }]
                  : []),
              ]}
            />

            <div>
              <p className="management-page__eyebrow" style={{ marginBottom: '0.75rem' }}>
                Thành viên trong hộ
              </p>

              {detailModal.members.length > 0 ? (
                <div className="management-members-grid">
                  {detailModal.members.map((member) => (
                    <div key={member.id} className="management-member-card">
                      <Avatar style={{ background: '#155DFC', fontWeight: 800 }}>{member.fullName.charAt(0)}</Avatar>
                      <div className="management-member-card__copy">
                        <p className="management-member-card__name">{member.fullName}</p>
                        <p className="management-member-card__meta">
                          {member.relationshipToHead || 'Thành viên'} · {member.gender}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="management-empty-state">Chưa có thành viên nào trong hộ này.</div>
              )}
            </div>
          </div>
        )}
      </Modal>

      <Modal
        title={`Tách hộ khẩu ${splitModal.household?.householdNumber || ''}`}
        open={splitModal.open}
        onCancel={() => {
          setSplitModal({ open: false, members: [] });
          splitForm.resetFields();
        }}
        onOk={() => void handleSplit()}
        okText="Tách hộ"
        width={620}
      >
        <Form form={splitForm} layout="vertical">
          <div className="form-grid-two">
            <Form.Item
              name="newHouseholdNumber"
              label="Số hộ khẩu mới"
              rules={[{ required: true, message: 'Vui lòng nhập số hộ khẩu mới.' }]}
            >
              <Input placeholder="Ví dụ: HK-001-T1" />
            </Form.Item>
            <Form.Item
              name="newAddress"
              label="Địa chỉ hộ mới"
              rules={[{ required: true, message: 'Vui lòng nhập địa chỉ hộ mới.' }]}
            >
              <Input placeholder="Địa chỉ thường trú của hộ mới" />
            </Form.Item>
          </div>

          <Form.Item
            name="memberIds"
            label="Thành viên chuyển sang hộ mới"
            rules={[{ required: true, message: 'Vui lòng chọn ít nhất một thành viên.' }]}
          >
            <Select
              mode="multiple"
              optionFilterProp="label"
              placeholder="Chọn thành viên tách hộ"
              options={splitModal.members.map((member) => ({
                label: `${member.fullName} (${member.relationshipToHead || 'Thành viên'})`,
                value: member.id,
              }))}
            />
          </Form.Item>

          <Form.Item
            name="newHeadPersonId"
            label="Chủ hộ mới"
            rules={[{ required: true, message: 'Vui lòng chọn chủ hộ mới.' }]}
          >
            <Select
              placeholder="Chọn thành viên làm chủ hộ mới"
              options={splitModal.members
                .filter((member) => splitMemberIds.includes(member.id))
                .map((member) => ({
                  label: member.fullName,
                  value: member.id,
                }))}
            />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={`Chuyển hộ khẩu ${moveModal.household?.householdNumber || ''}`}
        open={moveModal.open}
        onCancel={() => {
          setMoveModal({ open: false });
          moveForm.resetFields();
        }}
        onOk={() => void handleMove()}
        okText="Xác nhận chuyển"
        width={520}
      >
        <Form form={moveForm} layout="vertical">
          <Form.Item
            name="movedTo"
            label="Nơi chuyển đến"
            rules={[{ required: true, message: 'Vui lòng nhập nơi chuyển đến.' }]}
          >
            <Input placeholder="Xã/phường, quận/huyện, tỉnh/thành..." />
          </Form.Item>
          <Form.Item
            name="moveDate"
            label="Ngày chuyển"
            rules={[{ required: true, message: 'Vui lòng chọn ngày chuyển.' }]}
          >
            <Input type="date" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
