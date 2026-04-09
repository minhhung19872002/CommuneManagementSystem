import api from './api';
import { TempResidence, TempAbsence, PopulationStats, SystemOverview } from '../types';

export const tempResidenceService = {
  getAll: (status?: string) =>
    api.get<TempResidence[]>('/TemporaryResidences', { params: { status } }),
  getById: (id: number) => api.get<TempResidence>(`/TemporaryResidences/${id}`),
  create: (data: any) => api.post<TempResidence>('/TemporaryResidences', data),
  extend: (id: number, newEndDate: string) =>
    api.put<TempResidence>('/TemporaryResidences/extend', { Id: id, NewEndDate: newEndDate }),
  delete: (id: number) => api.delete(`/TemporaryResidences/${id}`),
};

export const tempAbsenceService = {
  getAll: (status?: string) =>
    api.get<TempAbsence[]>('/TemporaryAbsences', { params: { status } }),
  getById: (id: number) => api.get<TempAbsence>(`/TemporaryAbsences/${id}`),
  create: (data: any) => api.post<TempAbsence>('/TemporaryAbsences', data),
  extend: (id: number, newEndDate: string) =>
    api.put<TempAbsence>('/TemporaryAbsences/extend', { Id: id, NewEndDate: newEndDate }),
  delete: (id: number) => api.delete(`/TemporaryAbsences/${id}`),
};

export const reportService = {
  getOverview: () => api.get<SystemOverview>('/reports/overview'),
  getStatistics: (params?: { personStatus?: string; gender?: string; householdStatus?: string }) =>
    api.get<PopulationStats>('/reports/statistics', { params }),
  exportHouseholds: (params?: { search?: string; status?: string }) =>
    api.get('/reports/households', { params }),
  exportPopulation: (params?: { status?: string; gender?: string; householdId?: number; search?: string }) =>
    api.get('/reports/population', { params }),
  exportTempResidence: (params?: { status?: string; fromDate?: string; toDate?: string }) =>
    api.get('/reports/temporary-residence', { params }),
  exportTempAbsence: (params?: { status?: string; fromDate?: string; toDate?: string }) =>
    api.get('/reports/temporary-absence', { params }),
};
