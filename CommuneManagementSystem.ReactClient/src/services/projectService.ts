import api from './api';
import { ProjectItem, ProjectProposalStats, ProposalItem } from '../types';

export const projectService = {
  getProjects: (params?: { search?: string; status?: string }) =>
    api.get<ProjectItem[]>('/projects', { params }),
  createProject: (data: { name: string; description: string; sponsor: string; budget: number; startDate: string; endDate: string; progress: number; status: string; managerUserId?: number | null }) =>
    api.post<ProjectItem>('/projects', data),
  updateProject: (id: number, data: { name: string; description: string; sponsor: string; budget: number; startDate: string; endDate: string; progress: number; status: string; managerUserId?: number | null }) =>
    api.put<ProjectItem>(`/projects/${id}`, data),
  deleteProject: (id: number) => api.delete(`/projects/${id}`),

  getProposals: (params?: { search?: string; status?: string; fieldCode?: string; priority?: string }) =>
    api.get<ProposalItem[]>('/projects/proposals', { params }),
  createProposal: (data: { title: string; content: string; fieldCode: string; priority: string; status: string; reviewNote?: string | null }) =>
    api.post<ProposalItem>('/projects/proposals', data),
  updateProposal: (id: number, data: { title: string; content: string; fieldCode: string; priority: string; status: string; reviewNote?: string | null }) =>
    api.put<ProposalItem>(`/projects/proposals/${id}`, data),
  deleteProposal: (id: number) => api.delete(`/projects/proposals/${id}`),

  getStats: () => api.get<ProjectProposalStats>('/projects/stats'),
};
