import api from './api';
import { UserGroup } from '../types';

export const userGroupService = {
  getAll: () => api.get<UserGroup[]>('/usergroups'),
  create: (data: { name: string; description: string; userIds: number[] }) =>
    api.post<UserGroup>('/usergroups', data),
  update: (id: number, data: { name: string; description: string; userIds: number[] }) =>
    api.put<UserGroup>(`/usergroups/${id}`, data),
  delete: (id: number) => api.delete(`/usergroups/${id}`),
};
