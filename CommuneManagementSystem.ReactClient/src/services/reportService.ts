import api from './api';
import { TempResidence, TempAbsence, PopulationStats } from '../types';

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
  getStatistics: () => api.get<PopulationStats>('/reports/statistics'),
  exportHouseholds: () => api.get('/reports/households'),
  exportPopulation: (status?: string, gender?: string) =>
    api.get('/reports/population', { params: { status, gender } }),
  exportTempResidence: () => api.get('/reports/temporary-residence'),
  exportTempAbsence: () => api.get('/reports/temporary-absence'),
};