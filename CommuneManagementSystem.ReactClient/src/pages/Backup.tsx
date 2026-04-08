import React, { useState } from 'react';
import { Alert, Button, Card, Descriptions, message } from 'antd';
import { CheckCircleFilled, CloudDownloadOutlined } from '@ant-design/icons';
import { userService } from '../services/userService';

export default function Backup() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [messageApi, contextHolder] = message.useMessage();

  const handleBackup = async () => {
    setLoading(true);

    try {
      const response = await userService.backup();
      setResult(response.data);
      messageApi.success('Sao lưu dữ liệu thành công.');
    } catch {
      messageApi.error('Sao lưu thất bại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-stack">
      {contextHolder}

      <section className="page-hero">
        <div>
          <p className="page-kicker">An toàn dữ liệu</p>
          <h1 className="page-title">Sao lưu và phục hồi</h1>
          <p className="page-subtitle">Quản lý điểm sao lưu hệ thống và đảm bảo khả năng khôi phục khi cần thiết.</p>
        </div>
      </section>

      <div className="backup-grid">
        <Card title="Sao lưu dữ liệu">
          <p className="text-sm leading-7 text-[#61748f]">
            Hệ thống sẽ tạo bản sao lưu toàn bộ cơ sở dữ liệu dưới dạng file JSON. Nên thực hiện định kỳ để
            bảo toàn dữ liệu nghiệp vụ và sẵn sàng cho các kịch bản khôi phục.
          </p>

          <Alert
            type="info"
            message="Khuyến nghị"
            description="Nên sao lưu ít nhất 1 lần mỗi tuần. File JSON xuất ra có thể dùng cho quy trình kiểm tra và phục hồi nội bộ."
            style={{ margin: '20px 0 24px' }}
          />

          <Button
            type="primary"
            icon={<CloudDownloadOutlined />}
            loading={loading}
            onClick={handleBackup}
            className="!h-12 !w-full !rounded-2xl"
          >
            {loading ? 'Đang sao lưu...' : 'Bắt đầu sao lưu'}
          </Button>

          {result && (
            <div className="mt-5 rounded-[22px] border border-[#bbf7d0] bg-[#ecfdf5] p-4">
              <div className="mb-3 flex items-center gap-2 text-sm font-extrabold text-[#059669]">
                <CheckCircleFilled />
                {result.message}
              </div>

              <Descriptions
                size="small"
                column={1}
                colon={false}
                items={Object.entries(result.details || {}).map(([key, value]) => ({
                  key,
                  label: <span className="text-xs text-[#61748f]">{key}</span>,
                  children: <span className="font-semibold text-[#1d2736]">{String(value)}</span>,
                }))}
              />
            </div>
          )}
        </Card>

        <div className="backup-side-column">
          <Card title="Thông tin hệ thống">
            <Descriptions
              size="small"
              column={2}
              bordered
              items={[
                { key: 'tech', label: 'Backend', children: 'ASP.NET Core 9.0' },
                { key: 'fe', label: 'Frontend', children: 'React + Vite' },
                { key: 'ui', label: 'UI', children: 'Ant Design v6' },
                { key: 'db', label: 'Cơ sở dữ liệu', children: 'SQLite' },
                { key: 'ver', label: 'Phiên bản', children: '1.0.0' },
                { key: 'date', label: 'Ngày kiểm tra', children: new Date().toLocaleDateString('vi-VN') },
              ]}
            />
          </Card>

          <Card title="Lớp bảo vệ hiện tại">
            <div className="space-y-3">
              {[
                'Dữ liệu được quản lý theo phân quyền tài khoản.',
                'Hoạt động nghiệp vụ được ghi vết trong nhật ký hệ thống.',
                'Cho phép sao lưu nhanh để phục vụ kiểm tra và khôi phục.',
                'Xác thực phiên làm việc dựa trên JWT token.',
              ].map((item) => (
                <div key={item} className="rounded-[18px] border border-[#e3ebf6] bg-[#f8fbff] px-4 py-3 text-sm leading-6 text-[#61748f]">
                  {item}
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
