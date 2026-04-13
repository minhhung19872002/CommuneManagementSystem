import React, { useEffect, useState } from 'react';
import {
  CalendarOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import {
  Button,
  Card,
  Descriptions,
  Form,
  Input,
  Modal,
  Popconfirm,
  Progress,
  Select,
  Space,
  Table,
  Tabs,
  Tag,
  message,
} from 'antd';
import './Meetings.css';
import type { ColumnsType } from 'antd/es/table';
import { meetingService } from '../services/meetingService';
import { userService } from '../services/userService';
import { AppUser, MeetingEvent, WorkScheduleEntry } from '../types';

type MeetingFormValues = {
  title: string;
  agenda: string;
  location: string;
  startsAt: string;
  endsAt: string;
  status?: string;
};

type RegisterFormValues = {
  note?: string;
};

type ScheduleFormValues = {
  title: string;
  content: string;
  workDate: string;
  session: string;
  assignedUserId?: number;
};

const meetingStatusConfig: Record<string, { label: string; color: string }> = {
  Scheduled: { label: 'Đã lên lịch', color: 'processing' },
  Ongoing: { label: 'Đang diễn ra', color: 'success' },
  Completed: { label: 'Đã xong', color: 'default' },
  Cancelled: { label: 'Đã hủy', color: 'error' },
};

const sessionConfig: Record<string, string> = {
  Sang: 'Sáng',
  Chieu: 'Chiều',
  Toi: 'Tối',
};

export default function Meetings() {
  const [meetings, setMeetings] = useState<MeetingEvent[]>([]);
  const [schedules, setSchedules] = useState<WorkScheduleEntry[]>([]);
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loadingMeetings, setLoadingMeetings] = useState(true);
  const [loadingSchedules, setLoadingSchedules] = useState(true);
  const [meetingFilters, setMeetingFilters] = useState({ search: '', status: '' });
  const [scheduleFilters, setScheduleFilters] = useState({ search: '', fromDate: '', toDate: '' });
  const [meetingEditor, setMeetingEditor] = useState<{ open: boolean; mode: 'create' | 'edit'; item?: MeetingEvent }>({
    open: false,
    mode: 'create',
  });
  const [registerModal, setRegisterModal] = useState<{ open: boolean; item?: MeetingEvent }>({ open: false });
  const [scheduleEditor, setScheduleEditor] = useState<{ open: boolean; mode: 'create' | 'edit'; item?: WorkScheduleEntry }>({
    open: false,
    mode: 'create',
  });
  const [meetingDetailModal, setMeetingDetailModal] = useState<MeetingEvent | null>(null);
  const [scheduleDetailModal, setScheduleDetailModal] = useState<WorkScheduleEntry | null>(null);
  const [meetingForm] = Form.useForm<MeetingFormValues>();
  const [registerForm] = Form.useForm<RegisterFormValues>();
  const [scheduleForm] = Form.useForm<ScheduleFormValues>();
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    void loadMeetings();
  }, [meetingFilters.search, meetingFilters.status]);

  useEffect(() => {
    void loadSchedules();
  }, [scheduleFilters.search, scheduleFilters.fromDate, scheduleFilters.toDate]);

  useEffect(() => {
    userService.getAll().then((response) => setUsers(response.data)).catch(() => undefined);
  }, []);

  const loadMeetings = async () => {
    setLoadingMeetings(true);
    try {
      const response = await meetingService.getMeetings({
        search: meetingFilters.search || undefined,
        status: meetingFilters.status || undefined,
      });
      setMeetings(response.data);
    } catch {
      messageApi.error('Không thể tải danh sách lịch họp.');
    } finally {
      setLoadingMeetings(false);
    }
  };

  const loadSchedules = async () => {
    setLoadingSchedules(true);
    try {
      const response = await meetingService.getSchedules({
        search: scheduleFilters.search || undefined,
        fromDate: scheduleFilters.fromDate || undefined,
        toDate: scheduleFilters.toDate || undefined,
      });
      setSchedules(response.data);
    } catch {
      messageApi.error('Không thể tải lịch làm việc.');
    } finally {
      setLoadingSchedules(false);
    }
  };

  const openMeetingCreate = () => {
    meetingForm.resetFields();
    setMeetingEditor({ open: true, mode: 'create' });
  };

  const openMeetingEdit = (item: MeetingEvent) => {
    meetingForm.setFieldsValue({
      title: item.title,
      agenda: item.agenda,
      location: item.location,
      startsAt: item.startsAt.slice(0, 16),
      endsAt: item.endsAt.slice(0, 16),
      status: item.status,
    });
    setMeetingEditor({ open: true, mode: 'edit', item });
  };

  const openScheduleCreate = () => {
    scheduleForm.resetFields();
    setScheduleEditor({ open: true, mode: 'create' });
  };

  const openScheduleEdit = (item: WorkScheduleEntry) => {
    scheduleForm.setFieldsValue({
      title: item.title,
      content: item.content,
      workDate: item.workDate.slice(0, 10),
      session: item.session,
      assignedUserId: item.assignedUserId ?? undefined,
    });
    setScheduleEditor({ open: true, mode: 'edit', item });
  };

  const handleMeetingSave = async () => {
    try {
      const values = await meetingForm.validateFields();

      if (meetingEditor.mode === 'create') {
        await meetingService.createMeeting({
          title: values.title,
          agenda: values.agenda,
          location: values.location,
          startsAt: values.startsAt,
          endsAt: values.endsAt,
        });
        messageApi.success('Đã tạo lịch họp.');
      } else {
        await meetingService.updateMeeting(meetingEditor.item!.id, {
          title: values.title,
          agenda: values.agenda,
          location: values.location,
          startsAt: values.startsAt,
          endsAt: values.endsAt,
          status: values.status || 'Scheduled',
        });
        messageApi.success('Đã cập nhật lịch họp.');
      }

      setMeetingEditor({ open: false, mode: 'create' });
      meetingForm.resetFields();
      void loadMeetings();
    } catch (error: any) {
      if (error?.errorFields) {
        return;
      }
      messageApi.error(error?.response?.data?.message || 'Không thể lưu lịch họp.');
    }
  };

  const handleMeetingRegister = async () => {
    try {
      const values = await registerForm.validateFields();
      await meetingService.registerMeeting(registerModal.item!.id, values);
      messageApi.success('Đã đăng ký tham dự họp.');
      setRegisterModal({ open: false });
      registerForm.resetFields();
      void loadMeetings();
    } catch (error: any) {
      if (error?.errorFields) {
        return;
      }
      messageApi.error(error?.response?.data?.message || 'Không thể đăng ký lịch họp.');
    }
  };

  const handleMeetingDelete = async (id: number) => {
    try {
      await meetingService.deleteMeeting(id);
      messageApi.success('Đã xóa lịch họp.');
      void loadMeetings();
    } catch (error: any) {
      messageApi.error(error?.response?.data?.message || 'Không thể xóa lịch họp.');
    }
  };

  const handleScheduleSave = async () => {
    try {
      const values = await scheduleForm.validateFields();

      if (scheduleEditor.mode === 'create') {
        await meetingService.createSchedule(values);
        messageApi.success('Đã tạo lịch làm việc.');
      } else {
        await meetingService.updateSchedule(scheduleEditor.item!.id, values);
        messageApi.success('Đã cập nhật lịch làm việc.');
      }

      setScheduleEditor({ open: false, mode: 'create' });
      scheduleForm.resetFields();
      void loadSchedules();
    } catch (error: any) {
      if (error?.errorFields) {
        return;
      }
      messageApi.error(error?.response?.data?.message || 'Không thể lưu lịch làm việc.');
    }
  };

  const handleScheduleDelete = async (id: number) => {
    try {
      await meetingService.deleteSchedule(id);
      messageApi.success('Đã xóa lịch làm việc.');
      void loadSchedules();
    } catch (error: any) {
      messageApi.error(error?.response?.data?.message || 'Không thể xóa lịch làm việc.');
    }
  };

  const meetingColumns: ColumnsType<MeetingEvent> = [
    {
      title: 'Cuộc họp',
      key: 'title',
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 700 }}>{record.title}</div>
          <div style={{ color: '#667085', fontSize: 13, marginTop: 4 }}>{record.agenda}</div>
        </div>
      ),
    },
    {
      title: 'Thời gian',
      key: 'startsAt',
      width: 220,
      render: (_, record) => (
        <div>
          <div>{new Date(record.startsAt).toLocaleString('vi-VN')}</div>
          <div style={{ color: '#667085', fontSize: 12 }}>Đến {new Date(record.endsAt).toLocaleString('vi-VN')}</div>
        </div>
      ),
    },
    {
      title: 'Địa điểm',
      dataIndex: 'location',
      key: 'location',
      width: 180,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 140,
      render: (value: string) => {
        const config = meetingStatusConfig[value] ?? { label: value, color: 'default' };
        return <Tag color={config.color}>{config.label}</Tag>;
      },
    },
    {
      title: 'Đăng ký',
      key: 'registrationCount',
      width: 130,
      render: (_, record) => <Tag color={record.isRegistered ? 'success' : 'blue'}>{record.registrationCount} người</Tag>,
    },
    {
      title: 'Tác vụ',
      key: 'actions',
      width: 260,
      render: (_, record) => (
        <Space wrap>
          {!record.isRegistered && (
            <Button
              size="small"
              icon={<TeamOutlined />}
              onClick={() => {
                registerForm.resetFields();
                setRegisterModal({ open: true, item: record });
              }}
            >
              Đăng ký
            </Button>
          )}
          <Button size="small" icon={<EditOutlined />} onClick={() => openMeetingEdit(record)}>
            Sửa
          </Button>
          <Popconfirm title="Xóa lịch họp này?" onConfirm={() => void handleMeetingDelete(record.id)} okText="Xóa">
            <Button size="small" danger icon={<DeleteOutlined />}>
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const scheduleColumns: ColumnsType<WorkScheduleEntry> = [
    {
      title: 'Công việc',
      key: 'title',
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 700 }}>{record.title}</div>
          <div style={{ color: '#667085', fontSize: 13, marginTop: 4 }}>{record.content}</div>
        </div>
      ),
    },
    {
      title: 'Ngày',
      dataIndex: 'workDate',
      key: 'workDate',
      width: 150,
      render: (value: string) => new Date(value).toLocaleDateString('vi-VN'),
    },
    {
      title: 'Buổi',
      dataIndex: 'session',
      key: 'session',
      width: 120,
      render: (value: string) => <Tag color="purple">{sessionConfig[value] || value}</Tag>,
    },
    {
      title: 'Phân công',
      key: 'assignedUserName',
      width: 180,
      render: (_, record) => record.assignedUserName || 'Chưa gán',
    },
    {
      title: 'Tác vụ',
      key: 'actions',
      width: 180,
      render: (_, record) => (
        <Space wrap>
          <Button size="small" icon={<EditOutlined />} onClick={() => openScheduleEdit(record)}>
            Sửa
          </Button>
          <Popconfirm title="Xóa lịch làm việc này?" onConfirm={() => void handleScheduleDelete(record.id)} okText="Xóa">
            <Button size="small" danger icon={<DeleteOutlined />}>
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="civic-page page-wrapper">
      {contextHolder}

      <div className="civic-page-hero">
        <div className="civic-page-hero__inner">
          <div className="civic-page-hero__left">
            <div className="civic-page-hero__eyebrow">Quản lý / Lịch họp</div>
            <h1 className="civic-page-hero__title">Lịch họp &amp; Lịch làm việc</h1>
            <p className="civic-page-hero__subtitle">
              Quản lý cuộc họp, đăng ký tham dự, tạo lịch làm việc và phân công nhiệm vụ cho cán bộ.
            </p>
          </div>
          <div className="civic-page-hero__stats">
            <div className="civic-page-hero__stat">
              <div className="civic-page-hero__stat-value">{meetings.length}</div>
              <div className="civic-page-hero__stat-label">Lịch họp</div>
            </div>
            <div className="civic-page-hero__stat">
              <div className="civic-page-hero__stat-value">{meetings.filter((item) => !item.isRegistered).length}</div>
              <div className="civic-page-hero__stat-label">Cần đăng ký</div>
            </div>
            <div className="civic-page-hero__stat">
              <div className="civic-page-hero__stat-value">{schedules.length}</div>
              <div className="civic-page-hero__stat-label">Lịch làm việc</div>
            </div>
          </div>
        </div>
      </div>

      <Card className="civic-section" styles={{ body: { padding: '0 0 4px' } }}>
        <Tabs
          items={[
              {
                key: 'meetings',
                label: 'Lịch họp',
                children: (
                  <>
                    <div className="civic-toolbar" style={{ borderRadius: 0, borderLeft: 'none', borderRight: 'none', borderTop: 'none', margin: 0 }}>
                      <div className="civic-toolbar__filters">
                        <Input
                          placeholder="Tìm theo tên họp, địa điểm"
                          value={meetingFilters.search}
                          onChange={(event) => setMeetingFilters((current) => ({ ...current, search: event.target.value }))}
                          allowClear
                          style={{ width: 260 }}
                        />
                        <Select
                          placeholder="Trạng thái"
                          value={meetingFilters.status || undefined}
                          onChange={(value) => setMeetingFilters((current) => ({ ...current, status: value || '' }))}
                          allowClear
                          style={{ width: 180 }}
                          options={Object.entries(meetingStatusConfig).map(([value, config]) => ({
                            label: config.label,
                            value,
                          }))}
                        />
                      </div>
                      <div className="civic-toolbar__actions">
                        <Button type="primary" icon={<PlusOutlined />} onClick={openMeetingCreate}>
                          Tạo lịch họp
                        </Button>
                      </div>
                    </div>
                    <div className="civic-table-wrapper" style={{ padding: '0 16px 16px' }}>
                      <Table
                        rowKey="id"
                        loading={loadingMeetings}
                        dataSource={meetings}
                        columns={meetingColumns}
                        pagination={{ pageSize: 8 }}
                        scroll={{ x: 1100 }}
                        onRow={(record) => ({ onDoubleClick: () => setMeetingDetailModal(record) })}
                      />
                    </div>
                  </>
                ),
              },
              {
                key: 'schedules',
                label: 'Lịch làm việc',
                children: (
                  <>
                    <div className="civic-toolbar" style={{ borderRadius: 0, borderLeft: 'none', borderRight: 'none', borderTop: 'none', margin: 0 }}>
                      <div className="civic-toolbar__filters">
                        <Input
                          placeholder="Tìm nội dung công việc"
                          value={scheduleFilters.search}
                          onChange={(event) => setScheduleFilters((current) => ({ ...current, search: event.target.value }))}
                          allowClear
                          style={{ width: 240 }}
                        />
                        <Input
                          type="date"
                          value={scheduleFilters.fromDate}
                          onChange={(event) => setScheduleFilters((current) => ({ ...current, fromDate: event.target.value }))}
                          style={{ width: 170 }}
                        />
                        <Input
                          type="date"
                          value={scheduleFilters.toDate}
                          onChange={(event) => setScheduleFilters((current) => ({ ...current, toDate: event.target.value }))}
                          style={{ width: 170 }}
                        />
                      </div>
                      <div className="civic-toolbar__actions">
                        <Button type="primary" icon={<CalendarOutlined />} onClick={openScheduleCreate}>
                          Tạo lịch làm việc
                        </Button>
                      </div>
                    </div>
                    <div className="civic-table-wrapper" style={{ padding: '0 16px 16px' }}>
                      <Table
                        rowKey="id"
                        loading={loadingSchedules}
                        dataSource={schedules}
                        columns={scheduleColumns}
                        pagination={{ pageSize: 8 }}
                        scroll={{ x: 980 }}
                        onRow={(record) => ({ onDoubleClick: () => setScheduleDetailModal(record) })}
                      />
                    </div>
                  </>
                ),
              },
            ]}
          />
        </Card>

      <Modal
        title={meetingEditor.mode === 'create' ? 'Tạo lịch họp' : 'Cập nhật lịch họp'}
        open={meetingEditor.open}
        onCancel={() => {
          setMeetingEditor({ open: false, mode: 'create' });
          meetingForm.resetFields();
        }}
        onOk={() => void handleMeetingSave()}
        okText={meetingEditor.mode === 'create' ? 'Tạo mới' : 'Lưu thay đổi'}
        width={720}
      >
        <Form form={meetingForm} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="title" label="Tiêu đề" rules={[{ required: true, message: 'Nhập tiêu đề lịch họp.' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="agenda" label="Nội dung họp" rules={[{ required: true, message: 'Nhập nội dung họp.' }]}>
            <Input.TextArea rows={4} />
          </Form.Item>
          <div className="meetings-form-grid">
            <Form.Item name="location" label="Địa điểm" rules={[{ required: true, message: 'Nhập địa điểm họp.' }]}>
              <Input />
            </Form.Item>
            <Form.Item name="startsAt" label="Bắt đầu" rules={[{ required: true, message: 'Nhập giờ bắt đầu.' }]}>
              <Input type="datetime-local" />
            </Form.Item>
            <Form.Item name="endsAt" label="Kết thúc" rules={[{ required: true, message: 'Nhập giờ kết thúc.' }]}>
              <Input type="datetime-local" />
            </Form.Item>
            {meetingEditor.mode === 'edit' && (
              <Form.Item name="status" label="Trạng thái" rules={[{ required: true, message: 'Chọn trạng thái.' }]}>
                <Select
                  options={Object.entries(meetingStatusConfig).map(([value, config]) => ({
                    label: config.label,
                    value,
                  }))}
                />
              </Form.Item>
            )}
          </div>
        </Form>
      </Modal>

      <Modal
        title={`Đăng ký tham dự: ${registerModal.item?.title || ''}`}
        open={registerModal.open}
        onCancel={() => {
          setRegisterModal({ open: false });
          registerForm.resetFields();
        }}
        onOk={() => void handleMeetingRegister()}
        okText="Đăng ký"
      >
        <Form form={registerForm} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="note" label="Ghi chú">
            <Input.TextArea rows={4} placeholder="Ghi chú về vai trò tham dự hoặc công tác chuẩn bị" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={scheduleEditor.mode === 'create' ? 'Tạo lịch làm việc' : 'Cập nhật lịch làm việc'}
        open={scheduleEditor.open}
        onCancel={() => {
          setScheduleEditor({ open: false, mode: 'create' });
          scheduleForm.resetFields();
        }}
        onOk={() => void handleScheduleSave()}
        okText={scheduleEditor.mode === 'create' ? 'Tạo mới' : 'Lưu thay đổi'}
        width={720}
      >
        <Form form={scheduleForm} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="title" label="Tiêu đề" rules={[{ required: true, message: 'Nhập tiêu đề công việc.' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="content" label="Nội dung" rules={[{ required: true, message: 'Nhập nội dung công việc.' }]}>
            <Input.TextArea rows={4} />
          </Form.Item>
          <div className="meetings-form-grid">
            <Form.Item name="workDate" label="Ngày làm việc" rules={[{ required: true, message: 'Chọn ngày.' }]}>
              <Input type="date" />
            </Form.Item>
            <Form.Item name="session" label="Buổi" rules={[{ required: true, message: 'Chọn buổi.' }]}>
              <Select
                options={[
                  { label: 'Sáng', value: 'Sang' },
                  { label: 'Chiều', value: 'Chieu' },
                  { label: 'Tối', value: 'Toi' },
                ]}
              />
            </Form.Item>
            <Form.Item name="assignedUserId" label="Phân công">
              <Select
                allowClear
                placeholder="Không gán người phụ trách"
                options={users.map((user) => ({
                  label: `${user.fullName} (@${user.username})`,
                  value: user.id,
                }))}
              />
            </Form.Item>
          </div>
        </Form>
      </Modal>

      <Modal
        title="Chi tiết lịch họp"
        open={!!meetingDetailModal}
        onCancel={() => setMeetingDetailModal(null)}
        footer={[
          <Button key="close" onClick={() => setMeetingDetailModal(null)}>Đóng</Button>,
          <Button key="edit" type="primary" icon={<EditOutlined />} onClick={() => { if (meetingDetailModal) openMeetingEdit(meetingDetailModal); setMeetingDetailModal(null); }}>Sửa</Button>,
        ]}
      >
        {meetingDetailModal && (
          <Descriptions column={1} style={{ marginTop: 16 }} bordered>
            <Descriptions.Item label="Tiêu đề"><strong>{meetingDetailModal.title}</strong></Descriptions.Item>
            <Descriptions.Item label="Nội dung">{meetingDetailModal.agenda}</Descriptions.Item>
            <Descriptions.Item label="Địa điểm">{meetingDetailModal.location}</Descriptions.Item>
            <Descriptions.Item label="Bắt đầu">{new Date(meetingDetailModal.startsAt).toLocaleString('vi-VN')}</Descriptions.Item>
            <Descriptions.Item label="Kết thúc">{new Date(meetingDetailModal.endsAt).toLocaleString('vi-VN')}</Descriptions.Item>
            <Descriptions.Item label="Trạng thái"><Tag color={meetingStatusConfig[meetingDetailModal.status]?.color ?? 'default'}>{meetingStatusConfig[meetingDetailModal.status]?.label ?? meetingDetailModal.status}</Tag></Descriptions.Item>
            <Descriptions.Item label="Số người đăng ký">{meetingDetailModal.registrationCount}</Descriptions.Item>
            <Descriptions.Item label="Người tạo">{meetingDetailModal.createdByName}</Descriptions.Item>
            <Descriptions.Item label="Ngày tạo">{new Date(meetingDetailModal.createdAt).toLocaleString('vi-VN')}</Descriptions.Item>
          </Descriptions>
        )}
      </Modal>

      <Modal
        title="Chi tiết lịch làm việc"
        open={!!scheduleDetailModal}
        onCancel={() => setScheduleDetailModal(null)}
        footer={[
          <Button key="close" onClick={() => setScheduleDetailModal(null)}>Đóng</Button>,
          <Button key="edit" type="primary" icon={<EditOutlined />} onClick={() => { if (scheduleDetailModal) openScheduleEdit(scheduleDetailModal); setScheduleDetailModal(null); }}>Sửa</Button>,
        ]}
      >
        {scheduleDetailModal && (
          <Descriptions column={1} style={{ marginTop: 16 }} bordered>
            <Descriptions.Item label="Tiêu đề"><strong>{scheduleDetailModal.title}</strong></Descriptions.Item>
            <Descriptions.Item label="Nội dung">{scheduleDetailModal.content}</Descriptions.Item>
            <Descriptions.Item label="Ngày làm">{new Date(scheduleDetailModal.workDate).toLocaleDateString('vi-VN')}</Descriptions.Item>
            <Descriptions.Item label="Buổi"><Tag color="purple">{sessionConfig[scheduleDetailModal.session] || scheduleDetailModal.session}</Tag></Descriptions.Item>
            <Descriptions.Item label="Phân công">{scheduleDetailModal.assignedUserName || 'Chưa gán'}</Descriptions.Item>
            <Descriptions.Item label="Người tạo">{scheduleDetailModal.createdByName}</Descriptions.Item>
            <Descriptions.Item label="Ngày tạo">{new Date(scheduleDetailModal.createdAt).toLocaleString('vi-VN')}</Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
}
