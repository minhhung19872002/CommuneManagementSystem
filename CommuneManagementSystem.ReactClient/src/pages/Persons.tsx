import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  DeleteOutlined,
  DownloadOutlined,
  EditOutlined,
  EyeOutlined,
  PaperClipOutlined,
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import {
  Avatar,
  Button,
  Card,
  Descriptions,
  Form,
  Input,
  List,
  Modal,
  Select,
  Space,
  Table,
  Tabs,
  Tag,
  Tooltip,
  message,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { householdService } from '../services/householdService';
import { personService } from '../services/personService';
import { Household, Person, PersonDocument } from '../types';

const statusColor: Record<string, string> = {
  Alive: 'success',
  Dead: 'error',
  Moved: 'warning',
  Deleted: 'default',
};

const statusLabel: Record<string, string> = {
  Alive: 'Đang sống',
  Dead: 'Đã mất',
  Moved: 'Đã chuyển',
  Deleted: 'Đã xóa',
};

export default function Persons() {
  const [data, setData] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [modal, setModal] = useState<{ open: boolean; mode: 'create' | 'edit'; editing?: Person }>({
    open: false,
    mode: 'create',
  });
  const [detailModal, setDetailModal] = useState<{ open: boolean; person?: Person }>({ open: false });
  const [regModal, setRegModal] = useState<{ open: boolean; type: 'birth' | 'death' }>({
    open: false,
    type: 'birth',
  });
  const [documents, setDocuments] = useState<PersonDocument[]>([]);
  const [documentsLoading, setDocumentsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadingDocument, setUploadingDocument] = useState(false);
  const [households, setHouseholds] = useState<Household[]>([]);
  const [form] = Form.useForm();
  const [regForm] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await personService.getAll(search || undefined, statusFilter || undefined);
      setData(response.data);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    householdService.getAll().then((response) => setHouseholds(response.data)).catch(console.error);
  }, []);

  const aliveCount = useMemo(() => data.filter((item) => item.status === 'Alive').length, [data]);

  const loadDocuments = useCallback(async (personId: number) => {
    setDocumentsLoading(true);
    try {
      const response = await personService.getDocuments(personId);
      setDocuments(response.data);
    } catch {
      setDocuments([]);
    } finally {
      setDocumentsLoading(false);
    }
  }, []);

  const openEdit = (person: Person) => {
    form.setFieldsValue({
      fullName: person.fullName,
      dateOfBirth: person.dateOfBirth.split('T')[0],
      gender: person.gender,
      nationalId: person.nationalId,
      nationalIdIssuedAt: person.nationalIdIssuedAt,
      nationalIdIssuedDate: person.nationalIdIssuedDate ? person.nationalIdIssuedDate.split('T')[0] : null,
      ethnicity: person.ethnicity,
      religion: person.religion,
      educationLevel: person.educationLevel,
      occupation: person.occupation,
      householdId: person.householdId,
      relationshipToHead: person.relationshipToHead,
    });
    setModal({ open: true, mode: 'edit', editing: person });
  };

  const openDetail = async (person: Person) => {
    setDetailModal({ open: true, person });
    setSelectedFile(null);
    await loadDocuments(person.id);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      const payload = { ...values, householdId: values.householdId || null };

      if (modal.mode === 'create') {
        await personService.create(payload);
        messageApi.success('Thêm nhân khẩu thành công.');
      } else {
        await personService.update(modal.editing!.id, payload);
        messageApi.success('Cập nhật nhân khẩu thành công.');
      }

      setModal({ open: false, mode: 'create' });
      form.resetFields();
      void load();
    } catch (error: any) {
      messageApi.error(error?.response?.data?.message || 'Không thể lưu thay đổi.');
    }
  };

  const handleDelete = async (id: number) => {
    Modal.confirm({
      title: 'Xác nhận xóa',
      content: 'Bạn có chắc muốn xóa nhân khẩu này?',
      okText: 'Xóa',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await personService.delete(id);
          messageApi.success('Xóa nhân khẩu thành công.');
          void load();
        } catch (error: any) {
          messageApi.error(error?.response?.data?.message || 'Không thể xóa nhân khẩu.');
        }
      },
    });
  };

  const handleRegister = async () => {
    try {
      const values = await regForm.validateFields();

      if (regModal.type === 'birth') {
        await personService.registerBirth(values);
        messageApi.success('Đăng ký khai sinh thành công.');
      } else {
        const person = data.find((item) => item.id === Number(values.personId));
        await personService.registerDeath({
          ...values,
          personId: Number(values.personId),
          fullName: person?.fullName ?? values.fullName ?? '',
        });
        messageApi.success('Đăng ký khai tử thành công.');
      }

      setRegModal({ open: false, type: 'birth' });
      regForm.resetFields();
      void load();
    } catch (error: any) {
      messageApi.error(error?.response?.data?.message || 'Không thể hoàn tất đăng ký.');
    }
  };

  const handleUploadDocument = async () => {
    if (!detailModal.person || !selectedFile) {
      messageApi.warning('Vui lòng chọn tệp tài liệu.');
      return;
    }

    setUploadingDocument(true);
    try {
      await personService.uploadDocument(detailModal.person.id, selectedFile);
      messageApi.success('Tải tài liệu thành công.');
      setSelectedFile(null);
      await loadDocuments(detailModal.person.id);
    } catch (error: any) {
      messageApi.error(error?.response?.data?.message || 'Không thể tải tài liệu.');
    } finally {
      setUploadingDocument(false);
    }
  };

  const handleDeleteDocument = async (documentId: number) => {
    try {
      await personService.deleteDocument(documentId);
      messageApi.success('Đã xóa tài liệu.');
      if (detailModal.person) {
        await loadDocuments(detailModal.person.id);
      }
    } catch (error: any) {
      messageApi.error(error?.response?.data?.message || 'Không thể xóa tài liệu.');
    }
  };

  const handleDownloadDocument = async (personDocument: PersonDocument) => {
    try {
      const response = await personService.downloadDocument(personDocument.id);
      const blob = new Blob([response.data], { type: personDocument.contentType });
      const url = window.URL.createObjectURL(blob);
      const anchor = window.document.createElement('a');
      anchor.href = url;
      anchor.download = personDocument.fileName;
      anchor.click();
      window.URL.revokeObjectURL(url);
    } catch {
      messageApi.error('Không thể tải tài liệu.');
    }
  };

  const columns: ColumnsType<Person> = [
    {
      title: 'Họ tên',
      dataIndex: 'fullName',
      key: 'fullName',
      render: (value: string) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Avatar style={{ background: '#155DFC', flexShrink: 0, fontWeight: 800 }}>{value.charAt(0)}</Avatar>
          <span style={{ fontWeight: 700 }}>{value}</span>
        </div>
      ),
    },
    {
      title: 'Ngày sinh',
      dataIndex: 'dateOfBirth',
      key: 'dateOfBirth',
      render: (value: string) => new Date(value).toLocaleDateString('vi-VN'),
      sorter: (a, b) => new Date(a.dateOfBirth).getTime() - new Date(b.dateOfBirth).getTime(),
    },
    {
      title: 'Giới tính',
      dataIndex: 'gender',
      key: 'gender',
      width: 90,
      align: 'center',
    },
    {
      title: 'CCCD',
      dataIndex: 'nationalId',
      key: 'nationalId',
      render: (value: string) => value || '—',
      ellipsis: true,
    },
    { title: 'Dân tộc', dataIndex: 'ethnicity', key: 'ethnicity', ellipsis: true },
    {
      title: 'Nghề nghiệp',
      dataIndex: 'occupation',
      key: 'occupation',
      render: (value: string) => value || '—',
      ellipsis: true,
    },
    {
      title: 'Hộ khẩu',
      dataIndex: 'householdNumber',
      key: 'householdNumber',
      render: (value: string) => value || '—',
      ellipsis: true,
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
      width: 180,
      align: 'center',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Xem chi tiết">
            <Button size="small" icon={<EyeOutlined />} onClick={() => void openDetail(record)} />
          </Tooltip>
          <Tooltip title="Sửa">
            <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(record)} />
          </Tooltip>
          <Tooltip title="Tài liệu">
            <Button size="small" icon={<PaperClipOutlined />} onClick={() => void openDetail(record)} />
          </Tooltip>
          <Tooltip title="Xóa">
            <Button size="small" danger icon={<DeleteOutlined />} onClick={() => void handleDelete(record.id)} />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="management-page" data-testid="persons-page">
      {contextHolder}

      <section className="management-page__hero">
        <div className="management-page__copy">
          <p className="management-page__eyebrow">Dân cư / Nhân khẩu</p>
          <h1 className="management-page__title">Hồ sơ công dân</h1>
          <p className="management-page__subtitle">
            Quản lý thông tin định danh, quan hệ hộ khẩu, khai sinh, khai tử và tài liệu đính kèm.
          </p>
        </div>

        <div className="management-page__meta">
          <div className="management-page__stat">
            <span className="management-page__stat-value">{data.length}</span>
            <span className="management-page__stat-label">Nhân khẩu hiện có</span>
          </div>
          <div className="management-page__stat">
            <span className="management-page__stat-value">{aliveCount}</span>
            <span className="management-page__stat-label">Đang sống</span>
          </div>
          <div className="management-page__actions">
            <Button onClick={() => { regForm.resetFields(); setRegModal({ open: true, type: 'birth' }); }}>
              Đăng ký khai sinh
            </Button>
            <Button danger onClick={() => { regForm.resetFields(); setRegModal({ open: true, type: 'death' }); }}>
              Đăng ký khai tử
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                form.resetFields();
                setModal({ open: true, mode: 'create' });
              }}
            >
              Thêm nhân khẩu
            </Button>
          </div>
        </div>
      </section>

      <section className="management-toolbar">
        <Input
          className="management-toolbar__grow"
          prefix={<SearchOutlined />}
          placeholder="Tìm theo họ tên hoặc CCCD"
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
            { label: 'Đang sống', value: 'Alive' },
            { label: 'Đã mất', value: 'Dead' },
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
            showTotal: (total) => `${total} nhân khẩu`,
          }}
        />
      </Card>

      <Modal
        title={modal.mode === 'create' ? 'Thêm nhân khẩu mới' : 'Chỉnh sửa nhân khẩu'}
        open={modal.open}
        onCancel={() => {
          setModal({ open: false, mode: 'create' });
          form.resetFields();
        }}
        onOk={() => void handleSave()}
        okText={modal.mode === 'create' ? 'Tạo mới' : 'Lưu thay đổi'}
        width={680}
      >
        <Form form={form} layout="vertical">
          <div className="form-grid-two">
            <Form.Item name="fullName" label="Họ tên" rules={[{ required: true, message: 'Vui lòng nhập họ tên.' }]}>
              <Input placeholder="Nguyễn Văn A" />
            </Form.Item>
            <Form.Item
              name="dateOfBirth"
              label="Ngày sinh"
              rules={[{ required: true, message: 'Vui lòng nhập ngày sinh.' }]}
            >
              <Input type="date" />
            </Form.Item>
            <Form.Item name="gender" label="Giới tính" initialValue="Nam" rules={[{ required: true }]}>
              <Select options={[{ label: 'Nam', value: 'Nam' }, { label: 'Nữ', value: 'Nữ' }]} />
            </Form.Item>
            <Form.Item name="nationalId" label="Số CCCD">
              <Input placeholder="012345678901" />
            </Form.Item>
            <Form.Item name="nationalIdIssuedAt" label="Nơi cấp CCCD">
              <Input placeholder="Công an tỉnh..." />
            </Form.Item>
            <Form.Item name="nationalIdIssuedDate" label="Ngày cấp CCCD">
              <Input type="date" />
            </Form.Item>
            <Form.Item name="ethnicity" label="Dân tộc" initialValue="Kinh">
              <Input />
            </Form.Item>
            <Form.Item name="religion" label="Tôn giáo" initialValue="Không">
              <Input />
            </Form.Item>
            <Form.Item name="educationLevel" label="Trình độ học vấn">
              <Input placeholder="Ví dụ: 12/12" />
            </Form.Item>
            <Form.Item name="occupation" label="Nghề nghiệp">
              <Input placeholder="Nghề nghiệp hiện tại" />
            </Form.Item>
            <Form.Item name="householdId" label="Hộ khẩu">
              <Select
                showSearch
                optionFilterProp="label"
                placeholder="Chọn hộ khẩu"
                allowClear
                options={households.map((household) => ({
                  label: `${household.householdNumber} — ${household.address}`,
                  value: household.id,
                }))}
              />
            </Form.Item>
            <Form.Item name="relationshipToHead" label="Quan hệ với chủ hộ">
              <Input placeholder="Ví dụ: Vợ, con, anh..." />
            </Form.Item>
          </div>
        </Form>
      </Modal>

      <Modal
        title={`Chi tiết nhân khẩu ${detailModal.person?.fullName || ''}`}
        open={detailModal.open}
        onCancel={() => {
          setDetailModal({ open: false });
          setDocuments([]);
          setSelectedFile(null);
        }}
        footer={<Button onClick={() => setDetailModal({ open: false })}>Đóng</Button>}
        width={760}
      >
        {detailModal.person && (
          <div className="management-section">
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <Avatar size={56} style={{ background: '#155DFC', fontWeight: 800, fontSize: '22px' }}>
                {detailModal.person.fullName.charAt(0)}
              </Avatar>
              <div>
                <div style={{ fontWeight: 800, fontSize: '16px' }}>{detailModal.person.fullName}</div>
                <Tag color={statusColor[detailModal.person.status]} style={{ marginTop: '6px' }}>
                  {statusLabel[detailModal.person.status]}
                </Tag>
              </div>
            </div>

            <Descriptions
              column={2}
              size="small"
              bordered
              items={[
                {
                  key: 'dob',
                  label: 'Ngày sinh',
                  children: new Date(detailModal.person.dateOfBirth).toLocaleDateString('vi-VN'),
                },
                { key: 'gender', label: 'Giới tính', children: detailModal.person.gender },
                { key: 'nationalId', label: 'CCCD', children: detailModal.person.nationalId || '—' },
                { key: 'issuedAt', label: 'Nơi cấp', children: detailModal.person.nationalIdIssuedAt || '—' },
                { key: 'ethnicity', label: 'Dân tộc', children: detailModal.person.ethnicity },
                { key: 'religion', label: 'Tôn giáo', children: detailModal.person.religion },
                { key: 'education', label: 'Học vấn', children: detailModal.person.educationLevel || '—' },
                { key: 'job', label: 'Nghề nghiệp', children: detailModal.person.occupation || '—' },
                { key: 'household', label: 'Hộ khẩu', children: detailModal.person.householdNumber || 'Chưa có' },
                { key: 'relation', label: 'Quan hệ', children: detailModal.person.relationshipToHead || '—' },
              ]}
            />

            <div>
              <p className="management-page__eyebrow" style={{ marginBottom: '0.75rem' }}>
                Tài liệu đính kèm
              </p>

              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap' }}>
                <input
                  type="file"
                  onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)}
                  aria-label="Tài liệu nhân khẩu"
                />
                <Button
                  type="primary"
                  icon={<UploadOutlined />}
                  onClick={() => void handleUploadDocument()}
                  loading={uploadingDocument}
                >
                  Tải tài liệu
                </Button>
                {selectedFile && <span style={{ color: '#667085' }}>{selectedFile.name}</span>}
              </div>

              <List
                loading={documentsLoading}
                dataSource={documents}
                locale={{ emptyText: 'Chưa có tài liệu nào.' }}
                renderItem={(document) => (
                  <List.Item
                    actions={[
                      <Button
                        key="download"
                        size="small"
                        icon={<DownloadOutlined />}
                        onClick={() => void handleDownloadDocument(document)}
                      >
                        Tải xuống
                      </Button>,
                      <Button
                        key="delete"
                        size="small"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => void handleDeleteDocument(document.id)}
                      >
                        Xóa
                      </Button>,
                    ]}
                  >
                    <List.Item.Meta
                      title={document.fileName}
                      description={`${(document.fileSize / 1024).toFixed(1)} KB · ${new Date(document.uploadedAt).toLocaleString('vi-VN')} · ${document.uploadedBy}`}
                    />
                  </List.Item>
                )}
              />
            </div>
          </div>
        )}
      </Modal>

      <Modal
        title={regModal.type === 'birth' ? 'Đăng ký khai sinh' : 'Đăng ký khai tử'}
        open={regModal.open}
        onCancel={() => {
          setRegModal({ open: false, type: 'birth' });
          regForm.resetFields();
        }}
        onOk={() => void handleRegister()}
        okText="Xác nhận"
        width={560}
      >
        <Tabs
          activeKey={regModal.type}
          onChange={(key) => {
            regForm.resetFields();
            setRegModal({ open: true, type: key as 'birth' | 'death' });
          }}
          items={[
            {
              key: 'birth',
              label: 'Khai sinh',
              children: (
                <Form form={regForm} layout="vertical">
                  <div className="form-grid-two">
                    <Form.Item
                      name="fullName"
                      label="Họ tên trẻ"
                      rules={[{ required: true, message: 'Vui lòng nhập họ tên trẻ.' }]}
                    >
                      <Input placeholder="Họ tên trẻ" />
                    </Form.Item>
                    <Form.Item name="dateOfBirth" label="Ngày sinh" rules={[{ required: true }]}>
                      <Input type="date" />
                    </Form.Item>
                    <Form.Item name="gender" label="Giới tính" initialValue="Nam" rules={[{ required: true }]}>
                      <Select options={[{ label: 'Nam', value: 'Nam' }, { label: 'Nữ', value: 'Nữ' }]} />
                    </Form.Item>
                    <Form.Item name="birthPlace" label="Nơi sinh">
                      <Input placeholder="Bệnh viện, xã..." />
                    </Form.Item>
                    <Form.Item name="motherId" label="Người mẹ">
                      <Select
                        showSearch
                        optionFilterProp="label"
                        allowClear
                        options={data.map((person) => ({ label: person.fullName, value: person.id }))}
                      />
                    </Form.Item>
                    <Form.Item name="fatherId" label="Người cha">
                      <Select
                        showSearch
                        optionFilterProp="label"
                        allowClear
                        options={data.map((person) => ({ label: person.fullName, value: person.id }))}
                      />
                    </Form.Item>
                  </div>
                </Form>
              ),
            },
            {
              key: 'death',
              label: 'Khai tử',
              children: (
                <Form form={regForm} layout="vertical">
                  <div className="form-grid-two">
                    <Form.Item
                      name="personId"
                      label="Nhân khẩu"
                      rules={[{ required: true, message: 'Vui lòng chọn nhân khẩu.' }]}
                    >
                      <Select
                        showSearch
                        optionFilterProp="label"
                        options={data
                          .filter((person) => person.status === 'Alive')
                          .map((person) => ({ label: person.fullName, value: person.id }))}
                      />
                    </Form.Item>
                    <Form.Item name="dateOfDeath" label="Ngày mất" rules={[{ required: true }]}>
                      <Input type="date" />
                    </Form.Item>
                    <Form.Item
                      name="placeOfDeath"
                      label="Nơi mất"
                      rules={[{ required: true, message: 'Vui lòng nhập nơi mất.' }]}
                    >
                      <Input placeholder="Bệnh viện, xã..." />
                    </Form.Item>
                    <Form.Item name="reason" label="Nguyên nhân">
                      <Input placeholder="Nguyên nhân tử vong" />
                    </Form.Item>
                  </div>
                </Form>
              ),
            },
          ]}
        />
      </Modal>
    </div>
  );
}
