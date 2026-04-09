import React, { useEffect, useMemo, useState } from 'react';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Card, Form, Input, Modal, Popconfirm, Select, Space, Table, Tabs, Tag, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { hrService } from '../services/hrService';
import { authService } from '../services/authService';
import { AppUser, BaseSalaryRate, HrPayrollStats, PayrollEntry, SalaryTransfer, StaffProfile } from '../types';

type StaffFormValues = {
  userId?: number;
  fullName: string;
  position: string;
  department: string;
  salaryCoefficient: number;
  bankName: string;
  bankAccount: string;
  email: string;
  phoneNumber: string;
  status: string;
};

type BaseSalaryFormValues = {
  amount: number;
  effectiveDate: string;
  note: string;
  isActive: boolean;
};

type PayrollFormValues = {
  staffProfileId: number;
  month: string;
  allowance: number;
  bonus: number;
  deduction: number;
  status: string;
};

type TransferFormValues = {
  payrollEntryId: number;
  transferDate: string;
  status: string;
  referenceCode?: string;
  note?: string;
};

const staffStatusOptions = ['Active', 'Inactive'];
const payrollStatusOptions = ['Draft', 'Approved', 'Transferred'];
const transferStatusOptions = ['Pending', 'Completed', 'Failed'];
const formatCurrency = (value: number) =>
  `${value.toLocaleString('vi-VN', { maximumFractionDigits: 0 })} đ`;

