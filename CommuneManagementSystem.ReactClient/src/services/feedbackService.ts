import api from './api';
import { FeedbackItem } from '../types';

export const feedbackService = {
  getAll: (params?: { search?: string; status?: string }) =>
    api.get<FeedbackItem[]>('/feedback', { params }),
  create: (data: { fullName: string; contactInfo: string; title: string; content: string }) =>
    api.post<FeedbackItem>('/feedback', data),
  update: (id: number, data: { status: string; resolutionNote?: string | null }) =>
    api.put<FeedbackItem>(`/feedback/${id}`, data),
};
