// Sistema Financeiro - API REST
// Servidor Express.js com Prisma ORM

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'Sistema Financeiro API'
  });
});

// Rota raiz
app.get('/', (req, res) => {
  res.json({
    name: 'Sistema Financeiro API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      transacoes: '/api/transacoes',
      clientes: '/api/clientes',
      produtos: '/api/produtos',
      centrosCusto: '/api/centros-custo',
      metas: '/api/metas'
    }
  });
});

// ========================================
// ROTAS - TRANSAÇÕES
// ========================================

// Listar todas as transações
app.get('/api/transacoes', async (req, res) => {
  try {
    const transacoes = await prisma.transacao.findMany({
      include: {
        centroCusto: true,
        cliente: true,
        produto: true
      },
      orderBy: {
        data: 'desc'
      }
    });
    res.json(transacoes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Criar nova transação
app.post('/api/transacoes', async (req, res) => {
  try {
    const transacao = await prisma.transacao.create({
      data: req.body,
      include: {
        centroCusto: true,
        cliente: true,
        produto: true
      }
    });
    res.status(201).json(transacao);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ========================================
// ROTAS - CLIENTES
// ========================================

app.get('/api/clientes', async (req, res) => {
  try {
    const clientes = await prisma.cliente.findMany({
      where: { ativo: true },
      orderBy: { nome: 'asc' }
    });
    res.json(clientes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/clientes', async (req, res) => {
  try {
    const cliente = await prisma.cliente.create({
      data: req.body
    });
    res.status(201).json(cliente);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ========================================
// ROTAS - PRODUTOS
// ========================================

app.get('/api/produtos', async (req, res) => {
  try {
    const produtos = await prisma.produto.findMany({
      where: { ativo: true },
      orderBy: { nome: 'asc' }
    });
    res.json(produtos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/produtos', async (req, res) => {
  try {
    const produto = await prisma.produto.create({
      data: req.body
    });
    res.status(201).json(produto);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ========================================
// ROTAS - CENTROS DE CUSTO
// ========================================

app.get('/api/centros-custo', async (req, res) => {
  try {
    const centros = await prisma.centroCusto.findMany({
      where: { ativo: true },
      orderBy: { nome: 'asc' }
    });
    res.json(centros);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/centros-custo', async (req, res) => {
  try {
    const centro = await prisma.centroCusto.create({
      data: req.body
    });
    res.status(201).json(centro);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ========================================
// ROTAS - METAS
// ========================================

app.get('/api/metas', async (req, res) => {
  try {
    const metas = await prisma.meta.findMany({
      include: {
        centroCusto: true
      },
      orderBy: [
        { ano: 'desc' },
        { mes: 'desc' }
      ]
    });
    res.json(metas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/metas', async (req, res) => {
  try {
    const meta = await prisma.meta.create({
      data: req.body,
      include: {
        centroCusto: true
      }
    });
    res.status(201).json(meta);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ========================================
// RELATÓRIOS E DASHBOARD
// ========================================

// Resumo financeiro
app.get('/api/dashboard/resumo', async (req, res) => {
  try {
    const { mes, ano } = req.query;

    const where = {};
    if (mes && ano) {
      const startDate = new Date(ano, mes - 1, 1);
      const endDate = new Date(ano, mes, 0, 23, 59, 59);
      where.data = {
        gte: startDate,
        lte: endDate
      };
    }

    const [receitas, despesas, totalTransacoes] = await Promise.all([
      prisma.transacao.aggregate({
        where: { ...where, tipo: 'RECEITA', statusPagamento: 'PAGO' },
        _sum: { valor: true }
      }),
      prisma.transacao.aggregate({
        where: { ...where, tipo: 'DESPESA', statusPagamento: 'PAGO' },
        _sum: { valor: true }
      }),
      prisma.transacao.count({ where })
    ]);

    const totalReceitas = receitas._sum.valor || 0;
    const totalDespesas = despesas._sum.valor || 0;
    const lucro = totalReceitas - totalDespesas;

    res.json({
      periodo: mes && ano ? `${mes}/${ano}` : 'Todos',
      receitas: totalReceitas,
      despesas: totalDespesas,
      lucro,
      totalTransacoes
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Erro 404 para rotas não encontradas
app.use((req, res) => {
  res.status(404).json({ error: 'Rota não encontrada' });
});

// Iniciar servidor
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📊 API: http://localhost:${PORT}`);
  console.log(`💚 Health: http://localhost:${PORT}/health`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🔴 Encerrando servidor...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🔴 Encerrando servidor...');
  await prisma.$disconnect();
  process.exit(0);
});
