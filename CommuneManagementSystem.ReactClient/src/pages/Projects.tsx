import React, { useEffect, useMemo, useState } from 'react';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Card, Form, Input, Modal, Popconfirm, Progress, Select, Space, Table, Tabs, Tag, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import './Projects.css';
import { projectService } from '../services/projectService';
import { authService } from '../services/authService';
import { catalogService } from '../services/catalogService';
import { AppUser, CatalogItem, ProjectItem, ProjectProposalStats, ProposalItem } from '../types';

type ProjectFormValues = {
  name: string;
  description: string;
  sponsor: string;
  budget: number;
  startDate: string;
  endDate: string;
  progress: number;
  status: string;
  managerUserId?: number;
};

type ProposalFormValues = {
  title: string;
  content: string;
  fieldCode: string;
  priority: string;
  status: string;
  reviewNote?: string;
};

const projectStatusOptions = ['Planning', 'Active', 'Completed', 'OnHold'];
const proposalStatusOptions = ['Pending', 'Approved', 'Rejected'];
const priorityOptions = ['Low', 'Medium', 'High'];
const formatCurrency = (value: number) =>
  `${value.toLocaleString('vi-VN', { maximumFractionDigits: 0 })} đ`;

export default function Projects() {
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [proposals, setProposals] = useState<ProposalItem[]>([]);
  const [stats, setStats] = useState<ProjectProposalStats | null>(null);
  const [users, setUsers] = useState<AppUser[]>([]);
  const [fields, setFields] = useState<CatalogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [projectFilter, setProjectFilter] = useState({ search: '', status: '' });
  const [proposalFilter, setProposalFilter] = useState({ search: '', status: '', fieldCode: '', priority: '' });
  const [projectModal, setProjectModal] = useState<{ open: boolean; item?: ProjectItem }>({ open: false });
  const [projectDetailModal, setProjectDetailModal] = useState<{ open: boolean; item?: ProjectItem }>({ open: false });
  const [proposalModal, setProposalModal] = useState<{ open: boolean; item?: ProposalItem }>({ open: false });
  const [proposalDetailModal, setProposalDetailModal] = useState<{ open: boolean; item?: ProposalItem }>({ open: false });
  const [projectForm] = Form.useForm<ProjectFormValues>();
  const [proposalForm] = Form.useForm<ProposalFormValues>();
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    void load();
  }, [projectFilter.search, projectFilter.status, proposalFilter.search, proposalFilter.status, proposalFilter.fieldCode, proposalFilter.priority]);

  const load = async () => {
    setLoading(true);
    try {
      const [projectResponse, proposalResponse, statsResponse, userResponse] = await Promise.all([
        projectService.getProjects({
          search: projectFilter.search || undefined,
          status: projectFilter.status || undefined,
        }),
        projectService.getProposals({
          search: proposalFilter.search || undefined,
          status: proposalFilter.status || undefined,
          fieldCode: proposalFilter.fieldCode || undefined,
          priority: proposalFilter.priority || undefined,
        }),
        projectService.getStats(),
        authService.getDirectory(),
      ]);

      setProjects(projectResponse.data);
      setProposals(proposalResponse.data);
      setStats(statsResponse.data);
      setUsers(userResponse.data);

      try {
        const fieldResponse = await catalogService.getAll('Field');
        setFields(fieldResponse.data);
      } catch {
        // Silently ignore — non-admin users don't have catalog access
      }
    } catch {
      messageApi.error('Không thể tải module dự án.');
    } finally {
      setLoading(false);
    }
  };

  const userOptions = useMemo(
    () => users.map((user) => ({ label: `${user.fullName} (@${user.username})`, value: user.id })),
    [users],
  );

  const projectColumns: ColumnsType<ProjectItem> = [
    {
      title: 'Dự án',
      dataIndex: 'name',
      key: 'name',
      render: (value: string, record) => (
        <div>
          <strong>{value}</strong>
          <div style={{ color: '#667085' }}>{record.description}</div>
        </div>
      ),
    },
    { title: 'Chủ đầu tư', dataIndex: 'sponsor', key: 'sponsor', width: 150 },
    { title: 'Quản lý', dataIndex: 'managerUserName', key: 'managerUserName', width: 180, render: (value) => value || 'Chưa gán' },
    { title: 'Ngân sách', dataIndex: 'budget', key: 'budget', width: 160, render: (value: number) => formatCurrency(value) },
    { title: 'Tiến độ', dataIndex: 'progress', key: 'progress', width: 170, render: (value: number) => <Progress percent={value} size="small" /> },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 140,
      render: (value: string) => (
        <Tag color={value === 'Completed' ? 'success' : value === 'Active' ? 'processing' : value === 'OnHold' ? 'warning' : 'default'}>
          {value}
        </Tag>
      ),
    },
    {
      title: 'Tác vụ',
      key: 'actions',
      width: 170,
      render: (_, record) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => openProjectModal(record)}>
            Sửa
          </Button>
          <Popconfirm title="Xóa dự án này?" onConfirm={() => void handleDeleteProject(record.id)} okText="Xóa">
            <Button size="small" danger icon={<DeleteOutlined />}>
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const proposalColumns: ColumnsType<ProposalItem> = [
    {
      title: 'Đề xuất',
      dataIndex: 'title',
      key: 'title',
      render: (value: string, record) => (
        <div>
          <strong>{value}</strong>
          <div style={{ color: '#667085' }}>{record.content}</div>
        </div>
      ),
    },
    { title: 'Lĩnh vực', dataIndex: 'fieldCode', key: 'fieldCode', width: 120, render: (value: string) => <Tag color="blue">{value}</Tag> },
    { title: 'Ưu tiên', dataIndex: 'priority', key: 'priority', width: 120, render: (value: string) => <Tag color={value === 'High' ? 'red' : value === 'Medium' ? 'gold' : 'default'}>{value}</Tag> },
    { title: 'Người gửi', dataIndex: 'submittedByName', key: 'submittedByName', width: 170 },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 130,
      render: (value: string) => (
        <Tag color={value === 'Approved' ? 'success' : value === 'Rejected' ? 'error' : 'processing'}>{value}</Tag>
      ),
    },
    { title: 'Ghi chú phê duyệt', dataIndex: 'reviewNote', key: 'reviewNote', width: 220, render: (value: string | null) => value || '-' },
    {
      title: 'Tác vụ',
      key: 'actions',
      width: 170,
      render: (_, record) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => openProposalModal(record)}>
            Sửa
          </Button>
          <Popconfirm title="Xóa đề xuất này?" onConfirm={() => void handleDeleteProposal(record.id)} okText="Xóa">
            <Button size="small" danger icon={<DeleteOutlined />}>
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const openProjectModal = (item?: ProjectItem) => {
    projectForm.resetFields();
    if (item) {
      projectForm.setFieldsValue({
        ...item,
        startDate: item.startDate.slice(0, 10),
        endDate: item.endDate.slice(0, 10),
        managerUserId: item.managerUserId ?? undefined,
      });
    } else {
      const today = new Date().toISOString().slice(0, 10);
      projectForm.setFieldsValue({
        budget: 0,
        progress: 0,
        startDate: today,
        endDate: today,
        status: 'Planning',
      });
    }
    setProjectModal({ open: true, item });
  };

  const openProposalModal = (item?: ProposalItem) => {
    proposalForm.resetFields();
    if (item) {
      proposalForm.setFieldsValue({
        title: item.title,
        content: item.content,
        fieldCode: item.fieldCode,
        priority: item.priority,
        status: item.status,
        reviewNote: item.reviewNote || undefined,
      });
    } else {
      proposalForm.setFieldsValue({
        priority: 'Medium',
        status: 'Pending',
      });
    }
    setProposalModal({ open: true, item });
  };

  const handleSaveProject = async () => {
    try {
      const values = await projectForm.validateFields();
      if (projectModal.item) {
        await projectService.updateProject(projectModal.item.id, values);
      } else {
        await projectService.createProject(values);
      }
      messageApi.success('Đã lưu dự án.');
      setProjectModal({ open: false });
      void load();
    } catch (error: any) {
      if (!error?.errorFields) {
        messageApi.error(error?.response?.data?.message || 'Không thể lưu dự án.');
      }
    }
  };

  const handleSaveProposal = async () => {
    try {
      const values = await proposalForm.validateFields();
      if (proposalModal.item) {
        await projectService.updateProposal(proposalModal.item.id, values);
      } else {
        await projectService.createProposal(values);
      }
      messageApi.success('Đã lưu đề xuất.');
      setProposalModal({ open: false });
      void load();
    } catch (error: any) {
      if (!error?.errorFields) {
        messageApi.error(error?.response?.data?.message || 'Không thể lưu đề xuất.');
      }
    }
  };

  const handleDeleteProject = async (id: number) => {
    await projectService.deleteProject(id);
    messageApi.success('Đã xóa dự án.');
    void load();
  };

  const handleDeleteProposal = async (id: number) => {
    await projectService.deleteProposal(id);
    messageApi.success('Đã xóa đề xuất.');
    void load();
  };

  return (
    <>
      {contextHolder}

      <div className="civic-page page-wrapper">
        <div className="civic-page-hero">
          <div className="civic-page-hero__inner">
            <div className="civic-page-hero__left">
              <div className="civic-page-hero__eyebrow">Điều hành / Dự án</div>
              <h1 className="civic-page-hero__title">Dự án &amp; Đề xuất</h1>
              <p className="civic-page-hero__subtitle">
                Quản lý tiến độ dự án, ngân sách và tiếp nhận đề xuất từ cộng đồng.
              </p>
            </div>
            <div className="civic-page-hero__stats">
              <div className="civic-page-hero__stat">
                <div className="civic-page-hero__stat-value">{stats?.totalProjects ?? 0}</div>
                <div className="civic-page-hero__stat-label">Dự án</div>
              </div>
              <div className="civic-page-hero__stat">
                <div className="civic-page-hero__stat-value">{stats?.activeProjects ?? 0}</div>
                <div className="civic-page-hero__stat-label">Đang chạy</div>
              </div>
              <div className="civic-page-hero__stat">
                <div className="civic-page-hero__stat-value">{stats?.pendingProposals ?? 0}</div>
                <div className="civic-page-hero__stat-label">Chờ duyệt</div>
              </div>
            </div>
          </div>
        </div>

        <Card className="civic-section" styles={{ body: { padding: '0 0 4px' } }}>
          <Tabs
            items={[
              {
                key: 'projects',
                label: 'Dự án',
                children: (
                  <>
                    <div className="civic-toolbar" style={{ borderRadius: 0, borderLeft: 'none', borderRight: 'none', borderTop: 'none', margin: 0 }}>
                      <div className="civic-toolbar__filters">
                        <Input
                          placeholder="Tìm dự án"
                          value={projectFilter.search}
                          onChange={(e) => setProjectFilter((current) => ({ ...current, search: e.target.value }))}
                          allowClear
                          style={{ width: 260 }}
                        />
                        <Select
                          placeholder="Trạng thái"
                          value={projectFilter.status || undefined}
                          onChange={(value) => setProjectFilter((current) => ({ ...current, status: value || '' }))}
                          allowClear
                          style={{ width: 160 }}
                          options={projectStatusOptions.map((value) => ({ label: value, value }))}
                        />
                      </div>
                      <div className="civic-toolbar__actions">
                        <Button type="primary" icon={<PlusOutlined />} onClick={() => openProjectModal()}>
                          Thêm dự án
                        </Button>
                      </div>
                    </div>
                    <div className="civic-table-wrapper" style={{ padding: '0 16px 16px' }}>
                      <Table
                        rowKey="id"
                        loading={loading}
                        dataSource={projects}
                        columns={projectColumns}
                        pagination={{ pageSize: 8 }}
                        scroll={{ x: 1100 }}
                        onRow={(record) => ({
                          onDoubleClick: () => setProjectDetailModal({ open: true, item: record }),
                          style: { cursor: 'pointer' },
                        })}
                      />
                    </div>
                  </>
                ),
              },
              {
                key: 'proposals',
                label: 'Đề xuất',
                children: (
                  <>
                    <div className="civic-toolbar" style={{ borderRadius: 0, borderLeft: 'none', borderRight: 'none', borderTop: 'none', margin: 0 }}>
                      <div className="civic-toolbar__filters">
                        <Input
                          placeholder="Tìm đề xuất"
                          value={proposalFilter.search}
                          onChange={(e) => setProposalFilter((current) => ({ ...current, search: e.target.value }))}
                          allowClear
                          style={{ width: 220 }}
                        />
                        <Select
                          placeholder="Trạng thái"
                          value={proposalFilter.status || undefined}
                          onChange={(value) => setProposalFilter((current) => ({ ...current, status: value || '' }))}
                          allowClear
                          style={{ width: 150 }}
                          options={proposalStatusOptions.map((value) => ({ label: value, value }))}
                        />
                        <Select
                          placeholder="Lĩnh vực"
                          value={proposalFilter.fieldCode || undefined}
                          onChange={(value) => setProposalFilter((current) => ({ ...current, fieldCode: value || '' }))}
                          allowClear
                          style={{ width: 150 }}
                          options={fields.map((item) => ({ label: item.name, value: item.code }))}
                        />
                        <Select
                          placeholder="Ưu tiên"
                          value={proposalFilter.priority || undefined}
                          onChange={(value) => setProposalFilter((current) => ({ ...current, priority: value || '' }))}
                          allowClear
                          style={{ width: 130 }}
                          options={priorityOptions.map((value) => ({ label: value, value }))}
                        />
                      </div>
                      <div className="civic-toolbar__actions">
                        <Button type="primary" icon={<PlusOutlined />} onClick={() => openProposalModal()}>
                          Thêm đề xuất
                        </Button>
                      </div>
                    </div>
                    <div className="civic-table-wrapper" style={{ padding: '0 16px 16px' }}>
                      <Table
                        rowKey="id"
                        loading={loading}
                        dataSource={proposals}
                        columns={proposalColumns}
                        pagination={{ pageSize: 8 }}
                        scroll={{ x: 1200 }}
                        onRow={(record) => ({
                          onDoubleClick: () => setProposalDetailModal({ open: true, item: record }),
                          style: { cursor: 'pointer' },
                        })}
                      />
                    </div>
                  </>
                ),
              },
            ]}
          />
        </Card>
      </div>

      <Modal
        title={projectModal.item ? 'Cập nhật dự án' : 'Thêm dự án'}
        open={projectModal.open}
        onCancel={() => setProjectModal({ open: false })}
        onOk={() => void handleSaveProject()}
        okText="Lưu"
        width={760}
      >
        <Form form={projectForm} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="name" label="Tên dự án" rules={[{ required: true, message: 'Nhập tên dự án.' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Mô tả" rules={[{ required: true, message: 'Nhập mô tả.' }]}>
            <Input.TextArea rows={4} />
          </Form.Item>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 12 }}>
            <Form.Item name="sponsor" label="Chủ đầu tư" rules={[{ required: true, message: 'Nhập chủ đầu tư.' }]}>
              <Input />
            </Form.Item>
            <Form.Item name="budget" label="Ngân sách" rules={[{ required: true, message: 'Nhập ngân sách.' }]}>
              <Input type="number" min={0} />
            </Form.Item>
            <Form.Item name="managerUserId" label="Quản lý dự án">
              <Select allowClear options={userOptions} />
            </Form.Item>
            <Form.Item name="status" label="Trạng thái" rules={[{ required: true, message: 'Chọn trạng thái.' }]}>
              <Select options={projectStatusOptions.map((value) => ({ label: value, value }))} />
            </Form.Item>
            <Form.Item name="progress" label="Tiến độ" rules={[{ required: true, message: 'Nhập tiến độ.' }]}>
              <Input type="number" min={0} max={100} />
            </Form.Item>
            <Form.Item name="startDate" label="Ngày bắt đầu" rules={[{ required: true, message: 'Chọn ngày bắt đầu.' }]}>
              <Input type="date" />
            </Form.Item>
            <Form.Item name="endDate" label="Ngày kết thúc" rules={[{ required: true, message: 'Chọn ngày kết thúc.' }]}>
              <Input type="date" />
            </Form.Item>
          </div>
        </Form>
      </Modal>

      <Modal
        title={proposalModal.item ? 'Cập nhật đề xuất' : 'Thêm đề xuất'}
        open={proposalModal.open}
        onCancel={() => setProposalModal({ open: false })}
        onOk={() => void handleSaveProposal()}
        okText="Lưu"
        width={720}
      >
        <Form form={proposalForm} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="title" label="Tiêu đề" rules={[{ required: true, message: 'Nhập tiêu đề.' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="content" label="Nội dung" rules={[{ required: true, message: 'Nhập nội dung.' }]}>
            <Input.TextArea rows={5} />
          </Form.Item>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 12 }}>
            <Form.Item name="fieldCode" label="Lĩnh vực" rules={[{ required: true, message: 'Chọn lĩnh vực.' }]}>
              <Select options={fields.map((item) => ({ label: item.name, value: item.code }))} />
            </Form.Item>
            <Form.Item name="priority" label="Ưu tiên" rules={[{ required: true, message: 'Chọn mức ưu tiên.' }]}>
              <Select options={priorityOptions.map((value) => ({ label: value, value }))} />
            </Form.Item>
            <Form.Item name="status" label="Trạng thái" rules={[{ required: true, message: 'Chọn trạng thái.' }]}>
              <Select options={proposalStatusOptions.map((value) => ({ label: value, value }))} />
            </Form.Item>
          </div>
          <Form.Item name="reviewNote" label="Ghi chú phê duyệt">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>

      {/* Project detail modal */}
      <Modal
        title={`Chi tiết: ${projectDetailModal.item?.name || ''}`}
        open={projectDetailModal.open}
        onCancel={() => setProjectDetailModal({ open: false })}
        footer={
          <>
            <Button onClick={() => setProjectDetailModal({ open: false })}>Đóng</Button>
            <Button type="primary" onClick={() => { setProjectDetailModal({ open: false }); openProjectModal(projectDetailModal.item); }}>
              Chỉnh sửa
            </Button>
          </>
        }
        width={680}
      >
        {projectDetailModal.item && (
          <div className="projects-detail-grid">
            <div className="projects-detail-hero">
              <div className="projects-detail-hero__label">Mô tả</div>
              <div className="projects-detail-hero__value">{projectDetailModal.item.description}</div>
            </div>
            <div className="projects-detail-row">
              {[
                { label: 'Chủ đầu tư', value: projectDetailModal.item.sponsor },
                { label: 'Quản lý', value: projectDetailModal.item.managerUserName || 'Chưa gán' },
                { label: 'Ngân sách', value: formatCurrency(projectDetailModal.item.budget) },
                { label: 'Tiến độ', value: `${projectDetailModal.item.progress}%` },
                { label: 'Trạng thái', value: projectDetailModal.item.status },
                { label: 'Ngày bắt đầu', value: new Date(projectDetailModal.item.startDate).toLocaleDateString('vi-VN') },
                { label: 'Ngày kết thúc', value: new Date(projectDetailModal.item.endDate).toLocaleDateString('vi-VN') },
              ].map((item) => (
                <div key={item.label} className="projects-detail-card">
                  <div className="projects-detail-card__label">{item.label}</div>
                  <div className="projects-detail-card__value">{item.value}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>

      {/* Proposal detail modal */}
      <Modal
        title={`Chi tiết đề xuất: ${proposalDetailModal.item?.title || ''}`}
        open={proposalDetailModal.open}
        onCancel={() => setProposalDetailModal({ open: false })}
        footer={
          <>
            <Button onClick={() => setProposalDetailModal({ open: false })}>Đóng</Button>
            <Button type="primary" onClick={() => { setProposalDetailModal({ open: false }); openProposalModal(proposalDetailModal.item); }}>
              Chỉnh sửa
            </Button>
          </>
        }
        width={720}
      >
        {proposalDetailModal.item && (
          <div className="projects-detail-grid">
            <div className="projects-detail-hero">
              <div className="projects-detail-hero__label">Nội dung</div>
              <div className="projects-detail-hero__value">{proposalDetailModal.item.content}</div>
            </div>
            <div className="projects-detail-row">
              {[
                { label: 'Lĩnh vực', value: proposalDetailModal.item.fieldCode },
                { label: 'Ưu tiên', value: proposalDetailModal.item.priority },
                { label: 'Trạng thái', value: proposalDetailModal.item.status },
                { label: 'Người gửi', value: proposalDetailModal.item.submittedByName || '—' },
                { label: 'Ngày gửi', value: proposalDetailModal.item.submittedAt ? new Date(proposalDetailModal.item.submittedAt).toLocaleString('vi-VN') : '—' },
                { label: 'Ngày duyệt', value: proposalDetailModal.item.reviewedAt ? new Date(proposalDetailModal.item.reviewedAt).toLocaleString('vi-VN') : '—' },
              ].map((item) => (
                <div key={item.label} className="projects-detail-card">
                  <div className="projects-detail-card__label">{item.label}</div>
                  <div className="projects-detail-card__value">{item.value}</div>
                </div>
              ))}
            </div>
            {proposalDetailModal.item.reviewNote && (
              <div className="projects-detail-hero">
                <div className="projects-detail-hero__label">Ghi chú phê duyệt</div>
                <div className="projects-detail-hero__value">{proposalDetailModal.item.reviewNote}</div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </>
  );
}
