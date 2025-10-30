import prisma from '../config/database.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// GET /api/produtos - Listar todos produtos
export const getProdutos = asyncHandler(async (req, res) => {
  const { ativo, tipo } = req.query;

  const where = {};
  if (ativo !== undefined) where.ativo = ativo === 'true';
  if (tipo) where.tipo = tipo;

  const produtos = await prisma.produto.findMany({
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
    count: produtos.length,
    data: produtos,
  });
});

// GET /api/produtos/:id - Buscar produto por ID
export const getProdutoById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const produto = await prisma.produto.findUnique({
    where: { id },
    include: {
      _count: {
        select: { transacoes: true },
      },
    },
  });

  if (!produto) {
    throw ApiError.notFound('Produto não encontrado');
  }

  res.json({
    success: true,
    data: produto,
  });
});

// POST /api/produtos - Criar novo produto
export const createProduto = asyncHandler(async (req, res) => {
  const { nome, tipo, valor, descricao } = req.body;

  if (!nome || !tipo || valor === undefined) {
    throw ApiError.badRequest('Nome, tipo e valor são obrigatórios');
  }

  const produto = await prisma.produto.create({
    data: {
      nome,
      tipo,
      valor,
      descricao,
    },
  });

  res.status(201).json({
    success: true,
    message: 'Produto criado com sucesso',
    data: produto,
  });
});

// PUT /api/produtos/:id - Atualizar produto
export const updateProduto = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { nome, tipo, valor, descricao, ativo } = req.body;

  const produto = await prisma.produto.update({
    where: { id },
    data: {
      ...(nome && { nome }),
      ...(tipo && { tipo }),
      ...(valor !== undefined && { valor }),
      ...(descricao !== undefined && { descricao }),
      ...(ativo !== undefined && { ativo }),
    },
  });

  res.json({
    success: true,
    message: 'Produto atualizado com sucesso',
    data: produto,
  });
});

// DELETE /api/produtos/:id - Deletar produto
export const deleteProduto = asyncHandler(async (req, res) => {
  const { id } = req.params;

  await prisma.produto.delete({
    where: { id },
  });

  res.json({
    success: true,
    message: 'Produto deletado com sucesso. Transações relacionadas foram desvinculadas.',
  });
});
