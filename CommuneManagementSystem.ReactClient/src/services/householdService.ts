import api from './api';
import { Household, Person } from '../types';

export const householdService = {
  getAll: (search?: string, status?: string) =>
    api.get<Household[]>('/households', { params: { search, status } }),
  getById: (id: number) => api.get<Household>(`/households/${id}`),
  getMembers: (id: number) => api.get<Person[]>(`/households/${id}/members`),
  create: (data: any) => api.post<Household>('/households', data),
  update: (id: number, data: any) => api.put<Household>(`/households/${id}`, data),
  delete: (id: number) => api.delete(`/households/${id}`),
  split: (data: any) => api.post('/households/split', data),
  addMember: (data: { householdId: number; personId: number; relationshipToHead: string }) =>
    api.post('/households/add-member', data),
  move: (data: { householdId: number; movedTo: string; moveDate: string }) =>
    api.post('/households/move', data),
};