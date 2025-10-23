import api from './api';
import { Category, CreateCategoryData } from '../types';

export const categoryService = {
  async getAll(params?: { type?: string }): Promise<Category[]> {
    const response = await api.get<Category[]>('/categories', { params });
    return response.data;
  },

  async getById(id: string): Promise<Category> {
    const response = await api.get<Category>(`/categories/${id}`);
    return response.data;
  },

  async create(data: CreateCategoryData): Promise<Category> {
    const response = await api.post<Category>('/categories', data);
    return response.data;
  },

  async update(id: string, data: Partial<CreateCategoryData>): Promise<Category> {
    const response = await api.put<Category>(`/categories/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<{ message: string }> {
    const response = await api.delete(`/categories/${id}`);
    return response.data;
  },

  async getStats(params?: {
    startDate?: string;
    endDate?: string;
  }): Promise<
    Array<{
      name: string;
      type: string;
      color: string;
      total: number;
      count: number;
    }>
  > {
    const response = await api.get('/categories/stats', { params });
    return response.data;
  },
};
