import api from './api';
import { AppUser, SystemLog } from '../types';

export const userService = {
  getAll: () => api.get<AppUser[]>('/users'),
  getById: (id: number) => api.get<AppUser>(`/users/${id}`),
  create: (data: any) => api.post<AppUser>('/users', data),
  update: (id: number, data: any) => api.put<AppUser>(`/users/${id}`, data),
  delete: (id: number) => api.delete(`/users/${id}`),
  backup: () => api.get('/users/backup'),
  exportBackup: () => api.get<Blob>('/users/backup/export', { responseType: 'blob' }),
  restoreBackup: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/users/backup/restore', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  getLogs: (top = 50) => api.get<SystemLog[]>('/users/logs', { params: { top } }),
};
