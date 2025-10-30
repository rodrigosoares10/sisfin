import prisma from '../config/database.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// GET /api/metas - Listar todas metas
export const getMetas = asyncHandler(async (req, res) => {
  const { tipo, ano, mes, centroCustoId } = req.query;

  const where = {};
  if (tipo) where.tipo = tipo;
  if (ano) where.ano = parseInt(ano);
  if (mes) where.mes = parseInt(mes);
  if (centroCustoId) where.centroCustoId = centroCustoId;

  const metas = await prisma.meta.findMany({
    where,
    include: {
      centroCusto: {
        select: { id: true, nome: true, cor: true },
      },
    },
    orderBy: [{ ano: 'desc' }, { mes: 'desc' }],
  });

  res.json({
    success: true,
    count: metas.length,
    data: metas,
  });
});

// GET /api/metas/:id - Buscar meta por ID
export const getMetaById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const meta = await prisma.meta.findUnique({
    where: { id },
    include: {
      centroCusto: true,
    },
  });

  if (!meta) {
    throw ApiError.notFound('Meta não encontrada');
  }

  res.json({
    success: true,
    data: meta,
  });
});

// GET /api/metas/:id/progresso - Verificar progresso da meta
export const getProgressoMeta = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const meta = await prisma.meta.findUnique({
    where: { id },
    include: { centroCusto: true },
  });

  if (!meta) {
    throw ApiError.notFound('Meta não encontrada');
  }

  // Calcular data inicial e final do mês
  const dataInicio = new Date(meta.ano, meta.mes - 1, 1);
  const dataFim = new Date(meta.ano, meta.mes, 0, 23, 59, 59);

  const where = {
    data: {
      gte: dataInicio,
      lte: dataFim,
    },
    ...(meta.centroCustoId && { centroCustoId: meta.centroCustoId }),
  };

  let valorRealizado = 0;

  // Calcular valor realizado baseado no tipo de meta
  if (meta.tipo === 'RECEITA') {
    const resultado = await prisma.transacao.aggregate({
      where: { ...where, tipo: 'RECEITA' },
      _sum: { valor: true },
    });
    valorRealizado = Number(resultado._sum.valor || 0);
  } else if (meta.tipo === 'DESPESA') {
    const resultado = await prisma.transacao.aggregate({
      where: { ...where, tipo: 'DESPESA' },
      _sum: { valor: true },
    });
    valorRealizado = Number(resultado._sum.valor || 0);
  } else if (meta.tipo === 'LUCRO') {
    const [receitas, despesas] = await Promise.all([
      prisma.transacao.aggregate({
        where: { ...where, tipo: 'RECEITA' },
        _sum: { valor: true },
      }),
      prisma.transacao.aggregate({
        where: { ...where, tipo: 'DESPESA' },
        _sum: { valor: true },
      }),
    ]);
    valorRealizado = Number(receitas._sum.valor || 0) - Number(despesas._sum.valor || 0);
  }

  const valorMeta = Number(meta.valorMeta);
  const percentual = valorMeta > 0 ? (valorRealizado / valorMeta) * 100 : 0;
  const diferenca = valorRealizado - valorMeta;

  res.json({
    success: true,
    data: {
      meta: {
        id: meta.id,
        tipo: meta.tipo,
        valorMeta,
        mes: meta.mes,
        ano: meta.ano,
        centroCusto: meta.centroCusto,
      },
      progresso: {
        valorRealizado,
        percentual: Math.round(percentual * 100) / 100,
        diferenca,
        atingida: valorRealizado >= valorMeta,
      },
    },
  });
});

// POST /api/metas - Criar nova meta
export const createMeta = asyncHandler(async (req, res) => {
  const { tipo, valorMeta, mes, ano, descricao, centroCustoId } = req.body;

  // Validações
  if (!tipo || valorMeta === undefined || !mes || !ano) {
    throw ApiError.badRequest('Tipo, valor da meta, mês e ano são obrigatórios');
  }

  if (mes < 1 || mes > 12) {
    throw ApiError.badRequest('Mês deve estar entre 1 e 12');
  }

  const meta = await prisma.meta.create({
    data: {
      tipo,
      valorMeta,
      mes,
      ano,
      descricao,
      centroCustoId,
    },
    include: {
      centroCusto: true,
    },
  });

  res.status(201).json({
    success: true,
    message: 'Meta criada com sucesso',
    data: meta,
  });
});

// PUT /api/metas/:id - Atualizar meta
export const updateMeta = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { tipo, valorMeta, mes, ano, descricao, centroCustoId } = req.body;

  if (mes && (mes < 1 || mes > 12)) {
    throw ApiError.badRequest('Mês deve estar entre 1 e 12');
  }

  const meta = await prisma.meta.update({
    where: { id },
    data: {
      ...(tipo && { tipo }),
      ...(valorMeta !== undefined && { valorMeta }),
      ...(mes && { mes }),
      ...(ano && { ano }),
      ...(descricao !== undefined && { descricao }),
      ...(centroCustoId !== undefined && { centroCustoId }),
    },
    include: {
      centroCusto: true,
    },
  });

  res.json({
    success: true,
    message: 'Meta atualizada com sucesso',
    data: meta,
  });
});

// DELETE /api/metas/:id - Deletar meta
export const deleteMeta = asyncHandler(async (req, res) => {
  const { id } = req.params;

  await prisma.meta.delete({
    where: { id },
  });

  res.json({
    success: true,
    message: 'Meta deletada com sucesso',
  });
});
