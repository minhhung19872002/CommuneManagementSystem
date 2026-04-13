import React, { useState } from 'react';
import { CheckCircleFilled, CloudDownloadOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import { Alert, Button, Card, Descriptions, List, message } from 'antd';
import { userService } from '../services/userService';
import './Backup.css';

type BackupResponse = {
  message?: string;
  details?: Record<string, string | number | boolean | null>;
};

const protectionLayers = [
  'Dữ liệu được quản lý theo phân quyền tài khoản.',
  'Hoạt động nghiệp vụ được ghi vết trong nhật ký hệ thống.',
  'Cho phép sao lưu đầy đủ dữ liệu và tài liệu đính kèm dưới dạng JSON.',
  'Bản sao lưu có thể dùng cho quy trình kiểm tra hoặc phục hồi nội bộ.',
];

export default function Backup() {
  const [loading, setLoading] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [restoreFile, setRestoreFile] = useState<File | null>(null);
  const [result, setResult] = useState<BackupResponse | null>(null);
  const [messageApi, contextHolder] = message.useMessage();

  const handleBackup = async () => {
    setLoading(true);

    try {
      const summaryResponse = await userService.backup();
      setResult(summaryResponse.data);

      const fileResponse = await userService.exportBackup();
      const blob = new Blob([fileResponse.data], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `commune-backup-${new Date().toISOString().slice(0, 10)}.json`;
      anchor.click();
      window.URL.revokeObjectURL(url);

      messageApi.success('Đã tạo và tải file sao lưu.');
    } catch {
      messageApi.error('Sao lưu thất bại.');
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async () => {
    if (!restoreFile) {
      messageApi.warning('Vui lòng chọn file backup để phục hồi.');
      return;
    }

    setRestoring(true);
    try {
      await userService.restoreBackup(restoreFile);
      messageApi.success('Đã phục hồi dữ liệu từ file backup.');
      setRestoreFile(null);
      const input = document.getElementById('restore-backup-input') as HTMLInputElement | null;
      if (input) {
        input.value = '';
      }
    } catch (error: any) {
      messageApi.error(error?.response?.data?.message || 'Phục hồi thất bại.');
    } finally {
      setRestoring(false);
    }
  };

  return (
    <div className="civic-page page-wrapper">
      {contextHolder}

      <div className="civic-page-hero" data-testid="backup-page">
        <div className="civic-page-hero__inner">
          <div className="civic-page-hero__left">
            <div className="civic-page-hero__eyebrow">An toàn dữ liệu</div>
            <h1 className="civic-page-hero__title">Sao lưu và phục hồi</h1>
            <p className="civic-page-hero__subtitle">
              Tạo snapshot JSON đầy đủ cho cơ sở dữ liệu và tài liệu đính kèm để phục vụ đối soát hoặc khôi phục.
            </p>
          </div>
        </div>
      </div>

      <div className="backup-grid">
        <Card title="Sao lưu dữ liệu" className="backup-card">
          <div className="backup-card__body">
            <p className="backup-card__text">
              Hệ thống sẽ tạo file JSON chứa dữ liệu nghiệp vụ, tài khoản, nhật ký và metadata tài liệu đính kèm.
              Khuyến nghị thực hiện định kỳ để đảm bảo an toàn vận hành.
            </p>

            <Alert
              type="info"
              showIcon
              message="Khuyến nghị"
              description="Nên sao lưu ít nhất 1 lần mỗi tuần hoặc trước khi chỉnh sửa dữ liệu hàng loạt."
            />

            <Button
              type="primary"
              icon={<CloudDownloadOutlined />}
              loading={loading}
              onClick={handleBackup}
              className="backup-card__action"
            >
              {loading ? 'Đang sao lưu...' : 'Tạo và tải file sao lưu'}
            </Button>

            {result && (
              <div className="backup-result">
                <div className="backup-result__header">
                  <CheckCircleFilled />
                  <span>{result.message || 'Sao lưu hoàn tất.'}</span>
                </div>

                <Descriptions
                  size="small"
                  column={1}
                  colon={false}
                  items={Object.entries(result.details || {}).map(([key, value]) => ({
                    key,
                    label: <span className="backup-result__label">{key}</span>,
                    children: <span className="backup-result__value">{String(value ?? '')}</span>,
                  }))}
                />
              </div>
            )}
          </div>
        </Card>

        <Card title="Phục hồi dữ liệu" className="backup-card">
          <div className="backup-card__body">
            <p className="backup-card__text">
              Tải lên một file backup JSON đã xuất trước đó để phục hồi toàn bộ dữ liệu nghiệp vụ, cấu hình và tài liệu đính kèm.
            </p>

            <input
              id="restore-backup-input"
              type="file"
              accept=".json,application/json"
              onChange={(event) => setRestoreFile(event.target.files?.[0] ?? null)}
            />

            <Alert
              type="warning"
              showIcon
              message="Lưu ý"
              description="Thao tác phục hồi sẽ ghi đè dữ liệu hiện tại trong hệ thống. Chỉ thực hiện khi đã xác nhận file backup hợp lệ."
            />

            <Button type="primary" danger loading={restoring} onClick={() => void handleRestore()} className="backup-card__action">
              {restoring ? 'Đang phục hồi...' : 'Phục hồi từ file backup'}
            </Button>

            <div className="backup-result__value">{restoreFile ? `Đã chọn: ${restoreFile.name}` : 'Chưa chọn file phục hồi.'}</div>
          </div>
        </Card>

        <div className="backup-side-column">
          <Card title="Thông tin hệ thống" className="backup-card">
            <Descriptions
              size="small"
              column={{ xs: 1, sm: 2 }}
              bordered
              items={[
                { key: 'tech', label: 'Backend', children: 'ASP.NET Core 9.0' },
                { key: 'fe', label: 'Frontend', children: 'React + Vite' },
                { key: 'ui', label: 'UI', children: 'Ant Design' },
                { key: 'db', label: 'Cơ sở dữ liệu', children: 'SQLite' },
                { key: 'ver', label: 'Phiên bản', children: '1.1.0' },
                { key: 'date', label: 'Ngày kiểm tra', children: new Date().toLocaleDateString('vi-VN') },
              ]}
            />
          </Card>

          <Card title="Lớp bảo vệ hiện tại" className="backup-card">
            <List
              dataSource={protectionLayers}
              renderItem={(item) => (
                <List.Item className="backup-protection-item">
                  <div className="backup-protection-item__icon">
                    <SafetyCertificateOutlined />
                  </div>
                  <span>{item}</span>
                </List.Item>
              )}
            />
          </Card>
        </div>
      </div>
    </div>
  );
}
