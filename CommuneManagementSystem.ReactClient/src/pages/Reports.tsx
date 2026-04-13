import React, { useEffect, useMemo, useState } from 'react';
import { DownloadOutlined, ReloadOutlined } from '@ant-design/icons';
import { Button, Card, Descriptions, Input, Modal, Select, Space, Table, Tabs, Tag, message } from 'antd';
import './Reports.css';
import { householdService } from '../services/householdService';
import { reportService } from '../services/reportService';
import { Household, PopulationStats } from '../types';

type ReportStatusMap = Record<string, { label: string; color: string }>;
type ReportData = { type: string; title: string; generatedAt?: string; data: Record<string, any>[]; filter?: Record<string, any> } | null;

const householdStatusMap: ReportStatusMap = {
  Active: { label: 'Hoạt động', color: 'success' },
  Moved: { label: 'Đã chuyển', color: 'warning' },
  Deleted: { label: 'Đã xóa', color: 'default' },
};

const personStatusMap: ReportStatusMap = {
  Alive: { label: 'Đang sống', color: 'success' },
  Dead: { label: 'Đã mất', color: 'error' },
  Moved: { label: 'Đã chuyển', color: 'warning' },
  Deleted: { label: 'Đã xóa', color: 'default' },
};

const residenceStatusMap: ReportStatusMap = {
  Active: { label: 'Hiệu lực', color: 'processing' },
  Expired: { label: 'Hết hạn', color: 'warning' },
  Returned: { label: 'Đã trở về', color: 'success' },
  Cancelled: { label: 'Đã hủy', color: 'default' },
};

const buildSummaryCards = (stats: PopulationStats) => [
  { label: 'Tổng dân số', value: stats.totalPopulation, color: '#034AA0', testId: 'reports-summary-total-population' },
  { label: 'Hộ khẩu', value: stats.totalHouseholds, color: '#10B981', testId: 'reports-summary-total-households' },
  { label: 'Tạm trú', value: stats.tempResidentCount, color: '#0891B2', testId: 'reports-summary-temp-residence' },
  { label: 'Tạm vắng', value: stats.tempAbsentCount, color: '#7C3AED', testId: 'reports-summary-temp-absence' },
];

const renderStatusTag = (value: string, map: ReportStatusMap) => {
  const config = map[value] ?? { label: value, color: 'default' };
  return <Tag color={config.color}>{config.label}</Tag>;
};

const escapeCsvValue = (value: unknown) => {
  const raw = value == null ? '' : String(value);
  return `"${raw.replaceAll('"', '""')}"`;
};

