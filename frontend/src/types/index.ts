export enum Role {
  ADMIN = 'ADMIN',
  USER = 'USER',
  MANAGER = 'MANAGER',
}

export enum AccountType {
  CHECKING = 'CHECKING',
  SAVINGS = 'SAVINGS',
  INVESTMENT = 'INVESTMENT',
  CASH = 'CASH',
  CREDIT_CARD = 'CREDIT_CARD',
}

export enum CategoryType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE',
}

export enum TransactionType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE',
  TRANSFER = 'TRANSFER',
}

export enum Period {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  YEARLY = 'YEARLY',
}

export enum GoalStatus {
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  balance: number;
  initialBalance: number;
  description?: string;
  active: boolean;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  type: CategoryType;
  color?: string;
  icon?: string;
  description?: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: TransactionType;
  date: string;
  isPaid: boolean;
  isRecurring: boolean;
  categoryId: string;
  category?: Category;
  accountFromId?: string;
  accountFrom?: Account;
  accountToId?: string;
  accountTo?: Account;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Budget {
  id: string;
  name: string;
  amount: number;
  spent: number;
  period: Period;
  startDate: string;
  endDate: string;
  categoryId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Goal {
  id: string;
  name: string;
  description?: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  status: GoalStatus;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  transactionsCount: number;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
}

export interface CreateTransactionData {
  description: string;
  amount: number;
  type: TransactionType;
  date: string;
  isPaid: boolean;
  isRecurring: boolean;
  categoryId: string;
  accountFromId?: string;
  accountToId?: string;
}

export interface CreateAccountData {
  name: string;
  type: AccountType;
  initialBalance: number;
  description?: string;
}

export interface CreateCategoryData {
  name: string;
  type: CategoryType;
  color?: string;
  icon?: string;
  description?: string;
}
