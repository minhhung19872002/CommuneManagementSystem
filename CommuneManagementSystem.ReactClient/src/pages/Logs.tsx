import React, { useEffect, useState, useCallback } from 'react';
import { Table, Button, Input, Select, Tag, message } from 'antd';
import { ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { userService } from '../services/userService';
import { SystemLog } from '../types';

const moduleConfig: Record<string, { tagColor: string }> = {
  HoKhau:   { tagColor: 'green' },
  NhanKhau: { tagColor: 'blue' },
  TamTru:   { tagColor: 'cyan' },
  TamVang:  { tagColor: 'purple' },
  Auth:     { tagColor: 'orange' },
  System:   { tagColor: 'default' },
};

export default function Logs() {
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [moduleFilter, setModuleFilter] = useState<string>('');
  const [search, setSearch] = useState('');
  const [messageApi, contextHolder] = message.useMessage();

  const load = useCallback(async () => {
    setLoading(true);
    try { const r = await userService.getLogs(200); setLogs(r.data); }
    catch { messageApi.error('Không thể tải nhật ký!'); }
    finally { setLoading(false); }
  }, [messageApi]);

  useEffect(() => { load(); }, [load]);

  const filteredLogs = logs.filter(l => {
    const matchModule = !moduleFilter || l.module === moduleFilter;
    const matchSearch = !search || l.action.toLowerCase().includes(search.toLowerCase()) || l.username.toLowerCase().includes(search.toLowerCase());
    return matchModule && matchSearch;
  });

  const columns: ColumnsType<SystemLog> = [
    {
      title: 'Thời gian', dataIndex: 'createdAt', key: 'createdAt', width: 170,
      render: (v) => <span style={{ fontSize: '12px', color: '#737373', whiteSpace: 'nowrap' }}>{new Date(v).toLocaleString('vi-VN')}</span>,
      sorter: (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      defaultSortOrder: 'ascend' as const,
    },
    {
      title: 'Người dùng', dataIndex: 'username', key: 'username', width: 150,
      render: (v) => <span style={{ fontWeight: 600, fontSize: '13px' }}>{v}</span>,
    },
    { title: 'Hành động', dataIndex: 'action', key: 'action', render: (v) => <span style={{ fontSize: '13px' }}>{v}</span> },
    {
      title: 'Module', dataIndex: 'module', key: 'module', width: 110, align: 'center',
      render: (v) => {
        const cfg = moduleConfig[v] || moduleConfig.System;
        return <Tag color={cfg.tagColor} style={{ fontWeight: 600 }}>{v}</Tag>;
      },
    },
    {
      title: 'Chi tiết', dataIndex: 'detail', key: 'detail', ellipsis: true,
      render: (v) => <span style={{ fontSize: '12px', color: '#737373' }}>{v || '—'}</span>,
    },
    {
      title: 'IP', dataIndex: 'ipAddress', key: 'ipAddress', width: 130,
      render: (v) => <span style={{ fontSize: '11.5px', fontFamily: 'monospace', color: '#737373' }}>{v}</span>,
    },
  ];

  return (
    <>
      {contextHolder}

      {/* Page Header */}
      <div style={{ padding: '24px 24px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#32373C', margin: 0, lineHeight: 1.2 }}>Nhật ký Hệ thống</h1>
            <p style={{ fontSize: '13px', color: '#737373', margin: '4px 0 0' }}>{filteredLogs.length} bản ghi</p>
          </div>
          <Button icon={<ReloadOutlined />} onClick={load}>Làm mới</Button>
        </div>

        {/* Module Legend */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
          {Object.entries(moduleConfig).map(([k, v]) => (
            <Tag key={k} color={v.tagColor} style={{ fontWeight: 600, cursor: 'default' }}>{k}</Tag>
          ))}
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
          <Input
            prefix={<SearchOutlined style={{ color: '#737373' }} />}
            placeholder="Tìm hành động, người dùng..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: '260px' }}
            allowClear
          />
          <Select
            placeholder="Lọc theo module"
            value={moduleFilter || undefined}
            onChange={v => setModuleFilter(v || '')}
            allowClear
            style={{ width: '160px' }}
            options={Object.keys(moduleConfig).map(k => ({ label: k, value: k }))}
          />
        </div>

        {/* Table */}
        <div style={{ background: '#fff', borderRadius: '8px', border: '1px solid #E5E5E5', overflow: 'hidden' }}>
          <Table
            columns={columns}
            dataSource={filteredLogs}
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 15, showSizeChanger: true, showTotal: (t) => `${t} bản ghi` }}
            size="middle"
          />
        </div>
      </div>
    </>
  );
}
