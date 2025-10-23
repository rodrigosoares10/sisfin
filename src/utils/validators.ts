import Joi from 'joi';

// Auth validators
export const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  nome: Joi.string().min(2).required(),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

export const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string().required(),
});

// Centro de Custo validators
export const createCentroCustoSchema = Joi.object({
  nome: Joi.string().min(2).required(),
  descricao: Joi.string().allow('', null).optional(),
  ativo: Joi.boolean().optional(),
});

export const updateCentroCustoSchema = Joi.object({
  nome: Joi.string().min(2).optional(),
  descricao: Joi.string().allow('', null).optional(),
  ativo: Joi.boolean().optional(),
});

// Transação validators
export const createTransacaoSchema = Joi.object({
  tipo: Joi.string().valid('receita', 'despesa').required(),
  valor: Joi.number().positive().required(),
  descricao: Joi.string().allow('', null).optional(),
  data: Joi.date().required(),
  centroCustoId: Joi.number().integer().positive().optional(),
});

export const updateTransacaoSchema = Joi.object({
  tipo: Joi.string().valid('receita', 'despesa').optional(),
  valor: Joi.number().positive().optional(),
  descricao: Joi.string().allow('', null).optional(),
  data: Joi.date().optional(),
  centroCustoId: Joi.number().integer().positive().optional(),
});

// Produto validators
export const createProdutoSchema = Joi.object({
  nome: Joi.string().min(2).required(),
  descricao: Joi.string().allow('', null).optional(),
  preco: Joi.number().positive().required(),
  precoRecorrente: Joi.number().positive().optional(),
  ativo: Joi.boolean().optional(),
  quantidadeEstoque: Joi.number().integer().min(0).optional(),
});

export const updateProdutoSchema = Joi.object({
  nome: Joi.string().min(2).optional(),
  descricao: Joi.string().allow('', null).optional(),
  preco: Joi.number().positive().optional(),
  precoRecorrente: Joi.number().positive().optional(),
  ativo: Joi.boolean().optional(),
  quantidadeEstoque: Joi.number().integer().min(0).optional(),
});

// Cliente validators
export const createClienteSchema = Joi.object({
  nome: Joi.string().min(2).required(),
  email: Joi.string().email().required(),
  telefone: Joi.string().allow('', null).optional(),
  cpfCnpj: Joi.string().allow('', null).optional(),
  endereco: Joi.string().allow('', null).optional(),
  ativo: Joi.boolean().optional(),
});

export const updateClienteSchema = Joi.object({
  nome: Joi.string().min(2).optional(),
  email: Joi.string().email().optional(),
  telefone: Joi.string().allow('', null).optional(),
  cpfCnpj: Joi.string().allow('', null).optional(),
  endereco: Joi.string().allow('', null).optional(),
  ativo: Joi.boolean().optional(),
});
