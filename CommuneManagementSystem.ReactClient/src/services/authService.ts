import api from './api';
import { AppUser, LoginResponse, SystemLog } from '../types';

export const authService = {
  login: (username: string, password: string) =>
    api.post<LoginResponse>('/auth/login', { username, password }),
  getMe: () => api.get<LoginResponse>('/auth/me'),
  updateProfile: (data: { fullName: string; email?: string; phoneNumber?: string }) =>
    api.put<LoginResponse>('/auth/profile', data),
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.post('/auth/change-password', data),
  resetPassword: (data: { username: string; fullName?: string; newPassword: string }) =>
    api.post('/auth/reset-password', data),
  getLoginHistory: (params?: { top?: number; all?: boolean }) =>
    api.get<SystemLog[]>('/auth/login-history', { params }),
  getDirectory: () => api.get<AppUser[]>('/auth/directory'),
};
