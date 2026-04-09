import api from './api';
import { CatalogItem } from '../types';

export const catalogService = {
  getAll: (type?: string) => api.get<CatalogItem[]>('/catalogs', { params: { type } }),
  create: (data: { type: string; code: string; name: string; description?: string }) =>
    api.post<CatalogItem>('/catalogs', data),
  update: (id: number, data: { code: string; name: string; description?: string; isActive: boolean }) =>
    api.put<CatalogItem>(`/catalogs/${id}`, data),
  delete: (id: number) => api.delete(`/catalogs/${id}`),
};
