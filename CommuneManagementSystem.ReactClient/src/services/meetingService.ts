import api from './api';
import { MeetingEvent, WorkScheduleEntry } from '../types';

export const meetingService = {
  getMeetings: (params?: { search?: string; status?: string }) =>
    api.get<MeetingEvent[]>('/meetings', { params }),
  createMeeting: (data: { title: string; agenda: string; location: string; startsAt: string; endsAt: string }) =>
    api.post<MeetingEvent>('/meetings', data),
  updateMeeting: (id: number, data: { title: string; agenda: string; location: string; startsAt: string; endsAt: string; status: string }) =>
    api.put<MeetingEvent>(`/meetings/${id}`, data),
  registerMeeting: (id: number, data: { note?: string | null }) =>
    api.post(`/meetings/${id}/register`, data),
  deleteMeeting: (id: number) => api.delete(`/meetings/${id}`),

  getSchedules: (params?: { fromDate?: string; toDate?: string; search?: string }) =>
    api.get<WorkScheduleEntry[]>('/workschedules', { params }),
  createSchedule: (data: { title: string; content: string; workDate: string; session: string; assignedUserId?: number | null }) =>
    api.post<WorkScheduleEntry>('/workschedules', data),
  updateSchedule: (id: number, data: { title: string; content: string; workDate: string; session: string; assignedUserId?: number | null }) =>
    api.put<WorkScheduleEntry>(`/workschedules/${id}`, data),
  deleteSchedule: (id: number) => api.delete(`/workschedules/${id}`),
};
