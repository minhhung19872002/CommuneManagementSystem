import api from './api';
import { Person, BirthRecord, DeathRecord, PersonDocument } from '../types';

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
  getDocuments: (personId: number) => api.get<PersonDocument[]>(`/persons/${personId}/documents`),
  uploadDocument: (personId: number, file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    return api.post<PersonDocument>(`/persons/${personId}/documents`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  deleteDocument: (documentId: number) => api.delete(`/persons/documents/${documentId}`),
  downloadDocument: (documentId: number) =>
    api.get<Blob>(`/persons/documents/${documentId}/download`, { responseType: 'blob' }),
};
