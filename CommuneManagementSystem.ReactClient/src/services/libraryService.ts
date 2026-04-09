import api from './api';
import { LibraryDocument } from '../types';

export const libraryService = {
  getAll: (params?: { search?: string; category?: string }) =>
    api.get<LibraryDocument[]>('/librarydocuments', { params }),
  create: (data: { title: string; description: string; category: string; file: File }) => {
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('description', data.description);
    formData.append('category', data.category);
    formData.append('file', data.file);

    return api.post<LibraryDocument>('/librarydocuments', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  update: (id: number, data: { title: string; description: string; category: string }) =>
    api.put<LibraryDocument>(`/librarydocuments/${id}`, data),
  download: (id: number) => api.get<Blob>(`/librarydocuments/${id}/download`, { responseType: 'blob' }),
  delete: (id: number) => api.delete(`/librarydocuments/${id}`),
};
