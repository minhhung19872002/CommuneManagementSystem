import React, { useState } from 'react';
import { Button, Card, Descriptions, Alert, message } from 'antd';
import { CloudDownloadOutlined, CheckCircleFilled } from '@ant-design/icons';
import { userService } from '../services/userService';

export default function Backup() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [messageApi, contextHolder] = message.useMessage();

  const handleBackup = async () => {
    setLoading(true);
    try {
      const r = await userService.backup();
      setResult(r.data);
      messageApi.success('Sao lưu dữ liệu thành công!');
    } catch {
      messageApi.error('Sao lưu thất bại!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {contextHolder}

      {/* Page Header */}
      <div className="backup-page-header">
        <div>
          <h1 className="backup-page-title">Sao lưu & Phục hồi</h1>
          <p className="backup-page-subtitle">Quản lý dữ liệu hệ thống</p>
        </div>
      </div>

      {/* Content Grid */}
      <div className="backup-grid">
        {/* Backup Card */}
        <Card
          style={{ borderRadius: '8px', border: '1px solid #E5E5E5' }}
          title={
            <span style={{ fontWeight: 700, fontSize: '14px', color: '#32373C' }}>
              Sao lưu dữ liệu
            </span>
          }
        >
          <p style={{ color: '#737373', fontSize: '13.5px', lineHeight: 1.7, marginBottom: '16px' }}>
            Hệ thống sẽ tạo bản sao lưu toàn bộ cơ sở dữ liệu dưới dạng file JSON. Bạn nên sao lưu định kỳ để đảm bảo an toàn dữ liệu.
          </p>
          <Alert
            type="info"
            message="Khuyến nghị"
            description="Nên sao lưu ít nhất 1 lần mỗi tuần. File sao lưu JSON có thể dùng để phục hồi dữ liệu khi cần thiết."
            style={{ borderRadius: '8px', marginBottom: '20px' }}
          />
          <Button
            type="primary"
            icon={<CloudDownloadOutlined />}
            loading={loading}
            onClick={handleBackup}
            size="large"
            style={{ width: '100%', height: '46px', borderRadius: '8px', fontWeight: 700, fontSize: '14px' }}
          >
            {loading ? 'Đang sao lưu...' : 'Bắt đầu sao lưu'}
          </Button>

          {result && (
            <div style={{
              marginTop: '20px', padding: '16px', borderRadius: '8px',
              background: '#ECFDF5', border: '1px solid #A7F3D0',
            }}>
              <div style={{ fontWeight: 700, color: '#059669', fontSize: '14px', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircleFilled /> {result.message}
              </div>
              <Descriptions
                size="small"
                column={1}
                colon={false}
                items={Object.entries(result.details || {}).map(([k, v]) => ({
                  key: k,
                  label: <span style={{ color: '#737373', fontSize: '12.5px' }}>{k}</span>,
                  children: <span style={{ fontWeight: 600, color: '#32373C' }}>{String(v)}</span>,
                }))}
              />
            </div>
          )}
        </Card>

        {/* Right column: System Info + Security */}
        <div className="backup-side-column">
          {/* System Info */}
          <Card
            style={{ borderRadius: '8px', border: '1px solid #E5E5E5' }}
            title={
              <span style={{ fontWeight: 700, fontSize: '14px', color: '#32373C' }}>
                Thông tin hệ thống
              </span>
            }
          >
            <Descriptions
              size="small"
              column={2}
              bordered
              items={[
                { key: 'tech', label: 'Backend', children: 'ASP.NET Core 9.0' },
                { key: 'fe', label: 'Frontend', children: 'React + Vite' },
                { key: 'ui', label: 'UI', children: 'Ant Design v5' },
                { key: 'db', label: 'Cơ sở dữ liệu', children: 'SQLite' },
                { key: 'ver', label: 'Phiên bản', children: '1.0.0' },
                { key: 'date', label: 'Ngày triển khai', children: new Date().toLocaleDateString('vi-VN') },
              ]}
            />
          </Card>

          {/* Security */}
          <Card
            style={{ borderRadius: '8px', border: '1px solid #E5E5E5' }}
            title={
              <span style={{ fontWeight: 700, fontSize: '14px', color: '#32373C' }}>
                Bảo mật
              </span>
            }
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                { icon: '🔐', text: 'Dữ liệu được bảo vệ theo quy định pháp luật' },
                { icon: '👤', text: 'Phân quyền 3 cấp: Quản trị viên, Cán bộ NK, Cán bộ HK' },
                { icon: '📋', text: 'Nhật ký hoạt động được ghi lại đầy đủ' },
                { icon: '🔄', text: 'Hỗ trợ sao lưu và phục hồi dữ liệu' },
                { icon: '🛡️', text: 'Xác thực người dùng qua JWT token' },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                  <span style={{ fontSize: '16px', flexShrink: 0 }}>{item.icon}</span>
                  <span style={{ fontSize: '13.5px', color: '#737373', lineHeight: 1.6 }}>{item.text}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
