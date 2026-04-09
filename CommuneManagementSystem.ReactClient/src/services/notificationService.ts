import api from './api';
import { NotificationItem } from '../types';

export const notificationService = {
  getAll: (params?: { search?: string; status?: string; mine?: boolean }) =>
    api.get<NotificationItem[]>('/notifications', { params }),
  create: (data: { title: string; summary: string; content: string; audienceRole?: string | null }) =>
    api.post<NotificationItem>('/notifications', data),
  update: (id: number, data: { title: string; summary: string; content: string; audienceRole?: string | null }) =>
    api.put<NotificationItem>(`/notifications/${id}`, data),
  review: (id: number, data: { status: string; reviewNote?: string | null }) =>
    api.post<NotificationItem>(`/notifications/${id}/review`, data),
  delete: (id: number) => api.delete(`/notifications/${id}`),
};
