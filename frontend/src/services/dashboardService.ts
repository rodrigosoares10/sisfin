import api from './api';

interface DashboardOverview {
  summary: {
    totalIncome: number;
    totalExpense: number;
    balance: number;
    totalAccountBalance: number;
  };
  recentTransactions: any[];
  topExpenseCategories: Array<{
    name: string;
    color: string;
    total: number;
  }>;
  accountsCount: number;
  transactionsCount: number;
}

interface MonthlyTrend {
  month: number;
  income: number;
  expense: number;
  balance: number;
}

export const dashboardService = {
  async getOverview(params?: {
    startDate?: string;
    endDate?: string;
  }): Promise<DashboardOverview> {
    const response = await api.get<DashboardOverview>('/dashboard/overview', {
      params,
    });
    return response.data;
  },

  async getMonthlyTrend(year?: number): Promise<MonthlyTrend[]> {
    const response = await api.get<MonthlyTrend[]>('/dashboard/monthly-trend', {
      params: { year },
    });
    return response.data;
  },
};