export default function Reports() {
  const [stats, setStats] = useState<PopulationStats | null>(null);
  const [households, setHouseholds] = useState<Household[]>([]);
  const [reportData, setReportData] = useState<ReportData>(null);
  const [activeTab, setActiveTab] = useState('households');
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    households: { search: '', status: '' },
    population: { search: '', status: '', gender: '', householdId: undefined as number | undefined },
    residence: { status: '', fromDate: '', toDate: '' },
    absence: { status: '', fromDate: '', toDate: '' },
  });
  const [messageApi, contextHolder] = message.useMessage();
  const [detailModal, setDetailModal] = useState<{ open: boolean; item?: Record<string, any> }>({ open: false });

  useEffect(() => {
    reportService.getStatistics().then((response) => setStats(response.data)).catch(console.error);
    householdService.getAll().then((response) => setHouseholds(response.data)).catch(console.error);
    void loadReport('households');
  }, []);

  const loadReport = async (key: string) => {
    setActiveTab(key);
    setLoading(true);

    try {
      let response: any;

      if (key === 'households') response = await reportService.exportHouseholds(filters.households);
      else if (key === 'population') response = await reportService.exportPopulation(filters.population);
      else if (key === 'temp-residence') response = await reportService.exportTempResidence(filters.residence);
      else response = await reportService.exportTempAbsence(filters.absence);

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
    anchor.download = `report-${reportData.type}-${new Date().toISOString().slice(0, 10)}.json`;
    anchor.click();
    URL.revokeObjectURL(anchor.href);
    messageApi.success('Đã xuất file JSON.');
  };

  const exportCsv = () => {
    if (!reportData || !reportData.data?.length) {
      messageApi.warning('Không có dữ liệu để xuất CSV.');
      return;
    }

    const columns = Object.keys(reportData.data[0]);
    const rows = reportData.data.map((row) => columns.map((column) => escapeCsvValue(row[column])).join(','));
    const csv = [columns.join(','), ...rows].join('\n');
    const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' });
    const anchor = document.createElement('a');
    anchor.href = URL.createObjectURL(blob);
    anchor.download = `report-${reportData.type}-${new Date().toISOString().slice(0, 10)}.csv`;
    anchor.click();
    URL.revokeObjectURL(anchor.href);
    messageApi.success('Đã xuất file CSV.');
  };

  const generatedAt = reportData?.generatedAt ? new Date(reportData.generatedAt).toLocaleString('vi-VN') : null;
  const tableHeader = generatedAt ? (
    <p className="reports-generated-at">
      Xuất lúc: <strong>{generatedAt}</strong>
    </p>
  ) : null;

  const filterBar = useMemo(() => {
    if (activeTab === 'households') {
      return (
        <Space wrap>
          <Input
            placeholder="Tìm số hộ hoặc địa chỉ"
            value={filters.households.search}
            onChange={(event) =>
              setFilters((current) => ({
                ...current,
                households: { ...current.households, search: event.target.value },
              }))
            }
            style={{ width: 220 }}
            allowClear
          />
          <Select
            placeholder="Trạng thái"
            value={filters.households.status || undefined}
            onChange={(value) =>
              setFilters((current) => ({
                ...current,
                households: { ...current.households, status: value || '' },
              }))
            }
            allowClear
            style={{ width: 180 }}
            options={[
              { label: 'Hoạt động', value: 'Active' },
              { label: 'Đã chuyển', value: 'Moved' },
            ]}
          />
        </Space>
      );
    }

    if (activeTab === 'population') {
      return (
        <Space wrap>
          <Input
            placeholder="Tìm họ tên hoặc CCCD"
            value={filters.population.search}
            onChange={(event) =>
              setFilters((current) => ({
                ...current,
                population: { ...current.population, search: event.target.value },
              }))
            }
            style={{ width: 220 }}
            allowClear
          />
          <Select
            placeholder="Trạng thái"
            value={filters.population.status || undefined}
            onChange={(value) =>
              setFilters((current) => ({
                ...current,
                population: { ...current.population, status: value || '' },
              }))
            }
            allowClear
            style={{ width: 170 }}
            options={[
              { label: 'Đang sống', value: 'Alive' },
              { label: 'Đã mất', value: 'Dead' },
              { label: 'Đã chuyển', value: 'Moved' },
            ]}
          />
          <Select
            placeholder="Giới tính"
            value={filters.population.gender || undefined}
            onChange={(value) =>
              setFilters((current) => ({
                ...current,
                population: { ...current.population, gender: value || '' },
              }))
            }
            allowClear
            style={{ width: 140 }}
            options={[
              { label: 'Nam', value: 'Nam' },
              { label: 'Nữ', value: 'Nữ' },
            ]}
          />
          <Select
            placeholder="Hộ khẩu"
            value={filters.population.householdId}
            onChange={(value) =>
              setFilters((current) => ({
                ...current,
                population: { ...current.population, householdId: value },
              }))
            }
            allowClear
            style={{ width: 220 }}
            options={households.map((household) => ({
              label: household.householdNumber,
              value: household.id,
            }))}
          />
        </Space>
      );
    }

    const key = activeTab === 'temp-residence' ? 'residence' : 'absence';
    const value = filters[key];
    const statusOptions =
      activeTab === 'temp-residence'
        ? [
            { label: 'Hiệu lực', value: 'Active' },
            { label: 'Hết hạn', value: 'Expired' },
            { label: 'Đã hủy', value: 'Cancelled' },
          ]
        : [
            { label: 'Hiệu lực', value: 'Active' },
            { label: 'Đã trở về', value: 'Returned' },
            { label: 'Đã hủy', value: 'Cancelled' },
          ];

    return (
      <Space wrap>
        <Select
          placeholder="Trạng thái"
          value={value.status || undefined}
          onChange={(status) =>
            setFilters((current) => ({
              ...current,
              [key]: { ...current[key], status: status || '' },
            }))
          }
          allowClear
          style={{ width: 180 }}
          options={statusOptions}
        />
        <Input
          type="date"
          value={value.fromDate}
          onChange={(event) =>
            setFilters((current) => ({
              ...current,
              [key]: { ...current[key], fromDate: event.target.value },
            }))
          }
          style={{ width: 180 }}
        />
        <Input
          type="date"
          value={value.toDate}
          onChange={(event) =>
            setFilters((current) => ({
              ...current,
              [key]: { ...current[key], toDate: event.target.value },
            }))
          }
          style={{ width: 180 }}
        />
      </Space>
    );
  }, [activeTab, filters, households]);

  const tabItems = [
    {
      key: 'households',
      label: <span data-testid="reports-tab-households">Hộ khẩu</span>,
      children: (
        <div data-testid="reports-table-households" className="reports-table-panel">
          {tableHeader}
          <Table
            columns={[
              {
                title: 'Số hộ',
                dataIndex: 'householdNumber',
                key: 'householdNumber',
                render: (value: string) => <span className="reports-table__primary">{value}</span>,
              },
              { title: 'Địa chỉ', dataIndex: 'address', key: 'address', ellipsis: true },
              {
                title: 'Chủ hộ',
                dataIndex: 'headPersonName',
                key: 'headPersonName',
                render: (value: string) => value || '—',
              },
              { title: 'Số thành viên', dataIndex: 'memberCount', key: 'memberCount', align: 'center' as const },
              {
                title: 'Trạng thái',
                dataIndex: 'status',
                key: 'status',
                render: (value: string) => renderStatusTag(value, householdStatusMap),
              },
            ]}
            dataSource={reportData?.data || []}
            rowKey="id"
            loading={loading}
            scroll={{ x: 820 }}
            pagination={{ pageSize: 10, showTotal: (total: number) => `${total} hộ khẩu` }}
            onRow={(record) => ({ onDoubleClick: () => setDetailModal({ open: true, item: record }) })}
          />
        </div>
      ),
    },
    {
      key: 'population',
      label: <span data-testid="reports-tab-population">Nhân khẩu</span>,
      children: (
        <div data-testid="reports-table-population" className="reports-table-panel">
          {tableHeader}
          <Table
            columns={[
              { title: 'Họ tên', dataIndex: 'fullName', key: 'fullName', render: (value: string) => <strong>{value}</strong> },
              {
                title: 'Ngày sinh',
                dataIndex: 'dateOfBirth',
                key: 'dateOfBirth',
                render: (value: string) => new Date(value).toLocaleDateString('vi-VN'),
              },
              { title: 'Giới tính', dataIndex: 'gender', key: 'gender', align: 'center' as const },
              { title: 'CCCD', dataIndex: 'nationalId', key: 'nationalId', render: (value: string) => value || '—' },
              { title: 'Dân tộc', dataIndex: 'ethnicity', key: 'ethnicity' },
              { title: 'Hộ khẩu', dataIndex: 'householdNumber', key: 'householdNumber', render: (value: string) => value || '—' },
              {
                title: 'Trạng thái',
                dataIndex: 'status',
                key: 'status',
                render: (value: string) => renderStatusTag(value, personStatusMap),
              },
            ]}
            dataSource={reportData?.data || []}
            rowKey="id"
            loading={loading}
            scroll={{ x: 980 }}
            pagination={{ pageSize: 10, showTotal: (total: number) => `${total} nhân khẩu` }}
            onRow={(record) => ({ onDoubleClick: () => setDetailModal({ open: true, item: record }) })}
          />
        </div>
      ),
    },
    {
      key: 'temp-residence',
      label: <span data-testid="reports-tab-temp-residence">Tạm trú</span>,
      children: (
        <div data-testid="reports-table-temp-residence" className="reports-table-panel">
          {tableHeader}
          <Table
            columns={[
              { title: 'Người tạm trú', dataIndex: 'personName', key: 'personName', render: (value: string) => value || '—' },
              { title: 'Địa chỉ', dataIndex: 'address', key: 'address', ellipsis: true },
              {
                title: 'Từ ngày',
                dataIndex: 'startDate',
                key: 'startDate',
                render: (value: string) => new Date(value).toLocaleDateString('vi-VN'),
              },
              {
                title: 'Đến ngày',
                dataIndex: 'endDate',
                key: 'endDate',
                render: (value: string) => new Date(value).toLocaleDateString('vi-VN'),
              },
              { title: 'Lý do', dataIndex: 'reason', key: 'reason', ellipsis: true, render: (value: string) => value || '—' },
              {
                title: 'Trạng thái',
                dataIndex: 'status',
                key: 'status',
                render: (value: string) => renderStatusTag(value, residenceStatusMap),
              },
            ]}
            dataSource={reportData?.data || []}
            rowKey="id"
            loading={loading}
            scroll={{ x: 920 }}
            pagination={{ pageSize: 10, showTotal: (total: number) => `${total} đăng ký` }}
            onRow={(record) => ({ onDoubleClick: () => setDetailModal({ open: true, item: record }) })}
          />
        </div>
      ),
    },
    {
      key: 'temp-absence',
      label: <span data-testid="reports-tab-temp-absence">Tạm vắng</span>,
      children: (
        <div data-testid="reports-table-temp-absence" className="reports-table-panel">
          {tableHeader}
          <Table
            columns={[
              { title: 'Người tạm vắng', dataIndex: 'personName', key: 'personName', render: (value: string) => value || '—' },
              {
                title: 'Từ ngày',
                dataIndex: 'startDate',
                key: 'startDate',
                render: (value: string) => new Date(value).toLocaleDateString('vi-VN'),
              },
              {
                title: 'Đến ngày',
                dataIndex: 'endDate',
                key: 'endDate',
                render: (value: string) => new Date(value).toLocaleDateString('vi-VN'),
              },
              { title: 'Nơi đến', dataIndex: 'destination', key: 'destination', ellipsis: true },
              { title: 'Lý do', dataIndex: 'reason', key: 'reason', ellipsis: true, render: (value: string) => value || '—' },
              {
                title: 'Trạng thái',
                dataIndex: 'status',
                key: 'status',
                render: (value: string) => renderStatusTag(value, residenceStatusMap),
              },
            ]}
            dataSource={reportData?.data || []}
            rowKey="id"
            loading={loading}
            scroll={{ x: 920 }}
            pagination={{ pageSize: 10, showTotal: (total: number) => `${total} đăng ký` }}
            onRow={(record) => ({ onDoubleClick: () => setDetailModal({ open: true, item: record }) })}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="civic-page page-wrapper">
      {contextHolder}

      <div className="civic-page-hero" data-testid="reports-page">
        <div className="civic-page-hero__inner">
          <div className="civic-page-hero__left">
            <div className="civic-page-hero__eyebrow">Trung tâm báo cáo</div>
            <h1 className="civic-page-hero__title">Báo cáo và thống kê</h1>
            <p className="civic-page-hero__subtitle">
              Tạo báo cáo theo bộ lọc tùy chọn và xuất dữ liệu nhanh dưới dạng JSON hoặc CSV.
            </p>
          </div>
          <div className="civic-page-hero__actions">
            <Button icon={<DownloadOutlined />} onClick={exportCsv} disabled={!reportData?.data?.length}>
              Xuất CSV
            </Button>
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
        </div>
      </div>

      {stats && (
        <div className="civic-kpi-row">
          {buildSummaryCards(stats).map((card) => (
            <div key={card.testId} className="civic-kpi-card civic-kpi-card--blue" data-testid={card.testId}>
              <div className="civic-kpi-card__body">
                <div className="civic-kpi-card__value" style={{ color: card.color }}>
                  {card.value.toLocaleString('vi-VN')}
                </div>
                <div className="civic-kpi-card__label">{card.label}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Card className="civic-section reports-panel" styles={{ body: { padding: 0 } }}>
        <div className="civic-toolbar" style={{ marginBottom: 0, borderRadius: 0, borderLeft: 'none', borderRight: 'none', borderTop: 'none' }}>
          <div className="civic-toolbar__filters">{filterBar}</div>
          <div className="civic-toolbar__actions">
            <Button onClick={() => void loadReport(activeTab)}>Áp dụng bộ lọc</Button>
            <Button data-testid="reports-refresh" icon={<ReloadOutlined />} onClick={() => void loadReport(activeTab)}>
              Làm mới
            </Button>
          </div>
        </div>

        <div style={{ padding: '0 20px 20px' }}>
          <Tabs
            data-testid="reports-tabs"
            items={tabItems}
            activeKey={activeTab}
            onChange={(key) => void loadReport(key)}
            className="reports-tabs"
          />
        </div>
      </Card>

      <Modal
        title="Chi tiết"
        open={detailModal.open}
        onCancel={() => setDetailModal({ open: false })}
        footer={null}
        width={640}
      >
        {detailModal.item && (
          <Descriptions column={1} style={{ marginTop: 12 }}>
            {'householdNumber' in detailModal.item && 'headPersonName' in detailModal.item && (
              <>
                <Descriptions.Item label="Số hộ">{detailModal.item.householdNumber}</Descriptions.Item>
                <Descriptions.Item label="Địa chỉ">{detailModal.item.address}</Descriptions.Item>
                <Descriptions.Item label="Chủ hộ">{detailModal.item.headPersonName || '—'}</Descriptions.Item>
                <Descriptions.Item label="Số thành viên">{detailModal.item.memberCount}</Descriptions.Item>
                <Descriptions.Item label="Trạng thái">
                  <Tag color={householdStatusMap[detailModal.item.status as string]?.color ?? 'default'}>
                    {householdStatusMap[detailModal.item.status as string]?.label ?? detailModal.item.status}
                  </Tag>
                </Descriptions.Item>
              </>
            )}
            {'fullName' in detailModal.item && 'dateOfBirth' in detailModal.item && !('memberCount' in detailModal.item) && (
              <>
                <Descriptions.Item label="Họ tên">{detailModal.item.fullName}</Descriptions.Item>
                <Descriptions.Item label="Ngày sinh">
                  {new Date(detailModal.item.dateOfBirth).toLocaleDateString('vi-VN')}
                </Descriptions.Item>
                <Descriptions.Item label="Giới tính">{detailModal.item.gender}</Descriptions.Item>
                <Descriptions.Item label="CCCD">{detailModal.item.nationalId || '—'}</Descriptions.Item>
                <Descriptions.Item label="Dân tộc">{detailModal.item.ethnicity || '—'}</Descriptions.Item>
                <Descriptions.Item label="Hộ khẩu">{detailModal.item.householdNumber || '—'}</Descriptions.Item>
                <Descriptions.Item label="Trạng thái">
                  <Tag color={personStatusMap[detailModal.item.status as string]?.color ?? 'default'}>
                    {personStatusMap[detailModal.item.status as string]?.label ?? detailModal.item.status}
                  </Tag>
                </Descriptions.Item>
              </>
            )}
            {'ageGroup' in detailModal.item && 'maleCount' in detailModal.item && (
              <>
                <Descriptions.Item label="Nhóm tuổi">{detailModal.item.ageGroup}</Descriptions.Item>
                <Descriptions.Item label="Nam">{detailModal.item.maleCount}</Descriptions.Item>
                <Descriptions.Item label="Nữ">{detailModal.item.femaleCount}</Descriptions.Item>
                <Descriptions.Item label="Tổng">{detailModal.item.total}</Descriptions.Item>
              </>
            )}
            {'householdNumber' in detailModal.item && 'oldAddress' in detailModal.item && (
              <>
                <Descriptions.Item label="Số hộ">{detailModal.item.householdNumber}</Descriptions.Item>
                <Descriptions.Item label="Người">{detailModal.item.personName || '—'}</Descriptions.Item>
                <Descriptions.Item label="Địa chỉ cũ">{detailModal.item.oldAddress}</Descriptions.Item>
                <Descriptions.Item label="Địa chỉ mới">{detailModal.item.newAddress}</Descriptions.Item>
                <Descriptions.Item label="Ngày chuyển">
                  {detailModal.item.moveDate
                    ? new Date(detailModal.item.moveDate).toLocaleDateString('vi-VN')
                    : '—'}
                </Descriptions.Item>
                <Descriptions.Item label="Lý do">{detailModal.item.reason || '—'}</Descriptions.Item>
              </>
            )}
          </Descriptions>
        )}
      </Modal>
    </div>
  );
}
