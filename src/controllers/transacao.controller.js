import prisma from '../config/database.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// GET /api/transacoes - Listar todas transações
export const getTransacoes = asyncHandler(async (req, res) => {
  const {
    tipo,
    statusPagamento,
    centroCustoId,
    clienteId,
    produtoId,
    recorrente,
    dataInicio,
    dataFim,
    page = 1,
    limit = 50,
  } = req.query;

  const where = {};
  if (tipo) where.tipo = tipo;
  if (statusPagamento) where.statusPagamento = statusPagamento;
  if (centroCustoId) where.centroCustoId = centroCustoId;
  if (clienteId) where.clienteId = clienteId;
  if (produtoId) where.produtoId = produtoId;
  if (recorrente !== undefined) where.recorrente = recorrente === 'true';

  // Filtro de data
  if (dataInicio || dataFim) {
    where.data = {};
    if (dataInicio) where.data.gte = new Date(dataInicio);
    if (dataFim) where.data.lte = new Date(dataFim);
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [transacoes, total] = await prisma.$transaction([
    prisma.transacao.findMany({
      where,
      include: {
        centroCusto: {
          select: { id: true, nome: true, cor: true },
        },
        cliente: {
          select: { id: true, nome: true, email: true },
        },
        produto: {
          select: { id: true, nome: true, tipo: true, valor: true },
        },
      },
      orderBy: { data: 'desc' },
      skip,
      take: parseInt(limit),
    }),
    prisma.transacao.count({ where }),
  ]);

  res.json({
    success: true,
    count: transacoes.length,
    total,
    page: parseInt(page),
    totalPages: Math.ceil(total / parseInt(limit)),
    data: transacoes,
  });
});

// GET /api/transacoes/resumo - Resumo financeiro
export const getResumoTransacoes = asyncHandler(async (req, res) => {
  const { dataInicio, dataFim, centroCustoId } = req.query;

  const where = {};
  if (dataInicio || dataFim) {
    where.data = {};
    if (dataInicio) where.data.gte = new Date(dataInicio);
    if (dataFim) where.data.lte = new Date(dataFim);
  }
  if (centroCustoId) where.centroCustoId = centroCustoId;

  const [receitas, despesas] = await Promise.all([
    prisma.transacao.aggregate({
      where: { ...where, tipo: 'RECEITA' },
      _sum: { valor: true },
      _count: true,
    }),
    prisma.transacao.aggregate({
      where: { ...where, tipo: 'DESPESA' },
      _sum: { valor: true },
      _count: true,
    }),
  ]);

  const totalReceitas = Number(receitas._sum.valor || 0);
  const totalDespesas = Number(despesas._sum.valor || 0);
  const saldo = totalReceitas - totalDespesas;

  res.json({
    success: true,
    data: {
      receitas: {
        total: totalReceitas,
        count: receitas._count,
      },
      despesas: {
        total: totalDespesas,
        count: despesas._count,
      },
      saldo,
    },
  });
});

// GET /api/transacoes/:id - Buscar transação por ID
export const getTransacaoById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const transacao = await prisma.transacao.findUnique({
    where: { id },
    include: {
      centroCusto: true,
      cliente: true,
      produto: true,
    },
  });

  if (!transacao) {
    throw ApiError.notFound('Transação não encontrada');
  }

  res.json({
    success: true,
    data: transacao,
  });
});

// POST /api/transacoes - Criar nova transação
export const createTransacao = asyncHandler(async (req, res) => {
  const {
    tipo,
    valor,
    descricao,
    data,
    categoria,
    recorrente,
    frequencia,
    statusPagamento,
    metodoPagamento,
    anexoUrl,
    centroCustoId,
    clienteId,
    produtoId,
  } = req.body;

  // Validações
  if (!tipo || valor === undefined || !descricao || !centroCustoId || !metodoPagamento) {
    throw ApiError.badRequest(
      'Tipo, valor, descrição, centro de custo e método de pagamento são obrigatórios'
    );
  }

  // Verificar se centro de custo existe
  const centroCusto = await prisma.centroCusto.findUnique({
    where: { id: centroCustoId },
  });
  if (!centroCusto) {
    throw ApiError.notFound('Centro de custo não encontrado');
  }

  const transacao = await prisma.transacao.create({
    data: {
      tipo,
      valor,
      descricao,
      data: data ? new Date(data) : new Date(),
      categoria,
      recorrente: recorrente || false,
      frequencia: recorrente ? frequencia : null,
      statusPagamento: statusPagamento || 'PENDENTE',
      metodoPagamento,
      anexoUrl,
      centroCustoId,
      clienteId,
      produtoId,
    },
    include: {
      centroCusto: true,
      cliente: true,
      produto: true,
    },
  });

  res.status(201).json({
    success: true,
    message: 'Transação criada com sucesso',
    data: transacao,
  });
});

// PUT /api/transacoes/:id - Atualizar transação
export const updateTransacao = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  const transacao = await prisma.transacao.update({
    where: { id },
    data: {
      ...(updateData.tipo && { tipo: updateData.tipo }),
      ...(updateData.valor !== undefined && { valor: updateData.valor }),
      ...(updateData.descricao && { descricao: updateData.descricao }),
      ...(updateData.data && { data: new Date(updateData.data) }),
      ...(updateData.categoria !== undefined && { categoria: updateData.categoria }),
      ...(updateData.recorrente !== undefined && { recorrente: updateData.recorrente }),
      ...(updateData.frequencia !== undefined && { frequencia: updateData.frequencia }),
      ...(updateData.statusPagamento && { statusPagamento: updateData.statusPagamento }),
      ...(updateData.metodoPagamento && { metodoPagamento: updateData.metodoPagamento }),
      ...(updateData.anexoUrl !== undefined && { anexoUrl: updateData.anexoUrl }),
      ...(updateData.centroCustoId && { centroCustoId: updateData.centroCustoId }),
      ...(updateData.clienteId !== undefined && { clienteId: updateData.clienteId }),
      ...(updateData.produtoId !== undefined && { produtoId: updateData.produtoId }),
    },
    include: {
      centroCusto: true,
      cliente: true,
      produto: true,
    },
  });

  res.json({
    success: true,
    message: 'Transação atualizada com sucesso',
    data: transacao,
  });
});

// DELETE /api/transacoes/:id - Deletar transação
export const deleteTransacao = asyncHandler(async (req, res) => {
  const { id } = req.params;

  await prisma.transacao.delete({
    where: { id },
  });

  res.json({
    success: true,
    message: 'Transação deletada com sucesso',
  });
});
