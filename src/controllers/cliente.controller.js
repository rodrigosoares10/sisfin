import prisma from '../config/database.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// GET /api/clientes - Listar todos clientes
export const getClientes = asyncHandler(async (req, res) => {
  const { ativo, tipo } = req.query;

  const where = {};
  if (ativo !== undefined) where.ativo = ativo === 'true';
  if (tipo) where.tipo = tipo;

  const clientes = await prisma.cliente.findMany({
    where,
    include: {
      _count: {
        select: { transacoes: true },
      },
    },
    orderBy: { nome: 'asc' },
  });

  res.json({
    success: true,
    count: clientes.length,
    data: clientes,
  });
});

// GET /api/clientes/:id - Buscar cliente por ID
export const getClienteById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { includeTransacoes } = req.query;

  const cliente = await prisma.cliente.findUnique({
    where: { id },
    include: {
      _count: {
        select: { transacoes: true },
      },
      ...(includeTransacoes === 'true' && {
        transacoes: {
          orderBy: { data: 'desc' },
          take: 10,
        },
      }),
    },
  });

  if (!cliente) {
    throw ApiError.notFound('Cliente não encontrado');
  }

  res.json({
    success: true,
    data: cliente,
  });
});

// POST /api/clientes - Criar novo cliente
export const createCliente = asyncHandler(async (req, res) => {
  const { nome, email, telefone, empresa, tipo } = req.body;

  if (!nome) {
    throw ApiError.badRequest('Nome é obrigatório');
  }

  const cliente = await prisma.cliente.create({
    data: {
      nome,
      email,
      telefone,
      empresa,
      tipo: tipo || 'PESSOA_FISICA',
    },
  });

  res.status(201).json({
    success: true,
    message: 'Cliente criado com sucesso',
    data: cliente,
  });
});

// PUT /api/clientes/:id - Atualizar cliente
export const updateCliente = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { nome, email, telefone, empresa, tipo, ativo } = req.body;

  const cliente = await prisma.cliente.update({
    where: { id },
    data: {
      ...(nome && { nome }),
      ...(email !== undefined && { email }),
      ...(telefone !== undefined && { telefone }),
      ...(empresa !== undefined && { empresa }),
      ...(tipo && { tipo }),
      ...(ativo !== undefined && { ativo }),
    },
  });

  res.json({
    success: true,
    message: 'Cliente atualizado com sucesso',
    data: cliente,
  });
});

// DELETE /api/clientes/:id - Deletar cliente
export const deleteCliente = asyncHandler(async (req, res) => {
  const { id } = req.params;

  await prisma.cliente.delete({
    where: { id },
  });

  res.json({
    success: true,
    message: 'Cliente deletado com sucesso. Transações relacionadas foram desvinculadas.',
  });
});
