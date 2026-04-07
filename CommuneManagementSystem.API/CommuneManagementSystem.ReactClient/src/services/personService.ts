import api from './api';
import { Person, BirthRecord, DeathRecord } from '../types';

export const personService = {
  getAll: (search?: string, status?: string, householdId?: number) =>
    api.get<Person[]>('/persons', { params: { search, status, householdId } }),
  getById: (id: number) => api.get<Person>(`/persons/${id}`),
  create: (data: any) => api.post<Person>('/persons', data),
  update: (id: number, data: any) => api.put<Person>(`/persons/${id}`, data),
  delete: (id: number) => api.delete(`/persons/${id}`),
  registerBirth: (data: any) => api.post<BirthRecord>('/persons/birth', data),
  getBirthRecords: () => api.get<BirthRecord[]>('/persons/birth'),
  registerDeath: (data: any) => api.post<DeathRecord>('/persons/death', data),
  getDeathRecords: () => api.get<DeathRecord[]>('/persons/death'),
};