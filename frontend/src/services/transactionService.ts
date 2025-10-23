import api from './api';
import { Transaction, CreateTransactionData, DashboardStats } from '../types';

export const transactionService = {
  async getAll(params?: {
    startDate?: string;
    endDate?: string;
    type?: string;
    categoryId?: string;
    isPaid?: boolean;
  }): Promise<Transaction[]> {
    const response = await api.get<Transaction[]>('/transactions', { params });
    return response.data;
  },

  async getById(id: string): Promise<Transaction> {
    const response = await api.get<Transaction>(`/transactions/${id}`);
    return response.data;
  },

  async create(data: CreateTransactionData): Promise<Transaction> {
    const response = await api.post<Transaction>('/transactions', data);
    return response.data;
  },

  async update(id: string, data: Partial<CreateTransactionData>): Promise<Transaction> {
    const response = await api.put<Transaction>(`/transactions/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<{ message: string }> {
    const response = await api.delete(`/transactions/${id}`);
    return response.data;
  },

  async getStats(params?: {
    startDate?: string;
    endDate?: string;
  }): Promise<DashboardStats> {
    const response = await api.get<DashboardStats>('/transactions/stats', { params });
    return response.data;
  },
};
