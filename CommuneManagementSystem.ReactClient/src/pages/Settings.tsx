import React, { useEffect, useMemo, useState } from 'react';
import { Button, Card, Input, Space, Tabs, message } from 'antd';
import { SaveOutlined } from '@ant-design/icons';
import { settingsService } from '../services/settingsService';
import { SystemSetting } from '../types';
import './Settings.css';

type EditableSetting = SystemSetting & { draftValue: string };

export default function Settings() {
  const [items, setItems] = useState<EditableSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    void load();
  }, []);

  const load = async () => {
    setLoading(true);
    try {
      const response = await settingsService.getAll();
      setItems(response.data.map((item) => ({ ...item, draftValue: item.value })));
    } catch {
      messageApi.error('Khong the tai tham so he thong.');
    } finally {
      setLoading(false);
    }
  };

  const groupedItems = useMemo(() => {
    return items.reduce<Record<string, EditableSetting[]>>((accumulator, item) => {
      accumulator[item.category] = accumulator[item.category] || [];
      accumulator[item.category].push(item);
      return accumulator;
    }, {});
  }, [items]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = items.map((item) => ({
        key: item.key,
        value: item.draftValue,
        category: item.category,
        description: item.description,
      }));
      const response = await settingsService.saveAll(payload);
      setItems(response.data.map((item) => ({ ...item, draftValue: item.value })));
      messageApi.success('Da cap nhat tham so he thong.');
    } catch (error: any) {
      messageApi.error(error?.response?.data?.message || 'Khong the luu tham so he thong.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="civic-page page-wrapper">
      {contextHolder}

      <div className="civic-page-hero">
        <div className="civic-page-hero__inner">
          <div className="civic-page-hero__left">
            <div className="civic-page-hero__eyebrow">Hệ thống / Cài đặt</div>
            <h1 className="civic-page-hero__title">Tham số hệ thống</h1>
            <p className="civic-page-hero__subtitle">
              Quản lý và cập nhật các tham số cấu hình cho hệ thống CommuneHub.
            </p>
          </div>
          <div className="civic-page-hero__actions">
            <Button onClick={() => void load()}>Tải lại</Button>
            <Button type="primary" icon={<SaveOutlined />} loading={saving} onClick={() => void handleSave()}>
              Lưu tham số
            </Button>
          </div>
        </div>
      </div>

      <Card className="civic-section" loading={loading}>
        <Tabs
            items={Object.entries(groupedItems).map(([category, settings]) => ({
              key: category,
              label: category,
              children: (
                <div style={{ display: 'grid', gap: 16 }}>
                  {settings.map((item) => (
                    <div key={item.id} className="settings-item-card" style={{ padding: '14px 16px' }}>
                      <div>
                        <div className="settings-item__key">{item.key}</div>
                        <div className="settings-item__desc">{item.description}</div>
                      </div>
                      <Input
                        value={item.draftValue}
                        onChange={(event) =>
                          setItems((current) =>
                            current.map((setting) =>
                              setting.id === item.id ? { ...setting, draftValue: event.target.value } : setting,
                            ),
                          )
                        }
                      />
                      <div className="settings-item__meta">
                        Cập nhật bởi {item.updatedBy} lúc {new Date(item.updatedAt).toLocaleString('vi-VN')}
                      </div>
                    </div>
                  ))}
                </div>
              ),
            }))}
          />
        </Card>
    </div>
  );
}
