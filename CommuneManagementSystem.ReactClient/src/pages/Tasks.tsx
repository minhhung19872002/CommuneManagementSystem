import React, { useEffect, useMemo, useState } from 'react';
import { Button, Card, Descriptions, Form, Input, Modal, Popconfirm, Progress, Select, Space, Table, Tabs, Tag, message } from 'antd';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { taskService } from '../services/taskService';
import './Tasks.css';
import { authService } from '../services/authService';
import { catalogService } from '../services/catalogService';
import { AppUser, CatalogItem, TaskItem, TaskKpiStats, WorkItem } from '../types';

type TaskFormValues = {
  title: string;
  description: string;
  priority: string;
  status: string;
  startDate: string;
  dueDate: string;
  progress: number;
  assignedUserId?: number;
};

type WorkFormValues = TaskFormValues & {
  fieldCode: string;
  unitCode: string;
};

const priorityOptions = ['Low', 'Medium', 'High'];
const taskStatusOptions = ['Pending', 'InProgress', 'Completed'];

export default function Tasks() {
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [works, setWorks] = useState<WorkItem[]>([]);
  const [kpi, setKpi] = useState<TaskKpiStats | null>(null);
  const [users, setUsers] = useState<AppUser[]>([]);
  const [fields, setFields] = useState<CatalogItem[]>([]);
  const [units, setUnits] = useState<CatalogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [taskFilter, setTaskFilter] = useState({ search: '', status: '', priority: '' });
  const [workFilter, setWorkFilter] = useState({ search: '', status: '', priority: '', fieldCode: '', unitCode: '' });
  const [taskModal, setTaskModal] = useState<{ open: boolean; item?: TaskItem }>({ open: false });
  const [workModal, setWorkModal] = useState<{ open: boolean; item?: WorkItem }>({ open: false });
  const [taskDetailModal, setTaskDetailModal] = useState<TaskItem | null>(null);
  const [workDetailModal, setWorkDetailModal] = useState<WorkItem | null>(null);
  const [taskForm] = Form.useForm<TaskFormValues>();
  const [workForm] = Form.useForm<WorkFormValues>();
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    void load();
  }, [taskFilter.search, taskFilter.status, taskFilter.priority, workFilter.search, workFilter.status, workFilter.priority, workFilter.fieldCode, workFilter.unitCode]);

  const load = async () => {
    setLoading(true);
    try {
      const [taskResponse, workResponse, kpiResponse, userResponse] = await Promise.all([
        taskService.getTasks({
          search: taskFilter.search || undefined,
          status: taskFilter.status || undefined,
          priority: taskFilter.priority || undefined,
        }),
        taskService.getWorks({
          search: workFilter.search || undefined,
          status: workFilter.status || undefined,
          priority: workFilter.priority || undefined,
          fieldCode: workFilter.fieldCode || undefined,
          unitCode: workFilter.unitCode || undefined,
        }),
        taskService.getKpiStats(),
        authService.getDirectory(),
      ]);

      setTasks(taskResponse.data);
      setWorks(workResponse.data);
      setKpi(kpiResponse.data);
      setUsers(userResponse.data);

      // Load catalogs separately (may fail with 403 for non-admin users)
      try {
        const [fieldResponse, unitResponse] = await Promise.all([
          catalogService.getAll('Field'),
          catalogService.getAll('Unit'),
        ]);
        setFields(fieldResponse.data);
        setUnits(unitResponse.data);
      } catch {
        // Non-admin users may not have catalog access — silently ignore
      }
    } catch {
      messageApi.error('Không thể tải trung tâm nhiệm vụ.');
    } finally {
      setLoading(false);
    }
  };

  const userOptions = useMemo(
    () => users.map((user) => ({ label: `${user.fullName} (@${user.username})`, value: user.id })),
    [users],
  );

  const taskColumns: ColumnsType<TaskItem> = [
    { title: 'Nhiệm vụ', dataIndex: 'title', key: 'title', render: (value: string, record) => <div><strong>{value}</strong><div style={{ color: '#667085' }}>{record.description}</div></div> },
    { title: 'Phụ trách', dataIndex: 'assignedUserName', key: 'assignedUserName', width: 180, render: (value) => value || 'Chưa gán' },
    { title: 'Tiến độ', dataIndex: 'progress', key: 'progress', width: 170, render: (value: number) => <Progress percent={value} size="small" /> },
    { title: 'Trạng thái', dataIndex: 'status', key: 'status', width: 140, render: (value: string) => <Tag color={value === 'Completed' ? 'success' : value === 'InProgress' ? 'processing' : 'default'}>{value}</Tag> },
    { title: 'Tác vụ', key: 'actions', width: 170, render: (_, record) => <Space><Button size="small" icon={<EditOutlined />} onClick={() => openTaskModal(record)}>Sửa</Button><Popconfirm title="Xóa nhiệm vụ này?" onConfirm={() => void handleDeleteTask(record.id)} okText="Xóa"><Button size="small" danger icon={<DeleteOutlined />}>Xóa</Button></Popconfirm></Space> },
  ];

  const workColumns: ColumnsType<WorkItem> = [
    { title: 'Công việc', dataIndex: 'title', key: 'title', render: (value: string, record) => <div><strong>{value}</strong><div style={{ color: '#667085' }}>{record.description}</div></div> },
    { title: 'Lĩnh vực', dataIndex: 'fieldCode', key: 'fieldCode', width: 120, render: (value: string) => <Tag color="blue">{value}</Tag> },
    { title: 'Đơn vị', dataIndex: 'unitCode', key: 'unitCode', width: 120, render: (value: string) => <Tag color="purple">{value}</Tag> },
    { title: 'Tiến độ', dataIndex: 'progress', key: 'progress', width: 170, render: (value: number) => <Progress percent={value} size="small" /> },
    { title: 'Trạng thái', dataIndex: 'status', key: 'status', width: 140, render: (value: string) => <Tag color={value === 'Completed' ? 'success' : value === 'InProgress' ? 'processing' : 'default'}>{value}</Tag> },
    { title: 'Tác vụ', key: 'actions', width: 170, render: (_, record) => <Space><Button size="small" icon={<EditOutlined />} onClick={() => openWorkModal(record)}>Sửa</Button><Popconfirm title="Xóa công việc này?" onConfirm={() => void handleDeleteWork(record.id)} okText="Xóa"><Button size="small" danger icon={<DeleteOutlined />}>Xóa</Button></Popconfirm></Space> },
  ];

  const openTaskModal = (item?: TaskItem) => {
    taskForm.resetFields();
    if (item) {
      taskForm.setFieldsValue({ ...item, startDate: item.startDate.slice(0, 10), dueDate: item.dueDate.slice(0, 10), assignedUserId: item.assignedUserId ?? undefined });
    } else {
      taskForm.setFieldsValue({ priority: 'Medium', status: 'Pending', progress: 0, startDate: new Date().toISOString().slice(0, 10), dueDate: new Date().toISOString().slice(0, 10) });
    }
    setTaskModal({ open: true, item });
  };

  const openWorkModal = (item?: WorkItem) => {
    workForm.resetFields();
    if (item) {
      workForm.setFieldsValue({ ...item, startDate: item.startDate.slice(0, 10), dueDate: item.dueDate.slice(0, 10), assignedUserId: item.assignedUserId ?? undefined });
    } else {
      workForm.setFieldsValue({ priority: 'Medium', status: 'Pending', progress: 0, startDate: new Date().toISOString().slice(0, 10), dueDate: new Date().toISOString().slice(0, 10) });
    }
    setWorkModal({ open: true, item });
  };

  const handleSaveTask = async () => {
    try {
      const values = await taskForm.validateFields();
      if (taskModal.item) await taskService.updateTask(taskModal.item.id, values);
      else await taskService.createTask(values);
      messageApi.success('Đã lưu nhiệm vụ.');
      setTaskModal({ open: false });
      void load();
    } catch (error: any) {
      if (!error?.errorFields) messageApi.error(error?.response?.data?.message || 'Không thể lưu nhiệm vụ.');
    }
  };

  const handleSaveWork = async () => {
    try {
      const values = await workForm.validateFields();
      if (workModal.item) await taskService.updateWork(workModal.item.id, values);
      else await taskService.createWork(values);
      messageApi.success('Đã lưu công việc.');
      setWorkModal({ open: false });
      void load();
    } catch (error: any) {
      if (!error?.errorFields) messageApi.error(error?.response?.data?.message || 'Không thể lưu công việc.');
    }
  };

  const handleDeleteTask = async (id: number) => {
    await taskService.deleteTask(id);
    messageApi.success('Đã xóa nhiệm vụ.');
    void load();
  };

  const handleDeleteWork = async (id: number) => {
    await taskService.deleteWork(id);
    messageApi.success('Đã xóa công việc.');
    void load();
  };

  return (
    <>
      {contextHolder}
      <div className="civic-page page-wrapper">
        <div className="civic-page-hero">
          <div className="civic-page-hero__inner">
            <div className="civic-page-hero__left">
              <div className="civic-page-hero__eyebrow">Điều hành / Nhiệm vụ</div>
              <h1 className="civic-page-hero__title">Nhiệm vụ &amp; Công việc</h1>
              <p className="civic-page-hero__subtitle">
                Theo dõi tiến độ nhiệm vụ, công việc và chỉ số KPI của đội ngũ cán bộ.
              </p>
            </div>
            <div className="civic-page-hero__stats">
              <div className="civic-page-hero__stat">
                <div className="civic-page-hero__stat-value">{kpi?.totalTasks ?? 0}</div>
                <div className="civic-page-hero__stat-label">Nhiệm vụ</div>
              </div>
              <div className="civic-page-hero__stat">
                <div className="civic-page-hero__stat-value">{kpi?.totalWorks ?? 0}</div>
                <div className="civic-page-hero__stat-label">Công việc</div>
              </div>
              <div className="civic-page-hero__stat">
                <div className="civic-page-hero__stat-value">{kpi?.overallKpiScore ?? 0}%</div>
                <div className="civic-page-hero__stat-label">KPI</div>
              </div>
            </div>
          </div>
        </div>

        <Card className="civic-section" styles={{ body: { padding: '0 0 4px' } }}>
          <Tabs
            items={[
              {
                key: 'tasks',
                label: 'Nhiệm vụ',
                children: (
                  <>
                    <div className="civic-toolbar" style={{ borderRadius: 0, borderLeft: 'none', borderRight: 'none', borderTop: 'none', margin: 0 }}>
                      <div className="civic-toolbar__filters">
                        <Input placeholder="Tìm nhiệm vụ" value={taskFilter.search} onChange={(e) => setTaskFilter((c) => ({ ...c, search: e.target.value }))} allowClear style={{ width: 240 }} />
                        <Select placeholder="Trạng thái" value={taskFilter.status || undefined} onChange={(value) => setTaskFilter((c) => ({ ...c, status: value || '' }))} allowClear style={{ width: 140 }} options={taskStatusOptions.map((value) => ({ label: value, value }))} />
                        <Select placeholder="Ưu tiên" value={taskFilter.priority || undefined} onChange={(value) => setTaskFilter((c) => ({ ...c, priority: value || '' }))} allowClear style={{ width: 140 }} options={priorityOptions.map((value) => ({ label: value, value }))} />
                      </div>
                      <div className="civic-toolbar__actions">
                        <Button type="primary" icon={<PlusOutlined />} onClick={() => openTaskModal()}>Thêm nhiệm vụ</Button>
                      </div>
                    </div>
                    <div className="civic-table-wrapper" style={{ padding: '0 16px 16px' }}>
                      <Table rowKey="id" loading={loading} dataSource={tasks} columns={taskColumns} pagination={{ pageSize: 8 }} scroll={{ x: 960 }} onRow={(record) => ({ onDoubleClick: () => setTaskDetailModal(record) })} />
                    </div>
                  </>
                ),
              },
              {
                key: 'works',
                label: 'Công việc',
                children: (
                  <>
                    <div className="civic-toolbar" style={{ borderRadius: 0, borderLeft: 'none', borderRight: 'none', borderTop: 'none', margin: 0 }}>
                      <div className="civic-toolbar__filters">
                        <Input placeholder="Tìm công việc" value={workFilter.search} onChange={(e) => setWorkFilter((c) => ({ ...c, search: e.target.value }))} allowClear style={{ width: 220 }} />
                        <Select placeholder="Trạng thái" value={workFilter.status || undefined} onChange={(value) => setWorkFilter((c) => ({ ...c, status: value || '' }))} allowClear style={{ width: 140 }} options={taskStatusOptions.map((value) => ({ label: value, value }))} />
                        <Select placeholder="Ưu tiên" value={workFilter.priority || undefined} onChange={(value) => setWorkFilter((c) => ({ ...c, priority: value || '' }))} allowClear style={{ width: 140 }} options={priorityOptions.map((value) => ({ label: value, value }))} />
                        <Select placeholder="Lĩnh vực" value={workFilter.fieldCode || undefined} onChange={(value) => setWorkFilter((c) => ({ ...c, fieldCode: value || '' }))} allowClear style={{ width: 140 }} options={fields.map((item) => ({ label: item.name, value: item.code }))} />
                        <Select placeholder="Đơn vị" value={workFilter.unitCode || undefined} onChange={(value) => setWorkFilter((c) => ({ ...c, unitCode: value || '' }))} allowClear style={{ width: 140 }} options={units.map((item) => ({ label: item.name, value: item.code }))} />
                      </div>
                      <div className="civic-toolbar__actions">
                        <Button type="primary" icon={<PlusOutlined />} onClick={() => openWorkModal()}>Thêm công việc</Button>
                      </div>
                    </div>
                    <div className="civic-table-wrapper" style={{ padding: '0 16px 16px' }}>
                      <Table rowKey="id" loading={loading} dataSource={works} columns={workColumns} pagination={{ pageSize: 8 }} scroll={{ x: 1100 }} onRow={(record) => ({ onDoubleClick: () => setWorkDetailModal(record) })} />
                    </div>
                  </>
                ),
              },
              {
                key: 'kpi',
                label: 'KPI',
                children: (
                  <div style={{ padding: '16px 20px' }}>
                    <div className="tasks-kpi-grid">
                      {[
                        { label: 'Tỉ lệ hoàn thành nhiệm vụ', value: `${kpi?.taskCompletionRate ?? 0}%`, colorClass: 'tasks-kpi-grid-card--blue' },
                        { label: 'Tỉ lệ hoàn thành công việc', value: `${kpi?.workCompletionRate ?? 0}%`, colorClass: 'tasks-kpi-grid-card--purple' },
                        { label: 'Nhiệm vụ quá hạn', value: `${kpi?.overdueTasks ?? 0}`, colorClass: 'tasks-kpi-grid-card--red' },
                        { label: 'Công việc quá hạn', value: `${kpi?.overdueWorks ?? 0}`, colorClass: 'tasks-kpi-grid-card--amber' },
                      ].map((card) => (
                        <div key={card.label} className={`tasks-kpi-grid-card ${card.colorClass}`}>
                          <div className="tasks-kpi-grid-card__value">{card.value}</div>
                          <div className="tasks-kpi-grid-card__label">{card.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ),
              },
            ]}
          />
        </Card>
      </div>

      <Modal title={taskModal.item ? 'Cập nhật nhiệm vụ' : 'Thêm nhiệm vụ'} open={taskModal.open} onCancel={() => setTaskModal({ open: false })} onOk={() => void handleSaveTask()} okText="Lưu">
        <Form form={taskForm} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="title" label="Tiêu đề" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="description" label="Mô tả" rules={[{ required: true }]}><Input.TextArea rows={4} /></Form.Item>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 12 }}>
            <Form.Item name="priority" label="Ưu tiên" rules={[{ required: true }]}><Select options={priorityOptions.map((value) => ({ label: value, value }))} /></Form.Item>
            <Form.Item name="status" label="Trạng thái" rules={[{ required: true }]}><Select options={taskStatusOptions.map((value) => ({ label: value, value }))} /></Form.Item>
            <Form.Item name="startDate" label="Ngày bắt đầu" rules={[{ required: true }]}><Input type="date" /></Form.Item>
            <Form.Item name="dueDate" label="Hạn xử lý" rules={[{ required: true }]}><Input type="date" /></Form.Item>
            <Form.Item name="progress" label="Tiến độ" rules={[{ required: true }]}><Input type="number" min={0} max={100} /></Form.Item>
            <Form.Item name="assignedUserId" label="Phụ trách"><Select allowClear options={userOptions} /></Form.Item>
          </div>
        </Form>
      </Modal>

      <Modal title={workModal.item ? 'Cập nhật công việc' : 'Thêm công việc'} open={workModal.open} onCancel={() => setWorkModal({ open: false })} onOk={() => void handleSaveWork()} okText="Lưu" width={760}>
        <Form form={workForm} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="title" label="Tiêu đề" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="description" label="Mô tả" rules={[{ required: true }]}><Input.TextArea rows={4} /></Form.Item>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 12 }}>
            <Form.Item name="fieldCode" label="Lĩnh vực" rules={[{ required: true }]}><Select options={fields.map((item) => ({ label: item.name, value: item.code }))} /></Form.Item>
            <Form.Item name="unitCode" label="Đơn vị" rules={[{ required: true }]}><Select options={units.map((item) => ({ label: item.name, value: item.code }))} /></Form.Item>
            <Form.Item name="assignedUserId" label="Phụ trách"><Select allowClear options={userOptions} /></Form.Item>
            <Form.Item name="priority" label="Ưu tiên" rules={[{ required: true }]}><Select options={priorityOptions.map((value) => ({ label: value, value }))} /></Form.Item>
            <Form.Item name="status" label="Trạng thái" rules={[{ required: true }]}><Select options={taskStatusOptions.map((value) => ({ label: value, value }))} /></Form.Item>
            <Form.Item name="progress" label="Tiến độ" rules={[{ required: true }]}><Input type="number" min={0} max={100} /></Form.Item>
            <Form.Item name="startDate" label="Ngày bắt đầu" rules={[{ required: true }]}><Input type="date" /></Form.Item>
            <Form.Item name="dueDate" label="Hạn xử lý" rules={[{ required: true }]}><Input type="date" /></Form.Item>
          </div>
        </Form>
      </Modal>

      <Modal
        title="Chi tiết nhiệm vụ"
        open={!!taskDetailModal}
        onCancel={() => setTaskDetailModal(null)}
        footer={[
          <Button key="close" onClick={() => setTaskDetailModal(null)}>Đóng</Button>,
          <Button key="edit" type="primary" icon={<EditOutlined />} onClick={() => { if (taskDetailModal) openTaskModal(taskDetailModal); setTaskDetailModal(null); }}>Chỉnh sửa</Button>,
        ]}
      >
        {taskDetailModal && (
          <Descriptions column={1} style={{ marginTop: 16 }} bordered>
            <Descriptions.Item label="Tiêu đề"><strong>{taskDetailModal.title}</strong></Descriptions.Item>
            <Descriptions.Item label="Mô tả">{taskDetailModal.description}</Descriptions.Item>
            <Descriptions.Item label="Ưu tiên"><Tag color={taskDetailModal.priority === 'High' ? 'error' : taskDetailModal.priority === 'Medium' ? 'warning' : 'default'}>{taskDetailModal.priority}</Tag></Descriptions.Item>
            <Descriptions.Item label="Trạng thái"><Tag color={taskDetailModal.status === 'Completed' ? 'success' : taskDetailModal.status === 'InProgress' ? 'processing' : 'default'}>{taskDetailModal.status}</Tag></Descriptions.Item>
            <Descriptions.Item label="Tiến độ"><Progress percent={taskDetailModal.progress} /></Descriptions.Item>
            <Descriptions.Item label="Ngày bắt đầu">{new Date(taskDetailModal.startDate).toLocaleDateString('vi-VN')}</Descriptions.Item>
            <Descriptions.Item label="Hạn xử lý">{new Date(taskDetailModal.dueDate).toLocaleDateString('vi-VN')}</Descriptions.Item>
            <Descriptions.Item label="Phụ trách">{taskDetailModal.assignedUserName || 'Chưa gán'}</Descriptions.Item>
            <Descriptions.Item label="Người tạo">{taskDetailModal.createdByName}</Descriptions.Item>
            <Descriptions.Item label="Ngày tạo">{new Date(taskDetailModal.createdAt).toLocaleString('vi-VN')}</Descriptions.Item>
          </Descriptions>
        )}
      </Modal>

      <Modal
        title="Chi tiết công việc"
        open={!!workDetailModal}
        onCancel={() => setWorkDetailModal(null)}
        footer={[
          <Button key="close" onClick={() => setWorkDetailModal(null)}>Đóng</Button>,
          <Button key="edit" type="primary" icon={<EditOutlined />} onClick={() => { if (workDetailModal) openWorkModal(workDetailModal); setWorkDetailModal(null); }}>Chỉnh sửa</Button>,
        ]}
      >
        {workDetailModal && (
          <Descriptions column={1} style={{ marginTop: 16 }} bordered>
            <Descriptions.Item label="Tiêu đề"><strong>{workDetailModal.title}</strong></Descriptions.Item>
            <Descriptions.Item label="Mô tả">{workDetailModal.description}</Descriptions.Item>
            <Descriptions.Item label="Lĩnh vực"><Tag color="blue">{workDetailModal.fieldCode}</Tag></Descriptions.Item>
            <Descriptions.Item label="Đơn vị"><Tag color="purple">{workDetailModal.unitCode}</Tag></Descriptions.Item>
            <Descriptions.Item label="Ưu tiên"><Tag color={workDetailModal.priority === 'High' ? 'error' : workDetailModal.priority === 'Medium' ? 'warning' : 'default'}>{workDetailModal.priority}</Tag></Descriptions.Item>
            <Descriptions.Item label="Trạng thái"><Tag color={workDetailModal.status === 'Completed' ? 'success' : workDetailModal.status === 'InProgress' ? 'processing' : 'default'}>{workDetailModal.status}</Tag></Descriptions.Item>
            <Descriptions.Item label="Tiến độ"><Progress percent={workDetailModal.progress} /></Descriptions.Item>
            <Descriptions.Item label="Ngày bắt đầu">{new Date(workDetailModal.startDate).toLocaleDateString('vi-VN')}</Descriptions.Item>
            <Descriptions.Item label="Hạn xử lý">{new Date(workDetailModal.dueDate).toLocaleDateString('vi-VN')}</Descriptions.Item>
            <Descriptions.Item label="Phụ trách">{workDetailModal.assignedUserName || 'Chưa gán'}</Descriptions.Item>
            <Descriptions.Item label="Người tạo">{workDetailModal.createdByName}</Descriptions.Item>
            <Descriptions.Item label="Ngày tạo">{new Date(workDetailModal.createdAt).toLocaleString('vi-VN')}</Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </>
  );
}