export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  nome: string;
}

export interface TokenPayload {
  userId: number;
  email: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface TransacaoQueryParams {
  dataInicio?: string;
  dataFim?: string;
  tipo?: 'receita' | 'despesa';
  centroCustoId?: number;
}

export interface DashboardQueryParams {
  mes?: number;
  ano?: number;
  periodo?: string;
}

export interface FluxoCaixaQueryParams {
  dataInicio: string;
  dataFim: string;
}
