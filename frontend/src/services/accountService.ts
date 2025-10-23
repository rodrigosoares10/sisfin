import api from './api';
import { Account, CreateAccountData } from '../types';

export const accountService = {
  async getAll(params?: { active?: boolean }): Promise<{
    accounts: Account[];
    totalBalance: number;
  }> {
    const response = await api.get('/accounts', { params });
    return response.data;
  },

  async getById(id: string): Promise<Account> {
    const response = await api.get<Account>(`/accounts/${id}`);
    return response.data;
  },

  async create(data: CreateAccountData): Promise<Account> {
    const response = await api.post<Account>('/accounts', data);
    return response.data;
  },

  async update(id: string, data: Partial<CreateAccountData>): Promise<Account> {
    const response = await api.put<Account>(`/accounts/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<{ message: string }> {
    const response = await api.delete(`/accounts/${id}`);
    return response.data;
  },
};
