import prisma from '../config/database.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// GET /api/centros-custo - Listar todos centros de custo
export const getCentrosCusto = asyncHandler(async (req, res) => {
  const { ativo } = req.query;

  const where = {};
  if (ativo !== undefined) where.ativo = ativo === 'true';

  const centrosCusto = await prisma.centroCusto.findMany({
    where,
    include: {
      _count: {
        select: {
          transacoes: true,
          metas: true,
        },
      },
    },
    orderBy: { nome: 'asc' },
  });

  res.json({
    success: true,
    count: centrosCusto.length,
    data: centrosCusto,
  });
});

// GET /api/centros-custo/:id - Buscar centro de custo por ID
export const getCentroCustoById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const centroCusto = await prisma.centroCusto.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          transacoes: true,
          metas: true,
        },
      },
    },
  });

  if (!centroCusto) {
    throw ApiError.notFound('Centro de custo não encontrado');
  }

  res.json({
    success: true,
    data: centroCusto,
  });
});

// POST /api/centros-custo - Criar novo centro de custo
export const createCentroCusto = asyncHandler(async (req, res) => {
  const { nome, descricao, cor } = req.body;

  if (!nome) {
    throw ApiError.badRequest('Nome é obrigatório');
  }

  const centroCusto = await prisma.centroCusto.create({
    data: {
      nome,
      descricao,
      cor: cor || '#3B82F6',
    },
  });

  res.status(201).json({
    success: true,
    message: 'Centro de custo criado com sucesso',
    data: centroCusto,
  });
});

// PUT /api/centros-custo/:id - Atualizar centro de custo
export const updateCentroCusto = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { nome, descricao, cor, ativo } = req.body;

  const centroCusto = await prisma.centroCusto.update({
    where: { id },
    data: {
      ...(nome && { nome }),
      ...(descricao !== undefined && { descricao }),
      ...(cor && { cor }),
      ...(ativo !== undefined && { ativo }),
    },
  });

  res.json({
    success: true,
    message: 'Centro de custo atualizado com sucesso',
    data: centroCusto,
  });
});

// DELETE /api/centros-custo/:id - Deletar centro de custo
export const deleteCentroCusto = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Verificar se há transações vinculadas
  const centroCusto = await prisma.centroCusto.findUnique({
    where: { id },
    include: {
      _count: {
        select: { transacoes: true },
      },
    },
  });

  if (!centroCusto) {
    throw ApiError.notFound('Centro de custo não encontrado');
  }

  if (centroCusto._count.transacoes > 0) {
    throw ApiError.badRequest(
      `Não é possível deletar. Existem ${centroCusto._count.transacoes} transações vinculadas a este centro de custo.`
    );
  }

  await prisma.centroCusto.delete({
    where: { id },
  });

  res.json({
    success: true,
    message: 'Centro de custo deletado com sucesso',
  });
});