export default function HumanResources() {
  const [staffs, setStaffs] = useState<StaffProfile[]>([]);
  const [baseSalaries, setBaseSalaries] = useState<BaseSalaryRate[]>([]);
  const [payrolls, setPayrolls] = useState<PayrollEntry[]>([]);
  const [transfers, setTransfers] = useState<SalaryTransfer[]>([]);
  const [stats, setStats] = useState<HrPayrollStats | null>(null);
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [staffFilter, setStaffFilter] = useState({ search: '', status: '' });
  const [payrollFilter, setPayrollFilter] = useState({ month: '', status: '' });
  const [transferFilter, setTransferFilter] = useState({ status: '' });
  const [staffModal, setStaffModal] = useState<{ open: boolean; item?: StaffProfile }>({ open: false });
  const [salaryModal, setSalaryModal] = useState<{ open: boolean; item?: BaseSalaryRate }>({ open: false });
  const [payrollModal, setPayrollModal] = useState<{ open: boolean; item?: PayrollEntry }>({ open: false });
  const [transferModal, setTransferModal] = useState<{ open: boolean; item?: SalaryTransfer }>({ open: false });
  const [staffForm] = Form.useForm<StaffFormValues>();
  const [salaryForm] = Form.useForm<BaseSalaryFormValues>();
  const [payrollForm] = Form.useForm<PayrollFormValues>();
  const [transferForm] = Form.useForm<TransferFormValues>();
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    void load();
  }, [staffFilter.search, staffFilter.status, payrollFilter.month, payrollFilter.status, transferFilter.status]);

  const load = async () => {
    setLoading(true);
    try {
      const [staffResponse, salaryResponse, payrollResponse, transferResponse, statsResponse, userResponse] = await Promise.all([
        hrService.getStaffs({
          search: staffFilter.search || undefined,
          status: staffFilter.status || undefined,
        }),
        hrService.getBaseSalaries(),
        hrService.getPayrolls({
          month: payrollFilter.month || undefined,
          status: payrollFilter.status || undefined,
        }),
        hrService.getTransfers({
          status: transferFilter.status || undefined,
        }),
        hrService.getStats(),
        authService.getDirectory(),
      ]);

      setStaffs(staffResponse.data);
      setBaseSalaries(salaryResponse.data);
      setPayrolls(payrollResponse.data);
      setTransfers(transferResponse.data);
      setStats(statsResponse.data);
      setUsers(userResponse.data);
    } catch {
      messageApi.error('Không thể tải module nhân sự lương.');
    } finally {
      setLoading(false);
    }
  };

  const userOptions = useMemo(
    () => users.map((user) => ({ label: `${user.fullName} (@${user.username})`, value: user.id })),
    [users],
  );

  const staffOptions = useMemo(
    () => staffs.map((staff) => ({ label: `${staff.fullName} - ${staff.position}`, value: staff.id })),
    [staffs],
  );

  const payrollOptions = useMemo(
    () =>
      payrolls.map((item) => ({
        label: `${item.staffName} - ${item.month} - ${formatCurrency(item.totalAmount)}`,
        value: item.id,
      })),
    [payrolls],
  );

  const staffColumns: ColumnsType<StaffProfile> = [
    {
      title: 'Cán bộ',
      dataIndex: 'fullName',
      key: 'fullName',
      render: (value: string, record) => (
        <div>
          <strong>{value}</strong>
          <div style={{ color: '#667085' }}>{record.position}</div>
        </div>
      ),
    },
    { title: 'Phòng ban', dataIndex: 'department', key: 'department', width: 150 },
    { title: 'Hệ số lương', dataIndex: 'salaryCoefficient', key: 'salaryCoefficient', width: 130 },
    {
      title: 'Ngân hàng',
      key: 'bank',
      width: 220,
      render: (_, record) => (
        <div>
          <div>{record.bankName}</div>
          <div style={{ color: '#667085' }}>{record.bankAccount}</div>
        </div>
      ),
    },
    {
      title: 'Liên hệ',
      key: 'contact',
      width: 220,
      render: (_, record) => (
        <div>
          <div>{record.email}</div>
          <div style={{ color: '#667085' }}>{record.phoneNumber}</div>
        </div>
      ),
    },
    { title: 'Trạng thái', dataIndex: 'status', key: 'status', width: 120, render: (value: string) => <Tag color={value === 'Active' ? 'success' : 'default'}>{value}</Tag> },
    {
      title: 'Tác vụ',
      key: 'actions',
      width: 170,
      render: (_, record) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => openStaffModal(record)}>
            Sửa
          </Button>
          <Popconfirm title="Xóa hồ sơ cán bộ này?" onConfirm={() => void handleDeleteStaff(record.id)} okText="Xóa">
            <Button size="small" danger icon={<DeleteOutlined />}>
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const salaryColumns: ColumnsType<BaseSalaryRate> = [
    { title: 'Mức lương', dataIndex: 'amount', key: 'amount', width: 180, render: (value: number) => formatCurrency(value) },
    { title: 'Hiệu lực từ', dataIndex: 'effectiveDate', key: 'effectiveDate', width: 150, render: (value: string) => new Date(value).toLocaleDateString('vi-VN') },
    { title: 'Trạng thái', dataIndex: 'isActive', key: 'isActive', width: 120, render: (value: boolean) => <Tag color={value ? 'success' : 'default'}>{value ? 'Active' : 'Inactive'}</Tag> },
    { title: 'Ghi chú', dataIndex: 'note', key: 'note' },
    {
      title: 'Tác vụ',
      key: 'actions',
      width: 170,
      render: (_, record) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => openSalaryModal(record)}>
            Sửa
          </Button>
          <Popconfirm title="Xóa mức lương cơ sở này?" onConfirm={() => void handleDeleteBaseSalary(record.id)} okText="Xóa">
            <Button size="small" danger icon={<DeleteOutlined />}>
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const payrollColumns: ColumnsType<PayrollEntry> = [
    { title: 'Cán bộ', dataIndex: 'staffName', key: 'staffName' },
    { title: 'Kỳ lương', dataIndex: 'month', key: 'month', width: 120 },
    { title: 'Lương cơ sở', dataIndex: 'baseSalaryAmount', key: 'baseSalaryAmount', width: 150, render: (value: number) => formatCurrency(value) },
    { title: 'Hệ số', dataIndex: 'salaryCoefficient', key: 'salaryCoefficient', width: 100 },
    { title: 'Phụ cấp', dataIndex: 'allowance', key: 'allowance', width: 130, render: (value: number) => formatCurrency(value) },
    { title: 'Thưởng', dataIndex: 'bonus', key: 'bonus', width: 130, render: (value: number) => formatCurrency(value) },
    { title: 'Khấu trừ', dataIndex: 'deduction', key: 'deduction', width: 130, render: (value: number) => formatCurrency(value) },
    { title: 'Thực lĩnh', dataIndex: 'totalAmount', key: 'totalAmount', width: 150, render: (value: number) => <strong>{formatCurrency(value)}</strong> },
    { title: 'Trạng thái', dataIndex: 'status', key: 'status', width: 130, render: (value: string) => <Tag color={value === 'Transferred' ? 'success' : value === 'Approved' ? 'processing' : 'default'}>{value}</Tag> },
    {
      title: 'Tác vụ',
      key: 'actions',
      width: 170,
      render: (_, record) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => openPayrollModal(record)}>
            Sửa
          </Button>
          <Popconfirm title="Xóa bảng lương này?" onConfirm={() => void handleDeletePayroll(record.id)} okText="Xóa">
            <Button size="small" danger icon={<DeleteOutlined />}>
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const transferColumns: ColumnsType<SalaryTransfer> = [
    { title: 'Cán bộ', dataIndex: 'staffName', key: 'staffName' },
    {
      title: 'Tài khoản',
      key: 'bank',
      width: 240,
      render: (_, record) => (
        <div>
          <div>{record.bankName}</div>
          <div style={{ color: '#667085' }}>{record.bankAccount}</div>
        </div>
      ),
    },
    { title: 'Số tiền', dataIndex: 'amount', key: 'amount', width: 150, render: (value: number) => formatCurrency(value) },
    { title: 'Ngày chuyển', dataIndex: 'transferDate', key: 'transferDate', width: 150, render: (value: string) => new Date(value).toLocaleDateString('vi-VN') },
    { title: 'Trạng thái', dataIndex: 'status', key: 'status', width: 130, render: (value: string) => <Tag color={value === 'Completed' ? 'success' : value === 'Failed' ? 'error' : 'processing'}>{value}</Tag> },
    { title: 'Mã tham chiếu', dataIndex: 'referenceCode', key: 'referenceCode', width: 160, render: (value: string | null) => value || '-' },
    { title: 'Ghi chú', dataIndex: 'note', key: 'note', width: 220, render: (value: string | null) => value || '-' },
    {
      title: 'Tác vụ',
      key: 'actions',
      width: 170,
      render: (_, record) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => openTransferModal(record)}>
            Sửa
          </Button>
          <Popconfirm title="Xóa lệnh chuyển lương này?" onConfirm={() => void handleDeleteTransfer(record.id)} okText="Xóa">
            <Button size="small" danger icon={<DeleteOutlined />}>
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const openStaffModal = (item?: StaffProfile) => {
    staffForm.resetFields();
    if (item) {
      staffForm.setFieldsValue({ ...item, userId: item.userId ?? undefined });
    } else {
      staffForm.setFieldsValue({ status: 'Active', salaryCoefficient: 1 });
    }
    setStaffModal({ open: true, item });
  };

  const openSalaryModal = (item?: BaseSalaryRate) => {
    salaryForm.resetFields();
    if (item) {
      salaryForm.setFieldsValue({
        amount: item.amount,
        effectiveDate: item.effectiveDate.slice(0, 10),
        note: item.note,
        isActive: item.isActive,
      });
    } else {
      salaryForm.setFieldsValue({
        amount: 0,
        effectiveDate: new Date().toISOString().slice(0, 10),
        isActive: false,
      });
    }
    setSalaryModal({ open: true, item });
  };

  const openPayrollModal = (item?: PayrollEntry) => {
    payrollForm.resetFields();
    if (item) {
      payrollForm.setFieldsValue({
        staffProfileId: item.staffProfileId,
        month: item.month,
        allowance: item.allowance,
        bonus: item.bonus,
        deduction: item.deduction,
        status: item.status,
      });
    } else {
      payrollForm.setFieldsValue({
        month: new Date().toISOString().slice(0, 7),
        allowance: 0,
        bonus: 0,
        deduction: 0,
        status: 'Draft',
      });
    }
    setPayrollModal({ open: true, item });
  };

  const openTransferModal = (item?: SalaryTransfer) => {
    transferForm.resetFields();
    if (item) {
      transferForm.setFieldsValue({
        payrollEntryId: item.payrollEntryId,
        transferDate: item.transferDate.slice(0, 10),
        status: item.status,
        referenceCode: item.referenceCode || undefined,
        note: item.note || undefined,
      });
    } else {
      transferForm.setFieldsValue({
        transferDate: new Date().toISOString().slice(0, 10),
        status: 'Pending',
      });
    }
    setTransferModal({ open: true, item });
  };

  const handleSaveStaff = async () => {
    try {
      const values = await staffForm.validateFields();
      if (staffModal.item) {
        await hrService.updateStaff(staffModal.item.id, values);
      } else {
        await hrService.createStaff(values);
      }
      messageApi.success('Đã lưu hồ sơ cán bộ.');
      setStaffModal({ open: false });
      void load();
    } catch (error: any) {
      if (!error?.errorFields) {
        messageApi.error(error?.response?.data?.message || 'Không thể lưu hồ sơ cán bộ.');
      }
    }
  };

  const handleSaveBaseSalary = async () => {
    try {
      const values = await salaryForm.validateFields();
      if (salaryModal.item) {
        await hrService.updateBaseSalary(salaryModal.item.id, values);
      } else {
        await hrService.createBaseSalary(values);
      }
      messageApi.success('Đã lưu mức lương cơ sở.');
      setSalaryModal({ open: false });
      void load();
    } catch (error: any) {
      if (!error?.errorFields) {
        messageApi.error(error?.response?.data?.message || 'Không thể lưu lương cơ sở.');
      }
    }
  };

  const handleSavePayroll = async () => {
    try {
      const values = await payrollForm.validateFields();
      if (payrollModal.item) {
        await hrService.updatePayroll(payrollModal.item.id, values);
      } else {
        await hrService.createPayroll(values);
      }
      messageApi.success('Đã lưu bảng lương.');
      setPayrollModal({ open: false });
      void load();
    } catch (error: any) {
      if (!error?.errorFields) {
        messageApi.error(error?.response?.data?.message || 'Không thể lưu bảng lương.');
      }
    }
  };

  const handleSaveTransfer = async () => {
    try {
      const values = await transferForm.validateFields();
      if (transferModal.item) {
        await hrService.updateTransfer(transferModal.item.id, values);
      } else {
        await hrService.createTransfer(values);
      }
      messageApi.success('Đã lưu lệnh chuyển lương.');
      setTransferModal({ open: false });
      void load();
    } catch (error: any) {
      if (!error?.errorFields) {
        messageApi.error(error?.response?.data?.message || 'Không thể lưu lệnh chuyển lương.');
      }
    }
  };

  const handleDeleteStaff = async (id: number) => {
    await hrService.deleteStaff(id);
    messageApi.success('Đã xóa hồ sơ cán bộ.');
    void load();
  };

  const handleDeleteBaseSalary = async (id: number) => {
    await hrService.deleteBaseSalary(id);
    messageApi.success('Đã xóa mức lương cơ sở.');
    void load();
  };

  const handleDeletePayroll = async (id: number) => {
    await hrService.deletePayroll(id);
    messageApi.success('Đã xóa bảng lương.');
    void load();
  };

  const handleDeleteTransfer = async (id: number) => {
    await hrService.deleteTransfer(id);
    messageApi.success('Đã xóa lệnh chuyển lương.');
    void load();
  };

  return (
    <>
      {contextHolder}

      <div style={{ padding: '24px 24px 0' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 20 }}>
          {[
            { label: 'Tổng cán bộ', value: stats?.staffCount ?? 0, color: '#034AA0' },
            { label: 'Cán bộ hoạt động', value: stats?.activeStaffCount ?? 0, color: '#10B981' },
            { label: 'Tổng bảng lương', value: stats?.payrollCount ?? 0, color: '#7C3AED' },
            { label: 'Đã chuyển lương', value: stats?.transferredPayrollCount ?? 0, color: '#059669' },
            { label: 'Lương cơ sở hiện tại', value: formatCurrency(stats?.currentBaseSalary ?? 0), color: '#2563EB' },
            { label: 'Tổng quỹ lương tháng', value: formatCurrency(stats?.monthlyPayrollTotal ?? 0), color: '#D97706' },
          ].map((card) => (
            <Card key={card.label} style={{ borderRadius: 18 }}>
              <div style={{ color: '#667085' }}>{card.label}</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: card.color }}>{card.value}</div>
            </Card>
          ))}
        </div>

        <Card style={{ borderRadius: 20 }}>
          <Tabs
            items={[
              {
                key: 'staffs',
                label: 'Cán bộ',
                children: (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', marginBottom: 16 }}>
                      <Space wrap>
                        <Input
                          placeholder="Tìm cán bộ"
                          value={staffFilter.search}
                          onChange={(e) => setStaffFilter((current) => ({ ...current, search: e.target.value }))}
                          allowClear
                          style={{ width: 240 }}
                        />
                        <Select
                          placeholder="Trạng thái"
                          value={staffFilter.status || undefined}
                          onChange={(value) => setStaffFilter((current) => ({ ...current, status: value || '' }))}
                          allowClear
                          style={{ width: 150 }}
                          options={staffStatusOptions.map((value) => ({ label: value, value }))}
                        />
                      </Space>
                      <Button type="primary" icon={<PlusOutlined />} onClick={() => openStaffModal()}>
                        Thêm cán bộ
                      </Button>
                    </div>
                    <Table rowKey="id" loading={loading} dataSource={staffs} columns={staffColumns} pagination={{ pageSize: 8 }} scroll={{ x: 1350 }} />
                  </>
                ),
              },
              {
                key: 'base-salaries',
                label: 'Lương cơ sở',
                children: (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
                      <Button type="primary" icon={<PlusOutlined />} onClick={() => openSalaryModal()}>
                        Thêm mức lương
                      </Button>
                    </div>
                    <Table rowKey="id" loading={loading} dataSource={baseSalaries} columns={salaryColumns} pagination={{ pageSize: 8 }} scroll={{ x: 900 }} />
                  </>
                ),
              },
              {
                key: 'payrolls',
                label: 'Bảng lương',
                children: (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', marginBottom: 16 }}>
                      <Space wrap>
                        <Input
                          placeholder="Kỳ lương YYYY-MM"
                          value={payrollFilter.month}
                          onChange={(e) => setPayrollFilter((current) => ({ ...current, month: e.target.value }))}
                          allowClear
                          style={{ width: 160 }}
                        />
                        <Select
                          placeholder="Trạng thái"
                          value={payrollFilter.status || undefined}
                          onChange={(value) => setPayrollFilter((current) => ({ ...current, status: value || '' }))}
                          allowClear
                          style={{ width: 150 }}
                          options={payrollStatusOptions.map((value) => ({ label: value, value }))}
                        />
                      </Space>
                      <Button type="primary" icon={<PlusOutlined />} onClick={() => openPayrollModal()}>
                        Thêm bảng lương
                      </Button>
                    </div>
                    <Table rowKey="id" loading={loading} dataSource={payrolls} columns={payrollColumns} pagination={{ pageSize: 8 }} scroll={{ x: 1600 }} />
                  </>
                ),
              },
              {
                key: 'transfers',
                label: 'Chuyển lương',
                children: (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', marginBottom: 16 }}>
                      <Space wrap>
                        <Select
                          placeholder="Trạng thái"
                          value={transferFilter.status || undefined}
                          onChange={(value) => setTransferFilter({ status: value || '' })}
                          allowClear
                          style={{ width: 160 }}
                          options={transferStatusOptions.map((value) => ({ label: value, value }))}
                        />
                      </Space>
                      <Button type="primary" icon={<PlusOutlined />} onClick={() => openTransferModal()}>
                        Thêm lệnh chuyển
                      </Button>
                    </div>
                    <Table rowKey="id" loading={loading} dataSource={transfers} columns={transferColumns} pagination={{ pageSize: 8 }} scroll={{ x: 1500 }} />
                  </>
                ),
              },
            ]}
          />
        </Card>
      </div>

      <Modal
        title={staffModal.item ? 'Cập nhật cán bộ' : 'Thêm cán bộ'}
        open={staffModal.open}
        onCancel={() => setStaffModal({ open: false })}
        onOk={() => void handleSaveStaff()}
        okText="Lưu"
        width={760}
      >
        <Form form={staffForm} layout="vertical" style={{ marginTop: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 12 }}>
            <Form.Item name="userId" label="Liên kết tài khoản">
              <Select allowClear options={userOptions} />
            </Form.Item>
            <Form.Item name="fullName" label="Họ tên" rules={[{ required: true, message: 'Nhập họ tên.' }]}>
              <Input />
            </Form.Item>
            <Form.Item name="position" label="Chức vụ" rules={[{ required: true, message: 'Nhập chức vụ.' }]}>
              <Input />
            </Form.Item>
            <Form.Item name="department" label="Phòng ban" rules={[{ required: true, message: 'Nhập phòng ban.' }]}>
              <Input />
            </Form.Item>
            <Form.Item name="salaryCoefficient" label="Hệ số lương" rules={[{ required: true, message: 'Nhập hệ số lương.' }]}>
              <Input type="number" min={0} step="0.01" />
            </Form.Item>
            <Form.Item name="status" label="Trạng thái" rules={[{ required: true, message: 'Chọn trạng thái.' }]}>
              <Select options={staffStatusOptions.map((value) => ({ label: value, value }))} />
            </Form.Item>
            <Form.Item name="bankName" label="Ngân hàng" rules={[{ required: true, message: 'Nhập tên ngân hàng.' }]}>
              <Input />
            </Form.Item>
            <Form.Item name="bankAccount" label="Số tài khoản" rules={[{ required: true, message: 'Nhập số tài khoản.' }]}>
              <Input />
            </Form.Item>
            <Form.Item name="email" label="Email" rules={[{ required: true, message: 'Nhập email.' }]}>
              <Input type="email" />
            </Form.Item>
            <Form.Item name="phoneNumber" label="Số điện thoại" rules={[{ required: true, message: 'Nhập số điện thoại.' }]}>
              <Input />
            </Form.Item>
          </div>
        </Form>
      </Modal>

      <Modal
        title={salaryModal.item ? 'Cập nhật lương cơ sở' : 'Thêm lương cơ sở'}
        open={salaryModal.open}
        onCancel={() => setSalaryModal({ open: false })}
        onOk={() => void handleSaveBaseSalary()}
        okText="Lưu"
      >
        <Form form={salaryForm} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="amount" label="Mức lương" rules={[{ required: true, message: 'Nhập mức lương.' }]}>
            <Input type="number" min={0} />
          </Form.Item>
          <Form.Item name="effectiveDate" label="Ngày hiệu lực" rules={[{ required: true, message: 'Chọn ngày hiệu lực.' }]}>
            <Input type="date" />
          </Form.Item>
          <Form.Item name="note" label="Ghi chú">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item name="isActive" label="Trạng thái" rules={[{ required: true, message: 'Chọn trạng thái.' }]}>
            <Select options={[{ label: 'Active', value: true }, { label: 'Inactive', value: false }]} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={payrollModal.item ? 'Cập nhật bảng lương' : 'Thêm bảng lương'}
        open={payrollModal.open}
        onCancel={() => setPayrollModal({ open: false })}
        onOk={() => void handleSavePayroll()}
        okText="Lưu"
      >
        <Form form={payrollForm} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="staffProfileId" label="Cán bộ" rules={[{ required: true, message: 'Chọn cán bộ.' }]}>
            <Select options={staffOptions} />
          </Form.Item>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 12 }}>
            <Form.Item name="month" label="Kỳ lương" rules={[{ required: true, message: 'Nhập kỳ lương.' }]}>
              <Input type="month" />
            </Form.Item>
            <Form.Item name="status" label="Trạng thái" rules={[{ required: true, message: 'Chọn trạng thái.' }]}>
              <Select options={payrollStatusOptions.map((value) => ({ label: value, value }))} />
            </Form.Item>
            <Form.Item name="allowance" label="Phụ cấp" rules={[{ required: true, message: 'Nhập phụ cấp.' }]}>
              <Input type="number" min={0} />
            </Form.Item>
            <Form.Item name="bonus" label="Thưởng" rules={[{ required: true, message: 'Nhập thưởng.' }]}>
              <Input type="number" min={0} />
            </Form.Item>
            <Form.Item name="deduction" label="Khấu trừ" rules={[{ required: true, message: 'Nhập khấu trừ.' }]}>
              <Input type="number" min={0} />
            </Form.Item>
          </div>
        </Form>
      </Modal>

      <Modal
        title={transferModal.item ? 'Cập nhật chuyển lương' : 'Thêm lệnh chuyển lương'}
        open={transferModal.open}
        onCancel={() => setTransferModal({ open: false })}
        onOk={() => void handleSaveTransfer()}
        okText="Lưu"
      >
        <Form form={transferForm} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="payrollEntryId" label="Bảng lương" rules={[{ required: true, message: 'Chọn bảng lương.' }]}>
            <Select options={payrollOptions} />
          </Form.Item>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 12 }}>
            <Form.Item name="transferDate" label="Ngày chuyển" rules={[{ required: true, message: 'Chọn ngày chuyển.' }]}>
              <Input type="date" />
            </Form.Item>
            <Form.Item name="status" label="Trạng thái" rules={[{ required: true, message: 'Chọn trạng thái.' }]}>
              <Select options={transferStatusOptions.map((value) => ({ label: value, value }))} />
            </Form.Item>
            <Form.Item name="referenceCode" label="Mã tham chiếu">
              <Input />
            </Form.Item>
            <Form.Item name="note" label="Ghi chú">
              <Input />
            </Form.Item>
          </div>
        </Form>
      </Modal>
    </>
  );
}
