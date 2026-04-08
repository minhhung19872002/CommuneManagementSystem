import React, { useEffect, useState } from 'react';
import { Button, Table, Tabs, Tag, message } from 'antd';
import { DownloadOutlined, ReloadOutlined } from '@ant-design/icons';
import { reportService } from '../services/reportService';
import { PopulationStats } from '../types';

const buildSummaryCards = (stats: PopulationStats) => [
  { label: 'Tổng dân số', value: stats.totalPopulation, color: '#034AA0', testId: 'reports-summary-total-population' },
  { label: 'Hộ khẩu', value: stats.totalHouseholds, color: '#10B981', testId: 'reports-summary-total-households' },
  { label: 'Tạm trú', value: stats.tempResidentCount, color: '#0891B2', testId: 'reports-summary-temp-residence' },
  { label: 'Tạm vắng', value: stats.tempAbsentCount, color: '#7C3AED', testId: 'reports-summary-temp-absence' },
];

export default function Reports() {
  const [stats, setStats] = useState<PopulationStats | null>(null);
  const [reportData, setReportData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('households');
  const [loading, setLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    reportService.getStatistics().then((response) => setStats(response.data)).catch(console.error);
    void loadReport('households');
  }, []);

  const loadReport = async (key: string) => {
    setActiveTab(key);
    setLoading(true);

    try {
      let response: any;

      if (key === 'households') response = await reportService.exportHouseholds();
      else if (key === 'population') response = await reportService.exportPopulation();
      else if (key === 'temp-residence') response = await reportService.exportTempResidence();
      else response = await reportService.exportTempAbsence();

      setReportData(response.data);
    } catch {
      messageApi.error('Không thể tải báo cáo.');
    } finally {
      setLoading(false);
    }
  };

  const exportJson = () => {
    if (!reportData) return;

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const anchor = document.createElement('a');
    anchor.href = URL.createObjectURL(blob);
    anchor.download = `report-${new Date().toISOString().slice(0, 10)}.json`;
    anchor.click();
    URL.revokeObjectURL(anchor.href);
    messageApi.success('Đã xuất file JSON.');
  };

  const generatedAt = reportData?.generatedAt
    ? new Date(reportData.generatedAt).toLocaleString('vi-VN')
    : null;

  const tabItems = [
    {
      key: 'households',
      label: <span data-testid="reports-tab-households">Hộ khẩu</span>,
      children: (
        <div data-testid="reports-table-households" className="px-6 pb-6 pt-5">
          {generatedAt && <p className="mb-4 text-sm text-[#61748f]">Xuất lúc: <strong>{generatedAt}</strong></p>}
          <Table
            columns={[
              {
                title: 'Số hộ',
                dataIndex: 'householdNumber',
                key: 'householdNumber',
                render: (value: string) => <span className="font-extrabold text-primary">{value}</span>,
              },
              { title: 'Địa chỉ', dataIndex: 'address', key: 'address', ellipsis: true },
              { title: 'Chủ hộ', dataIndex: 'headPersonName', key: 'headPersonName', render: (value: string) => value || '—' },
              { title: 'Số thành viên', dataIndex: 'memberCount', key: 'memberCount', align: 'center' as const },
              {
                title: 'Trạng thái',
                dataIndex: 'status',
                key: 'status',
                render: (value: string) => <Tag color={value === 'Active' ? 'success' : value === 'Moved' ? 'warning' : 'default'}>{value}</Tag>,
              },
            ]}
            dataSource={reportData?.data || []}
            rowKey="id"
            loading={loading}
            scroll={{ x: 820 }}
            pagination={{ pageSize: 10, showTotal: (total: number) => `${total} hộ khẩu` }}
            locale={{ emptyText: !reportData ? 'Chọn loại báo cáo để xem dữ liệu' : 'Không có dữ liệu' }}
          />
        </div>
      ),
    },
    {
      key: 'population',
      label: <span data-testid="reports-tab-population">Nhân khẩu</span>,
      children: (
        <div data-testid="reports-table-population" className="px-6 pb-6 pt-5">
          {generatedAt && <p className="mb-4 text-sm text-[#61748f]">Xuất lúc: <strong>{generatedAt}</strong></p>}
          <Table
            columns={[
              { title: 'Họ tên', dataIndex: 'fullName', key: 'fullName', render: (value: string) => <strong>{value}</strong> },
              { title: 'Ngày sinh', dataIndex: 'dateOfBirth', key: 'dateOfBirth', render: (value: string) => new Date(value).toLocaleDateString('vi-VN') },
              { title: 'Giới tính', dataIndex: 'gender', key: 'gender', align: 'center' as const },
              { title: 'CCCD', dataIndex: 'nationalId', key: 'nationalId', render: (value: string) => value || '—' },
              { title: 'Dân tộc', dataIndex: 'ethnicity', key: 'ethnicity' },
              { title: 'Hộ khẩu', dataIndex: 'householdNumber', key: 'householdNumber', render: (value: string) => value || '—' },
              {
                title: 'Trạng thái',
                dataIndex: 'status',
                key: 'status',
                render: (value: string) => <Tag color={value === 'Alive' ? 'success' : value === 'Dead' ? 'error' : value === 'Moved' ? 'warning' : 'default'}>{value}</Tag>,
              },
            ]}
            dataSource={reportData?.data || []}
            rowKey="id"
            loading={loading}
            scroll={{ x: 980 }}
            pagination={{ pageSize: 10, showTotal: (total: number) => `${total} nhân khẩu` }}
            locale={{ emptyText: !reportData ? 'Chọn loại báo cáo để xem dữ liệu' : 'Không có dữ liệu' }}
          />
        </div>
      ),
    },
    {
      key: 'temp-residence',
      label: <span data-testid="reports-tab-temp-residence">Tạm trú</span>,
      children: (
        <div data-testid="reports-table-temp-residence" className="px-6 pb-6 pt-5">
          {generatedAt && <p className="mb-4 text-sm text-[#61748f]">Xuất lúc: <strong>{generatedAt}</strong></p>}
          <Table
            columns={[
              { title: 'Người tạm trú', dataIndex: 'personName', key: 'personName', render: (value: string) => value || '—' },
              { title: 'Địa chỉ', dataIndex: 'address', key: 'address', ellipsis: true },
              { title: 'Từ ngày', dataIndex: 'startDate', key: 'startDate', render: (value: string) => new Date(value).toLocaleDateString('vi-VN') },
              { title: 'Đến ngày', dataIndex: 'endDate', key: 'endDate', render: (value: string) => new Date(value).toLocaleDateString('vi-VN') },
              { title: 'Lý do', dataIndex: 'reason', key: 'reason', ellipsis: true, render: (value: string) => value || '—' },
              {
                title: 'Trạng thái',
                dataIndex: 'status',
                key: 'status',
                render: (value: string) => <Tag color={value === 'Active' ? 'processing' : value === 'Expired' ? 'warning' : 'default'}>{value}</Tag>,
              },
            ]}
            dataSource={reportData?.data || []}
            rowKey="id"
            loading={loading}
            scroll={{ x: 920 }}
            pagination={{ pageSize: 10, showTotal: (total: number) => `${total} đăng ký` }}
            locale={{ emptyText: !reportData ? 'Chọn loại báo cáo để xem dữ liệu' : 'Không có dữ liệu' }}
          />
        </div>
      ),
    },
    {
      key: 'temp-absence',
      label: <span data-testid="reports-tab-temp-absence">Tạm vắng</span>,
      children: (
        <div data-testid="reports-table-temp-absence" className="px-6 pb-6 pt-5">
          {generatedAt && <p className="mb-4 text-sm text-[#61748f]">Xuất lúc: <strong>{generatedAt}</strong></p>}
          <Table
            columns={[
              { title: 'Người tạm vắng', dataIndex: 'personName', key: 'personName', render: (value: string) => value || '—' },
              { title: 'Từ ngày', dataIndex: 'startDate', key: 'startDate', render: (value: string) => new Date(value).toLocaleDateString('vi-VN') },
              { title: 'Đến ngày', dataIndex: 'endDate', key: 'endDate', render: (value: string) => new Date(value).toLocaleDateString('vi-VN') },
              { title: 'Nơi đến', dataIndex: 'destination', key: 'destination', ellipsis: true },
              { title: 'Lý do', dataIndex: 'reason', key: 'reason', ellipsis: true, render: (value: string) => value || '—' },
              {
                title: 'Trạng thái',
                dataIndex: 'status',
                key: 'status',
                render: (value: string) => <Tag color={value === 'Active' ? 'processing' : value === 'Returned' ? 'success' : 'default'}>{value}</Tag>,
              },
            ]}
            dataSource={reportData?.data || []}
            rowKey="id"
            loading={loading}
            scroll={{ x: 920 }}
            pagination={{ pageSize: 10, showTotal: (total: number) => `${total} đăng ký` }}
            locale={{ emptyText: !reportData ? 'Chọn loại báo cáo để xem dữ liệu' : 'Không có dữ liệu' }}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="page-stack">
      {contextHolder}

      <section className="page-hero" data-testid="reports-page">
        <div>
          <p className="page-kicker">Trung tâm báo cáo</p>
          <h1 className="page-title">Báo cáo và thống kê</h1>
          <p className="page-subtitle">Tổng hợp số liệu dân cư và xuất báo cáo điều hành theo từng nghiệp vụ.</p>
        </div>

        <div className="page-actions">
          <Button
            data-testid="reports-export-json"
            type="primary"
            icon={<DownloadOutlined />}
            onClick={exportJson}
            disabled={!reportData}
          >
            Xuất JSON
          </Button>
        </div>
      </section>

      {stats && (
        <div className="summary-grid">
          {buildSummaryCards(stats).map((card) => (
            <div key={card.testId} className="summary-card" data-testid={card.testId}>
              <div className="summary-card-value" style={{ color: card.color }}>
                {card.value.toLocaleString('vi-VN')}
              </div>
              <div className="summary-card-label">{card.label}</div>
            </div>
          ))}
        </div>
      )}

      <div className="surface-panel surface-panel--flush">
        <div
          className="page-toolbar"
          style={{ border: 'none', borderBottom: '1px solid #dce4f0', borderRadius: 0, boxShadow: 'none' }}
        >
          <Tabs
            data-testid="reports-tabs"
            items={tabItems}
            activeKey={activeTab}
            onChange={loadReport}
            style={{ flex: 1, marginBottom: 0 }}
          />

          <Button data-testid="reports-refresh" icon={<ReloadOutlined />} onClick={() => void loadReport(activeTab)}>
            Làm mới
          </Button>
        </div>
      </div>
    </div>
  );
}
