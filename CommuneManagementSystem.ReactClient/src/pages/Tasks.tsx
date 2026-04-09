import React, { useEffect, useMemo, useState } from 'react';
import { Button, Card, Form, Input, Modal, Popconfirm, Progress, Select, Space, Table, Tabs, Tag, message } from 'antd';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { taskService } from '../services/taskService';
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
      <div style={{ padding: '24px 24px 0' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 20 }}>
          {[
            { label: 'Tổng nhiệm vụ', value: kpi?.totalTasks ?? 0, color: '#034AA0' },
            { label: 'Tổng công việc', value: kpi?.totalWorks ?? 0, color: '#7C3AED' },
            { label: 'KPI tổng hợp', value: `${kpi?.overallKpiScore ?? 0}%`, color: '#059669' },
          ].map((card) => <Card key={card.label} style={{ borderRadius: 18 }}><div style={{ color: '#667085' }}>{card.label}</div><div style={{ fontSize: 30, fontWeight: 800, color: card.color }}>{card.value}</div></Card>)}
        </div>

        <Card style={{ borderRadius: 20 }}>
          <Tabs
            items={[
              {
                key: 'tasks',
                label: 'Nhiệm vụ',
                children: (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', marginBottom: 16 }}>
                      <Space wrap>
                        <Input placeholder="Tìm nhiệm vụ" value={taskFilter.search} onChange={(e) => setTaskFilter((c) => ({ ...c, search: e.target.value }))} allowClear style={{ width: 240 }} />
                        <Select placeholder="Trạng thái" value={taskFilter.status || undefined} onChange={(value) => setTaskFilter((c) => ({ ...c, status: value || '' }))} allowClear style={{ width: 150 }} options={taskStatusOptions.map((value) => ({ label: value, value }))} />
                        <Select placeholder="Ưu tiên" value={taskFilter.priority || undefined} onChange={(value) => setTaskFilter((c) => ({ ...c, priority: value || '' }))} allowClear style={{ width: 150 }} options={priorityOptions.map((value) => ({ label: value, value }))} />
                      </Space>
                      <Button type="primary" icon={<PlusOutlined />} onClick={() => openTaskModal()}>Thêm nhiệm vụ</Button>
                    </div>
                    <Table rowKey="id" loading={loading} dataSource={tasks} columns={taskColumns} pagination={{ pageSize: 8 }} scroll={{ x: 960 }} />
                  </>
                ),
              },
              {
                key: 'works',
                label: 'Công việc',
                children: (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', marginBottom: 16 }}>
                      <Space wrap>
                        <Input placeholder="Tìm công việc" value={workFilter.search} onChange={(e) => setWorkFilter((c) => ({ ...c, search: e.target.value }))} allowClear style={{ width: 220 }} />
                        <Select placeholder="Trạng thái" value={workFilter.status || undefined} onChange={(value) => setWorkFilter((c) => ({ ...c, status: value || '' }))} allowClear style={{ width: 140 }} options={taskStatusOptions.map((value) => ({ label: value, value }))} />
                        <Select placeholder="Ưu tiên" value={workFilter.priority || undefined} onChange={(value) => setWorkFilter((c) => ({ ...c, priority: value || '' }))} allowClear style={{ width: 140 }} options={priorityOptions.map((value) => ({ label: value, value }))} />
                        <Select placeholder="Lĩnh vực" value={workFilter.fieldCode || undefined} onChange={(value) => setWorkFilter((c) => ({ ...c, fieldCode: value || '' }))} allowClear style={{ width: 140 }} options={fields.map((item) => ({ label: item.name, value: item.code }))} />
                        <Select placeholder="Đơn vị" value={workFilter.unitCode || undefined} onChange={(value) => setWorkFilter((c) => ({ ...c, unitCode: value || '' }))} allowClear style={{ width: 140 }} options={units.map((item) => ({ label: item.name, value: item.code }))} />
                      </Space>
                      <Button type="primary" icon={<PlusOutlined />} onClick={() => openWorkModal()}>Thêm công việc</Button>
                    </div>
                    <Table rowKey="id" loading={loading} dataSource={works} columns={workColumns} pagination={{ pageSize: 8 }} scroll={{ x: 1100 }} />
                  </>
                ),
              },
              {
                key: 'kpi',
                label: 'KPI',
                children: (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
                    {[
                      { label: 'Tỉ lệ hoàn thành nhiệm vụ', value: kpi?.taskCompletionRate ?? 0, color: '#034AA0' },
                      { label: 'Tỉ lệ hoàn thành công việc', value: kpi?.workCompletionRate ?? 0, color: '#7C3AED' },
                      { label: 'Nhiệm vụ quá hạn', value: kpi?.overdueTasks ?? 0, color: '#DC2626', suffix: '' },
                      { label: 'Công việc quá hạn', value: kpi?.overdueWorks ?? 0, color: '#D97706', suffix: '' },
                    ].map((card) => (
                      <Card key={card.label} style={{ borderRadius: 18 }}>
                        <div style={{ color: '#667085', marginBottom: 8 }}>{card.label}</div>
                        <div style={{ fontSize: 30, fontWeight: 800, color: card.color }}>{card.value}{card.suffix ?? '%'}</div>
                      </Card>
                    ))}
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
    </>
  );
}