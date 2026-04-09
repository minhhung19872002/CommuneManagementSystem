import React, { useEffect, useMemo, useState } from 'react';
import { Button, Card, Input, Space, Tabs, message } from 'antd';
import { SaveOutlined } from '@ant-design/icons';
import { settingsService } from '../services/settingsService';
import { SystemSetting } from '../types';

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
    <>
      {contextHolder}

      <div style={{ padding: '24px 24px 0' }}>
        <Card
          loading={loading}
          style={{ borderRadius: 20 }}
          title="Tham so he thong"
          extra={
            <Space>
              <Button onClick={() => void load()}>Tai lai</Button>
              <Button type="primary" icon={<SaveOutlined />} loading={saving} onClick={() => void handleSave()}>
                Luu tham so
              </Button>
            </Space>
          }
        >
          <Tabs
            items={Object.entries(groupedItems).map(([category, settings]) => ({
              key: category,
              label: category,
              children: (
                <div style={{ display: 'grid', gap: 16 }}>
                  {settings.map((item) => (
                    <Card key={item.id} size="small" style={{ borderRadius: 16 }}>
                      <div style={{ display: 'grid', gap: 8 }}>
                        <div>
                          <div style={{ fontWeight: 700 }}>{item.key}</div>
                          <div style={{ color: '#667085', fontSize: 13 }}>{item.description}</div>
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
                        <div style={{ color: '#98A2B3', fontSize: 12 }}>
                          Cap nhat boi {item.updatedBy} luc {new Date(item.updatedAt).toLocaleString('vi-VN')}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ),
            }))}
          />
        </Card>
      </div>
    </>
  );
}
