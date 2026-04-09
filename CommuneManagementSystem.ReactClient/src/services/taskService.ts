import api from './api';
import { TaskItem, TaskKpiStats, WorkItem } from '../types';

export const taskService = {
  getTasks: (params?: { search?: string; status?: string; priority?: string; assignedUserId?: number }) =>
    api.get<TaskItem[]>('/tasks', { params }),
  createTask: (data: { title: string; description: string; priority: string; status: string; startDate: string; dueDate: string; progress: number; assignedUserId?: number | null }) =>
    api.post<TaskItem>('/tasks', data),
  updateTask: (id: number, data: { title: string; description: string; priority: string; status: string; startDate: string; dueDate: string; progress: number; assignedUserId?: number | null }) =>
    api.put<TaskItem>(`/tasks/${id}`, data),
  deleteTask: (id: number) => api.delete(`/tasks/${id}`),

  getWorks: (params?: { search?: string; status?: string; priority?: string; fieldCode?: string; unitCode?: string; assignedUserId?: number }) =>
    api.get<WorkItem[]>('/tasks/works', { params }),
  createWork: (data: { title: string; description: string; fieldCode: string; unitCode: string; priority: string; status: string; startDate: string; dueDate: string; progress: number; assignedUserId?: number | null }) =>
    api.post<WorkItem>('/tasks/works', data),
  updateWork: (id: number, data: { title: string; description: string; fieldCode: string; unitCode: string; priority: string; status: string; startDate: string; dueDate: string; progress: number; assignedUserId?: number | null }) =>
    api.put<WorkItem>(`/tasks/works/${id}`, data),
  deleteWork: (id: number) => api.delete(`/tasks/works/${id}`),

  getKpiStats: () => api.get<TaskKpiStats>('/tasks/kpi-stats'),
};
