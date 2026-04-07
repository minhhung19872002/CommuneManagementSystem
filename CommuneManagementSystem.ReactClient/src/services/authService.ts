import api from './api';
import { LoginResponse } from '../types';

export const authService = {
  login: (username: string, password: string) =>
    api.post<LoginResponse>('/auth/login', { username, password }),
  getMe: () => api.get<LoginResponse>('/auth/me'),
};