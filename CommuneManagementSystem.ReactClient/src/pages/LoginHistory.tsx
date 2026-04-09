import React, { useEffect, useState } from 'react';
import { Button, Card, Input, Select, Space, Table, Tag, message } from 'antd';
import { ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { authService } from '../services/authService';
import { SystemLog } from '../types';
import { useAuth } from '../context/AuthContext';

export default function LoginHistory() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'Admin';
  const [items, setItems] = useState<SystemLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    void load();
  }, [showAll]);

  const load = async () => {
    setLoading(true);
    try {
      const response = await authService.getLoginHistory({ top: 200, all: isAdmin ? showAll : undefined });
      setItems(response.data);
    } catch {
      messageApi.error('Không thể tải lịch sử đăng nhập.');
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = items.filter((item) => {
    const normalizedSearch = search.trim().toLowerCase();
    const matchesSearch =
      !normalizedSearch ||
      item.username.toLowerCase().includes(normalizedSearch) ||
      item.detail?.toLowerCase().includes(normalizedSearch);
    const matchesStatus =
      !statusFilter ||
      (statusFilter === 'Success' && item.action === 'Đăng nhập') ||
      (statusFilter === 'Failed' && item.action === 'Đăng nhập thất bại');

    return matchesSearch && matchesStatus;
  });

  const columns: ColumnsType<SystemLog> = [
    {
      title: 'Thời gian',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 190,
      render: (value: string) => new Date(value).toLocaleString('vi-VN'),
    },
    {
      title: 'Tài khoản',
      dataIndex: 'username',
      key: 'username',
      width: 180,
      render: (value: string) => <strong>{value}</strong>,
    },
    {
      title: 'Kết quả',
      dataIndex: 'action',
      key: 'action',
      width: 140,
      render: (value: string) => (
        <Tag color={value === 'Đăng nhập' ? 'success' : 'error'}>
          {value === 'Đăng nhập' ? 'Thành công' : 'Thất bại'}
        </Tag>
      ),
    },
    {
      title: 'Chi tiết',
      dataIndex: 'detail',
      key: 'detail',
    },
    {
      title: 'IP',
      dataIndex: 'ipAddress',
      key: 'ipAddress',
      width: 150,
      render: (value: string) => <span style={{ fontFamily: 'monospace' }}>{value}</span>,
    },
  ];

  return (
    <>
      {contextHolder}

      <div style={{ padding: '24px 24px 0' }}>
        <Card
          style={{ borderRadius: 20 }}
          title="Lịch sử đăng nhập"
          extra={
            <Button icon={<ReloadOutlined />} onClick={() => void load()}>
              Tải lại
            </Button>
          }
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', marginBottom: 16 }}>
            <Space wrap>
              <Input
                prefix={<SearchOutlined />}
                placeholder="Tìm tài khoản hoặc chi tiết"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                allowClear
                style={{ width: 260 }}
              />
              <Select
                placeholder="Kết quả"
                value={statusFilter || undefined}
                onChange={(value) => setStatusFilter(value || '')}
                allowClear
                style={{ width: 160 }}
                options={[
                  { label: 'Thành công', value: 'Success' },
                  { label: 'Thất bại', value: 'Failed' },
                ]}
              />
            </Space>

            {isAdmin && (
              <Select
                value={showAll ? 'all' : 'mine'}
                onChange={(value) => setShowAll(value === 'all')}
                style={{ width: 200 }}
                options={[
                  { label: 'Chỉ xem của tôi', value: 'mine' },
                  { label: 'Xem toàn hệ thống', value: 'all' },
                ]}
              />
            )}
          </div>

          <Table
            rowKey="id"
            loading={loading}
            dataSource={filteredItems}
            columns={columns}
            pagination={{ pageSize: 10 }}
            scroll={{ x: 900 }}
          />
        </Card>
      </div>
    </>
  );
}