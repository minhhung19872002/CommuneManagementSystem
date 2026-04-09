import api from './api';
import { SystemSetting } from '../types';

export const settingsService = {
  getAll: () => api.get<SystemSetting[]>('/systemsettings'),
  saveAll: (items: Array<{ key: string; value: string; category: string; description: string }>) =>
    api.put<SystemSetting[]>('/systemsettings', items),
};
