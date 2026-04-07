import React, { useEffect, useState } from 'react';
import { Button, Tabs, Table, Card, message, Tag } from 'antd';
import { DownloadOutlined, ReloadOutlined } from '@ant-design/icons';
import { reportService } from '../services/reportService';
import { PopulationStats } from '../types';

export default function Reports() {
  const [stats, setStats] = useState<PopulationStats | null>(null);
  const [reportData, setReportData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('households');
  const [loading, setLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    reportService.getStatistics().then(r => setStats(r.data)).catch(console.error);
    void loadReport('households');
  }, []);

  const loadReport = async (key: string) => {
    setActiveTab(key);
    setLoading(true);
    try {
      let r: any;
      if (key === 'households') r = await reportService.exportHouseholds();
      else if (key === 'population') r = await reportService.exportPopulation();
      else if (key === 'temp-residence') r = await reportService.exportTempResidence();
      else r = await reportService.exportTempAbsence();
      setReportData(r.data);
    } catch {
      messageApi.error('Không thể tải báo cáo!');
    } finally {
      setLoading(false);
    }
  };

  const exportJson = () => {
    if (!reportData) return;
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `report-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
    messageApi.success('Đã xuất file JSON!');
  };

  const tabItems = [
    {
      key: 'households',
      label: '🏘️ DS Hộ khẩu',
      children: (
        <div>
          {reportData?.generatedAt && (
            <p style={{ fontSize: '13px', color: '#737373', marginBottom: '12px' }}>
              Xuất lúc: <strong>{new Date(reportData.generatedAt).toLocaleString('vi-VN')}</strong>
            </p>
          )}
          <Table
            columns={[
              { title: 'Số hộ', dataIndex: 'householdNumber', key: 'householdNumber', render: (v: string) => <span style={{ fontWeight: 700, color: '#034AA0' }}>{v}</span> },
              { title: 'Địa chỉ', dataIndex: 'address', key: 'address', ellipsis: true },
              { title: 'Chủ hộ', dataIndex: 'headPersonName', key: 'headPersonName', render: (v: string) => v || '—' },
              { title: 'Số thành viên', dataIndex: 'memberCount', key: 'memberCount', align: 'center' as const },
              { title: 'Trạng thái', dataIndex: 'status', key: 'status', render: (v: string) => <Tag color={v === 'Active' ? 'success' : v === 'Moved' ? 'warning' : 'default'}>{v}</Tag> },
            ]}
            dataSource={reportData?.data || []}
            rowKey="id"
            loading={loading}
            scroll={{ x: 820 }}
            pagination={{ pageSize: 10, showTotal: (t: number) => `${t} hộ khẩu` }}
            locale={{ emptyText: !reportData ? 'Chọn loại báo cáo để xem dữ liệu' : 'Không có dữ liệu' }}
          />
        </div>
      ),
    },
    {
      key: 'population',
      label: '👥 DS Nhân khẩu',
      children: (
        <div>
          {reportData?.generatedAt && (
            <p style={{ fontSize: '13px', color: '#737373', marginBottom: '12px' }}>
              Xuất lúc: <strong>{new Date(reportData.generatedAt).toLocaleString('vi-VN')}</strong>
            </p>
          )}
          <Table
            columns={[
              { title: 'Họ tên', dataIndex: 'fullName', key: 'fullName', render: (v: string) => <strong>{v}</strong> },
              { title: 'Ngày sinh', dataIndex: 'dateOfBirth', key: 'dateOfBirth', render: (v: string) => new Date(v).toLocaleDateString('vi-VN') },
              { title: 'Giới tính', dataIndex: 'gender', key: 'gender', align: 'center' as const },
              { title: 'CCCD', dataIndex: 'nationalId', key: 'nationalId', render: (v: string) => v || '—' },
              { title: 'Dân tộc', dataIndex: 'ethnicity', key: 'ethnicity' },
              { title: 'Hộ khẩu', dataIndex: 'householdNumber', key: 'householdNumber', render: (v: string) => v || '—' },
              { title: 'Trạng thái', dataIndex: 'status', key: 'status', render: (v: string) => <Tag color={v === 'Alive' ? 'success' : v === 'Dead' ? 'error' : v === 'Moved' ? 'warning' : 'default'}>{v}</Tag> },
            ]}
            dataSource={reportData?.data || []}
            rowKey="id"
            loading={loading}
            scroll={{ x: 980 }}
            pagination={{ pageSize: 10, showTotal: (t: number) => `${t} nhân khẩu` }}
            locale={{ emptyText: !reportData ? 'Chọn loại báo cáo để xem dữ liệu' : 'Không có dữ liệu' }}
          />
        </div>
      ),
    },
    {
      key: 'temp-residence',
      label: '📍 Tạm trú',
      children: (
        <div>
          {reportData?.generatedAt && (
            <p style={{ fontSize: '13px', color: '#737373', marginBottom: '12px' }}>
              Xuất lúc: <strong>{new Date(reportData.generatedAt).toLocaleString('vi-VN')}</strong>
            </p>
          )}
          <Table
            columns={[
              { title: 'Người tạm trú', dataIndex: 'personName', key: 'personName', render: (v: string) => v || '—' },
              { title: 'Địa chỉ', dataIndex: 'address', key: 'address', ellipsis: true },
              { title: 'Từ ngày', dataIndex: 'startDate', key: 'startDate', render: (v: string) => new Date(v).toLocaleDateString('vi-VN') },
              { title: 'Đến ngày', dataIndex: 'endDate', key: 'endDate', render: (v: string) => new Date(v).toLocaleDateString('vi-VN') },
              { title: 'Lý do', dataIndex: 'reason', key: 'reason', render: (v: string) => v || '—', ellipsis: true },
              { title: 'Trạng thái', dataIndex: 'status', key: 'status', render: (v: string) => <Tag color={v === 'Active' ? 'processing' : v === 'Expired' ? 'warning' : 'default'}>{v}</Tag> },
            ]}
            dataSource={reportData?.data || []}
            rowKey="id"
            loading={loading}
            scroll={{ x: 920 }}
            pagination={{ pageSize: 10, showTotal: (t: number) => `${t} đăng ký` }}
            locale={{ emptyText: !reportData ? 'Chọn loại báo cáo để xem dữ liệu' : 'Không có dữ liệu' }}
          />
        </div>
      ),
    },
    {
      key: 'temp-absence',
      label: '✈️ Tạm vắng',
      children: (
        <div>
          {reportData?.generatedAt && (
            <p style={{ fontSize: '13px', color: '#737373', marginBottom: '12px' }}>
              Xuất lúc: <strong>{new Date(reportData.generatedAt).toLocaleString('vi-VN')}</strong>
            </p>
          )}
          <Table
            columns={[
              { title: 'Người tạm vắng', dataIndex: 'personName', key: 'personName', render: (v: string) => v || '—' },
              { title: 'Từ ngày', dataIndex: 'startDate', key: 'startDate', render: (v: string) => new Date(v).toLocaleDateString('vi-VN') },
              { title: 'Đến ngày', dataIndex: 'endDate', key: 'endDate', render: (v: string) => new Date(v).toLocaleDateString('vi-VN') },
              { title: 'Nơi đến', dataIndex: 'destination', key: 'destination', ellipsis: true },
              { title: 'Lý do', dataIndex: 'reason', key: 'reason', render: (v: string) => v || '—', ellipsis: true },
              { title: 'Trạng thái', dataIndex: 'status', key: 'status', render: (v: string) => <Tag color={v === 'Active' ? 'processing' : v === 'Returned' ? 'success' : 'default'}>{v}</Tag> },
            ]}
            dataSource={reportData?.data || []}
            rowKey="id"
            loading={loading}
            scroll={{ x: 920 }}
            pagination={{ pageSize: 10, showTotal: (t: number) => `${t} đăng ký` }}
            locale={{ emptyText: !reportData ? 'Chọn loại báo cáo để xem dữ liệu' : 'Không có dữ liệu' }}
          />
        </div>
      ),
    },
  ];

  return (
    <>
      {contextHolder}

      {/* Page Header */}
      <div className="reports-page-header">
        <div>
          <h1 className="reports-page-title">Báo cáo & Thống kê</h1>
          <p className="reports-page-subtitle">Dữ liệu cập nhật theo thời gian thực</p>
        </div>
        <Button
          type="primary"
          icon={<DownloadOutlined />}
          onClick={exportJson}
          disabled={!reportData}
        >
          Xuất JSON
        </Button>
      </div>

      {/* Summary stats */}
      {stats && (
        <div className="report-summary-grid">
          {[
            { label: 'Tổng dân số', value: stats.totalPopulation, color: '#034AA0', bg: '#EBF3FC' },
            { label: 'Hộ khẩu', value: stats.totalHouseholds, color: '#10B981', bg: '#ECFDF5' },
            { label: 'Tạm trú', value: stats.tempResidentCount, color: '#0891B2', bg: '#ECFEFF' },
            { label: 'Tạm vắng', value: stats.tempAbsentCount, color: '#7C3AED', bg: '#F5F3FF' },
          ].map(s => (
            <Card key={s.label} style={{ borderRadius: '8px', border: '1px solid #E5E5E5' }} bodyStyle={{ padding: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ fontSize: '28px', fontWeight: 800, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: '12px', color: s.color, fontWeight: 600 }}>{s.label}</div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Report Card */}
      <div className="reports-table-card">
        <div className="reports-tabs-header">
          <Tabs
            items={tabItems}
            activeKey={activeTab}
            onChange={loadReport}
            style={{ marginBottom: 0 }}
          />
          <Button icon={<ReloadOutlined />} onClick={() => void loadReport(activeTab)}>
            Làm mới
          </Button>
        </div>
      </div>
    </>
  );
}
