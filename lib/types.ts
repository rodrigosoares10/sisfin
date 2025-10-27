import { z } from "zod";

// Enums
export const TipoTransacao = z.enum(["RECEITA", "DESPESA"]);
export const StatusPagamento = z.enum(["PENDENTE", "PAGO", "ATRASADO", "CANCELADO"]);
export const MetodoPagamento = z.enum([
  "DINHEIRO",
  "PIX",
  "CARTAO_CREDITO",
  "CARTAO_DEBITO",
  "BOLETO",
  "TRANSFERENCIA",
  "OUTRO",
]);
export const FrequenciaRecorrencia = z.enum([
  "DIARIA",
  "SEMANAL",
  "QUINZENAL",
  "MENSAL",
  "BIMESTRAL",
  "TRIMESTRAL",
  "SEMESTRAL",
  "ANUAL",
]);

// Transaction types
export interface CentroCusto {
  id: number;
  nome: string;
  descricao: string | null;
  cor: string;
  ativo: boolean;
  criadoEm: Date;
  atualizadoEm: Date;
}

export interface Cliente {
  id: number;
  nome: string;
  email: string | null;
  telefone: string | null;
  tipo: string;
  cpfCnpj: string | null;
  ativo: boolean;
  criadoEm: Date;
  atualizadoEm: Date;
}

export interface Produto {
  id: number;
  nome: string;
  descricao: string | null;
  tipo: string;
  valorBase: number;
  ativo: boolean;
  criadoEm: Date;
  atualizadoEm: Date;
}

export interface Transaction {
  id: number;
  tipo: string;
  descricao: string;
  valor: number;
  data: Date;
  centroCustoId: number;
  centroCusto: CentroCusto;
  clienteId: number | null;
  cliente: Cliente | null;
  produtoId: number | null;
  produto: Produto | null;
  statusPagamento: string;
  metodoPagamento: string;
  dataVencimento: Date | null;
  dataPagamento: Date | null;
  recorrente: boolean;
  frequenciaRecorrencia: string | null;
  observacoes: string | null;
  anexoUrl: string | null;
  criadoEm: Date;
  atualizadoEm: Date;
}

// Form validation schema
export const transactionFormSchema = z.object({
  tipo: TipoTransacao,
  descricao: z.string().min(3, "Descrição deve ter no mínimo 3 caracteres"),
  valor: z.string().min(1, "Valor é obrigatório"),
  data: z.string().min(1, "Data é obrigatória"),
  centroCustoId: z.string().min(1, "Centro de custo é obrigatório"),
  clienteId: z.string().optional(),
  produtoId: z.string().optional(),
  statusPagamento: StatusPagamento,
  metodoPagamento: MetodoPagamento,
  dataVencimento: z.string().optional(),
  dataPagamento: z.string().optional(),
  recorrente: z.boolean().default(false),
  frequenciaRecorrencia: FrequenciaRecorrencia.optional(),
  observacoes: z.string().optional(),
  anexoUrl: z.string().optional(),
});

export type TransactionFormData = z.infer<typeof transactionFormSchema>;

// Filter types
export interface TransactionFilters {
  tipo?: string;
  statusPagamento?: string;
  metodoPagamento?: string;
  centroCustoId?: string;
  dataInicio?: string;
  dataFim?: string;
}

// Pagination
export interface PaginationData {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// API Response
export interface TransactionsResponse {
  data: Transaction[];
  pagination: PaginationData;
}
