import React, { useEffect, useState, useCallback } from 'react';
import { Card, Table, Button, Input, Select, Tag, message, Modal, Descriptions } from 'antd';
import { ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { userService } from '../services/userService';
import { SystemLog } from '../types';
import './Logs.css';

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
  const [detailModal, setDetailModal] = useState<{ open: boolean; item?: SystemLog }>({ open: false });

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
    <div className="civic-page page-wrapper">
      {contextHolder}

      <div className="civic-page-hero">
        <div className="civic-page-hero__inner">
          <div className="civic-page-hero__left">
            <div className="civic-page-hero__eyebrow">Hệ thống / Nhật ký</div>
            <h1 className="civic-page-hero__title">Nhật ký Hệ thống</h1>
            <p className="civic-page-hero__subtitle">
              Theo dõi toàn bộ hoạt động nghiệp vụ và đăng nhập trong hệ thống.
            </p>
          </div>
          <div className="civic-page-hero__actions">
            <Button icon={<ReloadOutlined />} onClick={() => void load()}>Làm mới</Button>
          </div>
        </div>
      </div>

      <Card className="civic-section" styles={{ body: { padding: 0 } }}>
        <div className="civic-toolbar" style={{ marginBottom: 0, borderRadius: 0, borderLeft: 'none', borderRight: 'none', borderTop: 'none' }}>
          <div className="civic-toolbar__filters">
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
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
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {Object.entries(moduleConfig).map(([k, v]) => (
                  <Tag key={k} color={v.tagColor} style={{ fontWeight: 600, cursor: 'default' }}>{k}</Tag>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="civic-table-wrapper" style={{ padding: '0 16px 16px' }}>
          <Table
            columns={columns}
            dataSource={filteredLogs}
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 15, showSizeChanger: true, showTotal: (t) => `${t} bản ghi` }}
            size="middle"
            scroll={{ x: 1080 }}
            onRow={(record) => ({
              onDoubleClick: () => setDetailModal({ open: true, item: record }),
            })}
          />
        </div>
      </Card>

      <Modal
        title="Chi tiết nhật ký"
        open={detailModal.open}
        onCancel={() => setDetailModal({ open: false })}
        footer={null}
        width={640}
      >
        {detailModal.item && (
          <Descriptions column={1} style={{ marginTop: 8 }} bordered size="small">
            <Descriptions.Item label="Thời gian">
              {new Date(detailModal.item.createdAt).toLocaleString('vi-VN')}
            </Descriptions.Item>
            <Descriptions.Item label="Người dùng">{detailModal.item.username}</Descriptions.Item>
            <Descriptions.Item label="Hành động">{detailModal.item.action}</Descriptions.Item>
            <Descriptions.Item label="Module">
              <Tag color={moduleConfig[detailModal.item.module]?.tagColor ?? 'default'}>
                {detailModal.item.module}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Chi tiết">{detailModal.item.detail || '—'}</Descriptions.Item>
            <Descriptions.Item label="Địa chỉ IP">{detailModal.item.ipAddress}</Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
}
