import api from './api';
import { BaseSalaryRate, HrPayrollStats, PayrollEntry, SalaryTransfer, StaffProfile } from '../types';

export const hrService = {
  getStaffs: (params?: { search?: string; status?: string }) =>
    api.get<StaffProfile[]>('/humanresources/staffs', { params }),
  createStaff: (data: { userId?: number | null; fullName: string; position: string; department: string; salaryCoefficient: number; bankName: string; bankAccount: string; email: string; phoneNumber: string; status: string }) =>
    api.post<StaffProfile>('/humanresources/staffs', data),
  updateStaff: (id: number, data: { userId?: number | null; fullName: string; position: string; department: string; salaryCoefficient: number; bankName: string; bankAccount: string; email: string; phoneNumber: string; status: string }) =>
    api.put<StaffProfile>(`/humanresources/staffs/${id}`, data),
  deleteStaff: (id: number) => api.delete(`/humanresources/staffs/${id}`),

  getBaseSalaries: () => api.get<BaseSalaryRate[]>('/humanresources/base-salaries'),
  createBaseSalary: (data: { amount: number; effectiveDate: string; note: string; isActive: boolean }) =>
    api.post<BaseSalaryRate>('/humanresources/base-salaries', data),
  updateBaseSalary: (id: number, data: { amount: number; effectiveDate: string; note: string; isActive: boolean }) =>
    api.put<BaseSalaryRate>(`/humanresources/base-salaries/${id}`, data),
  deleteBaseSalary: (id: number) => api.delete(`/humanresources/base-salaries/${id}`),

  getPayrolls: (params?: { month?: string; status?: string }) =>
    api.get<PayrollEntry[]>('/humanresources/payrolls', { params }),
  createPayroll: (data: { staffProfileId: number; month: string; allowance: number; bonus: number; deduction: number; status: string }) =>
    api.post<PayrollEntry>('/humanresources/payrolls', data),
  updatePayroll: (id: number, data: { staffProfileId: number; month: string; allowance: number; bonus: number; deduction: number; status: string }) =>
    api.put<PayrollEntry>(`/humanresources/payrolls/${id}`, data),
  deletePayroll: (id: number) => api.delete(`/humanresources/payrolls/${id}`),

  getTransfers: (params?: { status?: string }) =>
    api.get<SalaryTransfer[]>('/humanresources/transfers', { params }),
  createTransfer: (data: { payrollEntryId: number; transferDate: string; status: string; referenceCode?: string | null; note?: string | null }) =>
    api.post<SalaryTransfer>('/humanresources/transfers', data),
  updateTransfer: (id: number, data: { payrollEntryId: number; transferDate: string; status: string; referenceCode?: string | null; note?: string | null }) =>
    api.put<SalaryTransfer>(`/humanresources/transfers/${id}`, data),
  deleteTransfer: (id: number) => api.delete(`/humanresources/transfers/${id}`),

  getStats: () => api.get<HrPayrollStats>('/humanresources/stats'),
};
