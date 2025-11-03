// Sistema Financeiro - API REST
// Servidor Express.js com Prisma ORM

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken, requireAdmin, optionalAuth, JWT_SECRET } = require('./middleware/auth');

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;

// Criar pasta de uploads se não existir
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configurar multer para upload de arquivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'logo-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|svg/;
    const mimetype = allowedTypes.test(file.mimetype);
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Apenas imagens são permitidas (jpeg, jpg, png, gif, svg)'));
  }
});

// Middlewares
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(uploadsDir)); // Servir arquivos estáticos
app.use(express.static(path.join(__dirname, '../public'))); // Servir frontend

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
    version: '3.0.0',
    endpoints: {
      health: '/health',
      auth: {
        register: '/api/auth/register',
        login: '/api/auth/login',
        me: '/api/auth/me'
      },
      transacoes: '/api/transacoes',
      clientes: '/api/clientes',
      produtos: '/api/produtos',
      centrosCusto: '/api/centros-custo',
      metas: '/api/metas',
      configuracao: '/api/configuracao',
      uploadLogo: '/api/configuracao/upload-logo',
      usuarios: '/api/usuarios',
      dashboard: {
        resumo: '/api/dashboard/resumo?mes=1&ano=2024',
        mrr: '/api/dashboard/mrr?mes=1&ano=2024',
        porCliente: '/api/dashboard/por-cliente?mes=1&ano=2024&limit=10',
        porCentroCusto: '/api/dashboard/por-centro-custo?mes=1&ano=2024',
        evolucao: '/api/dashboard/evolucao?meses=6',
        topClientes: '/api/dashboard/top-clientes?limit=10',
        statusPagamento: '/api/dashboard/status-pagamento?mes=1&ano=2024'
      },
      metrics: {
        layer1_executive: {
          executive: '/api/metrics/executive?mes=11&ano=2025',
          nrrGrr: '/api/metrics/nrr-grr?mes=11&ano=2025',
          ltvCac: '/api/metrics/ltv-cac?mes=11&ano=2025'
        },
        layer2_revenue: {
          mrrBridge: '/api/metrics/mrr-bridge?mes=11&ano=2025',
          arpaByProduct: '/api/metrics/arpa-by-product?mes=11&ano=2025'
        },
        layer3_unitEconomics: {
          unitEconomics: '/api/metrics/unit-economics?mes=11&ano=2025'
        },
        layer5_customerSuccess: {
          customerHealth: '/api/metrics/customer-health?limit=50',
          supportSla: '/api/metrics/support-sla?mes=11&ano=2025'
        },
        layer6_agencyOps: {
          agencyOperations: '/api/metrics/agency-operations?mes=11&ano=2025'
        },
        layer7_treasury: {
          treasury: '/api/metrics/treasury?mes=11&ano=2025'
        }
      }
    }
  });
});

// ========================================
// ROTAS - AUTENTICAÇÃO
// ========================================

// Registrar novo usuário
app.post('/api/auth/register', async (req, res) => {
  try {
    const { nome, email, senha, role } = req.body;

    // Validações
    if (!nome || !email || !senha) {
      return res.status(400).json({ error: 'Nome, email e senha são obrigatórios' });
    }

    // Verificar se email já existe
    const usuarioExiste = await prisma.usuario.findUnique({
      where: { email }
    });

    if (usuarioExiste) {
      return res.status(400).json({ error: 'Email já cadastrado' });
    }

    // Hash da senha
    const senhaHash = await bcrypt.hash(senha, 10);

    // Criar usuário
    const usuario = await prisma.usuario.create({
      data: {
        nome,
        email,
        senha: senhaHash,
        role: role || 'USUARIO'
      },
      select: {
        id: true,
        nome: true,
        email: true,
        role: true,
        ativo: true,
        createdAt: true
      }
    });

    res.status(201).json({
      message: 'Usuário criado com sucesso',
      usuario
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, senha } = req.body;

    // Validações
    if (!email || !senha) {
      return res.status(400).json({ error: 'Email e senha são obrigatórios' });
    }

    // Buscar usuário
    const usuario = await prisma.usuario.findUnique({
      where: { email }
    });

    if (!usuario) {
      return res.status(401).json({ error: 'Email ou senha incorretos' });
    }

    // Verificar se usuário está ativo
    if (!usuario.ativo) {
      return res.status(401).json({ error: 'Usuário inativo' });
    }

    // Verificar senha
    const senhaValida = await bcrypt.compare(senha, usuario.senha);

    if (!senhaValida) {
      return res.status(401).json({ error: 'Email ou senha incorretos' });
    }

    // Gerar token JWT
    const token = jwt.sign(
      {
        id: usuario.id,
        email: usuario.email,
        nome: usuario.nome,
        role: usuario.role
      },
      JWT_SECRET,
      { expiresIn: '7d' } // Token válido por 7 dias
    );

    res.json({
      message: 'Login realizado com sucesso',
      token,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        role: usuario.role
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Ver usuário logado
app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const usuario = await prisma.usuario.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        nome: true,
        email: true,
        role: true,
        ativo: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!usuario) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    res.json(usuario);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Listar usuários (apenas ADMIN)
app.get('/api/usuarios', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const usuarios = await prisma.usuario.findMany({
      select: {
        id: true,
        nome: true,
        email: true,
        role: true,
        ativo: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(usuarios);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
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

// Dashboard MRR (Receita Recorrente Mensal)
app.get('/api/dashboard/mrr', async (req, res) => {
  try {
    const { mes, ano } = req.query;
    const now = new Date();
    const targetMes = mes ? parseInt(mes) : now.getMonth() + 1;
    const targetAno = ano ? parseInt(ano) : now.getFullYear();

    const startDate = new Date(targetAno, targetMes - 1, 1);
    const endDate = new Date(targetAno, targetMes, 0, 23, 59, 59);

    // MRR de produtos tipo MRR
    const mrrProdutos = await prisma.transacao.aggregate({
      where: {
        tipo: 'RECEITA',
        statusPagamento: 'PAGO',
        data: { gte: startDate, lte: endDate },
        produto: { tipo: 'MRR' }
      },
      _sum: { valor: true }
    });

    // MRR de transações recorrentes mensais
    const mrrRecorrente = await prisma.transacao.aggregate({
      where: {
        tipo: 'RECEITA',
        statusPagamento: 'PAGO',
        data: { gte: startDate, lte: endDate },
        recorrente: true,
        frequencia: 'MENSAL'
      },
      _sum: { valor: true }
    });

    // Clientes ativos com MRR
    const clientesMRR = await prisma.transacao.groupBy({
      by: ['clienteId'],
      where: {
        tipo: 'RECEITA',
        statusPagamento: 'PAGO',
        data: { gte: startDate, lte: endDate },
        OR: [
          { produto: { tipo: 'MRR' } },
          { recorrente: true, frequencia: 'MENSAL' }
        ]
      },
      _count: true
    });

    const totalMRR = (mrrProdutos._sum.valor || 0) + (mrrRecorrente._sum.valor || 0);

    res.json({
      periodo: `${targetMes}/${targetAno}`,
      totalMRR,
      mrrProdutos: mrrProdutos._sum.valor || 0,
      mrrRecorrente: mrrRecorrente._sum.valor || 0,
      clientesAtivos: clientesMRR.length,
      ticketMedio: clientesMRR.length > 0 ? totalMRR / clientesMRR.length : 0
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Dashboard por Cliente
app.get('/api/dashboard/por-cliente', async (req, res) => {
  try {
    const { mes, ano, limit } = req.query;

    const where = {};
    if (mes && ano) {
      const startDate = new Date(ano, mes - 1, 1);
      const endDate = new Date(ano, mes, 0, 23, 59, 59);
      where.data = { gte: startDate, lte: endDate };
    }

    // Receita por cliente
    const receitaPorCliente = await prisma.transacao.groupBy({
      by: ['clienteId'],
      where: {
        ...where,
        tipo: 'RECEITA',
        statusPagamento: 'PAGO',
        clienteId: { not: null }
      },
      _sum: { valor: true },
      _count: true,
      orderBy: { _sum: { valor: 'desc' } },
      take: limit ? parseInt(limit) : undefined
    });

    // Buscar dados dos clientes
    const clientesComDados = await Promise.all(
      receitaPorCliente.map(async (item) => {
        const cliente = await prisma.cliente.findUnique({
          where: { id: item.clienteId },
          select: { id: true, nome: true, email: true, tipo: true }
        });

        return {
          cliente,
          receita: item._sum.valor || 0,
          totalTransacoes: item._count
        };
      })
    );

    res.json({
      periodo: mes && ano ? `${mes}/${ano}` : 'Todos',
      clientes: clientesComDados
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Dashboard por Centro de Custo
app.get('/api/dashboard/por-centro-custo', async (req, res) => {
  try {
    const { mes, ano } = req.query;

    const where = {};
    if (mes && ano) {
      const startDate = new Date(ano, mes - 1, 1);
      const endDate = new Date(ano, mes, 0, 23, 59, 59);
      where.data = { gte: startDate, lte: endDate };
    }

    const centros = await prisma.centroCusto.findMany({
      where: { ativo: true },
      include: {
        transacoes: {
          where: {
            ...where,
            statusPagamento: 'PAGO'
          }
        }
      }
    });

    const resultado = centros.map(centro => {
      const receitas = centro.transacoes
        .filter(t => t.tipo === 'RECEITA')
        .reduce((sum, t) => sum + parseFloat(t.valor), 0);

      const despesas = centro.transacoes
        .filter(t => t.tipo === 'DESPESA')
        .reduce((sum, t) => sum + parseFloat(t.valor), 0);

      return {
        centroCusto: {
          id: centro.id,
          nome: centro.nome,
          cor: centro.cor
        },
        receitas,
        despesas,
        lucro: receitas - despesas,
        totalTransacoes: centro.transacoes.length
      };
    });

    res.json({
      periodo: mes && ano ? `${mes}/${ano}` : 'Todos',
      centrosCusto: resultado
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Dashboard Temporal (Evolução)
app.get('/api/dashboard/evolucao', async (req, res) => {
  try {
    const { meses = 6 } = req.query; // Últimos 6 meses por padrão
    const now = new Date();
    const resultado = [];

    for (let i = parseInt(meses) - 1; i >= 0; i--) {
      const mes = now.getMonth() - i;
      const ano = now.getFullYear();
      const data = new Date(ano, mes, 1);

      const mesAtual = data.getMonth() + 1;
      const anoAtual = data.getFullYear();

      const startDate = new Date(anoAtual, mesAtual - 1, 1);
      const endDate = new Date(anoAtual, mesAtual, 0, 23, 59, 59);

      const [receitas, despesas] = await Promise.all([
        prisma.transacao.aggregate({
          where: {
            tipo: 'RECEITA',
            statusPagamento: 'PAGO',
            data: { gte: startDate, lte: endDate }
          },
          _sum: { valor: true }
        }),
        prisma.transacao.aggregate({
          where: {
            tipo: 'DESPESA',
            statusPagamento: 'PAGO',
            data: { gte: startDate, lte: endDate }
          },
          _sum: { valor: true }
        })
      ]);

      const totalReceitas = receitas._sum.valor || 0;
      const totalDespesas = despesas._sum.valor || 0;

      resultado.push({
        mes: mesAtual,
        ano: anoAtual,
        periodo: `${mesAtual}/${anoAtual}`,
        receitas: totalReceitas,
        despesas: totalDespesas,
        lucro: totalReceitas - totalDespesas
      });
    }

    res.json({ evolucao: resultado });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Top Clientes
app.get('/api/dashboard/top-clientes', async (req, res) => {
  try {
    const { limit = 10, mes, ano } = req.query;

    const where = { tipo: 'RECEITA', statusPagamento: 'PAGO', clienteId: { not: null } };
    if (mes && ano) {
      const startDate = new Date(ano, mes - 1, 1);
      const endDate = new Date(ano, mes, 0, 23, 59, 59);
      where.data = { gte: startDate, lte: endDate };
    }

    const topClientes = await prisma.transacao.groupBy({
      by: ['clienteId'],
      where,
      _sum: { valor: true },
      _count: true,
      orderBy: { _sum: { valor: 'desc' } },
      take: parseInt(limit)
    });

    const clientesComDados = await Promise.all(
      topClientes.map(async (item) => {
        const cliente = await prisma.cliente.findUnique({
          where: { id: item.clienteId }
        });

        return {
          cliente: {
            id: cliente.id,
            nome: cliente.nome,
            email: cliente.email,
            tipo: cliente.tipo
          },
          receita: item._sum.valor || 0,
          transacoes: item._count
        };
      })
    );

    res.json({
      periodo: mes && ano ? `${mes}/${ano}` : 'Todos',
      topClientes: clientesComDados
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Status de Pagamento
app.get('/api/dashboard/status-pagamento', async (req, res) => {
  try {
    const { mes, ano } = req.query;

    const where = {};
    if (mes && ano) {
      const startDate = new Date(ano, mes - 1, 1);
      const endDate = new Date(ano, mes, 0, 23, 59, 59);
      where.data = { gte: startDate, lte: endDate };
    }

    const statusGroup = await prisma.transacao.groupBy({
      by: ['statusPagamento', 'tipo'],
      where,
      _sum: { valor: true },
      _count: true
    });

    const resultado = {
      periodo: mes && ano ? `${mes}/${ano}` : 'Todos',
      porStatus: {}
    };

    statusGroup.forEach(item => {
      if (!resultado.porStatus[item.statusPagamento]) {
        resultado.porStatus[item.statusPagamento] = {
          total: 0,
          receitas: 0,
          despesas: 0,
          transacoes: 0
        };
      }

      const valor = item._sum.valor || 0;
      resultado.porStatus[item.statusPagamento].total += valor;
      resultado.porStatus[item.statusPagamento].transacoes += item._count;

      if (item.tipo === 'RECEITA') {
        resultado.porStatus[item.statusPagamento].receitas += valor;
      } else {
        resultado.porStatus[item.statusPagamento].despesas += valor;
      }
    });

    res.json(resultado);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ========================================
// MÉTRICAS AVANÇADAS - CAMADA 1: EXECUTIVO
// ========================================

// Métricas Executivas (ARR, MRR, NRR, GRR, Churn, LTV, CAC, Rule of 40, Runway)
app.get('/api/metrics/executive', async (req, res) => {
  try {
    const { mes, ano } = req.query;
    const now = new Date();
    const targetMes = mes ? parseInt(mes) : now.getMonth() + 1;
    const targetAno = ano ? parseInt(ano) : now.getFullYear();

    const startDate = new Date(targetAno, targetMes - 1, 1);
    const endDate = new Date(targetAno, targetMes, 0, 23, 59, 59);

    // Calcular MRR atual
    const mrrAtual = await prisma.transacao.aggregate({
      where: {
        tipo: 'RECEITA',
        statusPagamento: 'PAGO',
        data: { gte: startDate, lte: endDate },
        OR: [
          { produto: { tipo: 'MRR' } },
          { recorrente: true, frequencia: 'MENSAL' }
        ]
      },
      _sum: { valor: true }
    });

    // MRR anterior (mês passado)
    const mesAnterior = targetMes === 1 ? 12 : targetMes - 1;
    const anoAnterior = targetMes === 1 ? targetAno - 1 : targetAno;
    const startDateAnterior = new Date(anoAnterior, mesAnterior - 1, 1);
    const endDateAnterior = new Date(anoAnterior, mesAnterior, 0, 23, 59, 59);

    const mrrAnterior = await prisma.transacao.aggregate({
      where: {
        tipo: 'RECEITA',
        statusPagamento: 'PAGO',
        data: { gte: startDateAnterior, lte: endDateAnterior },
        OR: [
          { produto: { tipo: 'MRR' } },
          { recorrente: true, frequencia: 'MENSAL' }
        ]
      },
      _sum: { valor: true }
    });

    const currentMRR = parseFloat(mrrAtual._sum.valor || 0);
    const previousMRR = parseFloat(mrrAnterior._sum.valor || 0);
    const arr = currentMRR * 12; // ARR = MRR × 12
    const mrrGrowthMoM = previousMRR > 0 ? ((currentMRR - previousMRR) / previousMRR) * 100 : 0;

    // Calcular Churn do mês
    const churnMovements = await prisma.mRRMovement.aggregate({
      where: {
        mes: targetMes,
        ano: targetAno,
        tipo: 'CHURN'
      },
      _sum: { valor: true }
    });

    const churnMRR = parseFloat(churnMovements._sum.valor || 0);
    const churnRate = previousMRR > 0 ? (churnMRR / previousMRR) * 100 : 0;

    // Buscar caixa atual
    const cashBalance = await prisma.cashBalance.findFirst({
      where: { mes: targetMes, ano: targetAno },
      orderBy: { data: 'desc' }
    });

    const runway = cashBalance?.runwayMeses || null;
    const burnRate = cashBalance?.burnRate ? parseFloat(cashBalance.burnRate) : null;

    // Receitas e custos para margem bruta
    const receitasTotal = await prisma.transacao.aggregate({
      where: {
        tipo: 'RECEITA',
        statusPagamento: 'PAGO',
        data: { gte: startDate, lte: endDate }
      },
      _sum: { valor: true }
    });

    const cogs = await prisma.operationalCost.aggregate({
      where: {
        tipo: 'COGS',
        data: { gte: startDate, lte: endDate }
      },
      _sum: { valor: true }
    });

    const totalReceitas = parseFloat(receitasTotal._sum.valor || 0);
    const totalCOGS = parseFloat(cogs._sum.valor || 0);
    const margemBruta = totalReceitas > 0 ? ((totalReceitas - totalCOGS) / totalReceitas) * 100 : 0;

    // Rule of 40 = Growth Rate + Profit Margin
    const ruleOf40 = mrrGrowthMoM + margemBruta;

    res.json({
      periodo: `${targetMes}/${targetAno}`,
      arr: arr.toFixed(2),
      mrr: currentMRR.toFixed(2),
      mrrAnterior: previousMRR.toFixed(2),
      crescimentoMRR: {
        absoluto: (currentMRR - previousMRR).toFixed(2),
        percentual: mrrGrowthMoM.toFixed(2)
      },
      churn: {
        valor: churnMRR.toFixed(2),
        taxa: churnRate.toFixed(2)
      },
      margemBruta: margemBruta.toFixed(2),
      ruleOf40: ruleOf40.toFixed(2),
      runway: runway,
      burnRate: burnRate ? burnRate.toFixed(2) : null,
      benchmarks: {
        ruleOf40: 'Ideal: ≥ 40%',
        churnRate: 'SaaS B2B: < 5% | B2C: < 7%',
        margemBruta: 'SaaS: > 70%'
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// NRR e GRR (Net e Gross Revenue Retention)
app.get('/api/metrics/nrr-grr', async (req, res) => {
  try {
    const { mes, ano } = req.query;
    const now = new Date();
    const targetMes = mes ? parseInt(mes) : now.getMonth() + 1;
    const targetAno = ano ? parseInt(ano) : now.getFullYear();

    // MRR do início do período (mês anterior)
    const mesAnterior = targetMes === 1 ? 12 : targetMes - 1;
    const anoAnterior = targetMes === 1 ? targetAno - 1 : targetAno;

    const startDateAnterior = new Date(anoAnterior, mesAnterior - 1, 1);
    const endDateAnterior = new Date(anoAnterior, mesAnterior, 0, 23, 59, 59);

    const mrrInicial = await prisma.transacao.aggregate({
      where: {
        tipo: 'RECEITA',
        statusPagamento: 'PAGO',
        data: { gte: startDateAnterior, lte: endDateAnterior },
        OR: [
          { produto: { tipo: 'MRR' } },
          { recorrente: true, frequencia: 'MENSAL' }
        ]
      },
      _sum: { valor: true }
    });

    const mrrBase = parseFloat(mrrInicial._sum.valor || 0);

    // Movimentos do mês
    const [expansion, contraction, churn] = await Promise.all([
      prisma.mRRMovement.aggregate({
        where: { mes: targetMes, ano: targetAno, tipo: 'EXPANSION' },
        _sum: { valor: true }
      }),
      prisma.mRRMovement.aggregate({
        where: { mes: targetMes, ano: targetAno, tipo: 'CONTRACTION' },
        _sum: { valor: true }
      }),
      prisma.mRRMovement.aggregate({
        where: { mes: targetMes, ano: targetAno, tipo: 'CHURN' },
        _sum: { valor: true }
      })
    ]);

    const expansionMRR = parseFloat(expansion._sum.valor || 0);
    const contractionMRR = parseFloat(contraction._sum.valor || 0);
    const churnMRR = parseFloat(churn._sum.valor || 0);

    // GRR = (MRR Base - Churn - Contraction) / MRR Base
    const grr = mrrBase > 0 ? ((mrrBase - churnMRR - contractionMRR) / mrrBase) * 100 : 0;

    // NRR = (MRR Base - Churn - Contraction + Expansion) / MRR Base
    const nrr = mrrBase > 0 ? ((mrrBase - churnMRR - contractionMRR + expansionMRR) / mrrBase) * 100 : 0;

    res.json({
      periodo: `${targetMes}/${targetAno}`,
      mrrBase: mrrBase.toFixed(2),
      movimentos: {
        expansion: expansionMRR.toFixed(2),
        contraction: contractionMRR.toFixed(2),
        churn: churnMRR.toFixed(2)
      },
      grr: grr.toFixed(2),
      nrr: nrr.toFixed(2),
      benchmarks: {
        nrr: 'Excelente: ≥ 110% | Bom: 100-110% | Atenção: < 100%',
        grr: 'Excelente: ≥ 95% | Bom: 90-95% | Atenção: < 90%'
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// LTV e CAC
app.get('/api/metrics/ltv-cac', async (req, res) => {
  try {
    const { mes, ano } = req.query;
    const now = new Date();
    const targetMes = mes ? parseInt(mes) : now.getMonth() + 1;
    const targetAno = ano ? parseInt(ano) : now.getFullYear();

    const startDate = new Date(targetAno, targetMes - 1, 1);
    const endDate = new Date(targetAno, targetMes, 0, 23, 59, 59);

    // ARPA (Average Revenue Per Account) - MRR / Total de clientes ativos
    const mrrAtual = await prisma.transacao.aggregate({
      where: {
        tipo: 'RECEITA',
        statusPagamento: 'PAGO',
        data: { gte: startDate, lte: endDate },
        OR: [
          { produto: { tipo: 'MRR' } },
          { recorrente: true, frequencia: 'MENSAL' }
        ]
      },
      _sum: { valor: true }
    });

    const clientesMRR = await prisma.transacao.groupBy({
      by: ['clienteId'],
      where: {
        tipo: 'RECEITA',
        statusPagamento: 'PAGO',
        data: { gte: startDate, lte: endDate },
        clienteId: { not: null },
        OR: [
          { produto: { tipo: 'MRR' } },
          { recorrente: true, frequencia: 'MENSAL' }
        ]
      },
      _count: true
    });

    const totalMRR = parseFloat(mrrAtual._sum.valor || 0);
    const totalClientes = clientesMRR.length;
    const arpa = totalClientes > 0 ? totalMRR / totalClientes : 0;

    // Churn Rate médio (vamos usar o churn do mês)
    const churnMovements = await prisma.mRRMovement.aggregate({
      where: {
        mes: targetMes,
        ano: targetAno,
        tipo: 'CHURN'
      },
      _sum: { valor: true }
    });

    // MRR anterior para calcular churn rate
    const mesAnterior = targetMes === 1 ? 12 : targetMes - 1;
    const anoAnterior = targetMes === 1 ? targetAno - 1 : targetAno;
    const startDateAnterior = new Date(anoAnterior, mesAnterior - 1, 1);
    const endDateAnterior = new Date(anoAnterior, mesAnterior, 0, 23, 59, 59);

    const mrrAnterior = await prisma.transacao.aggregate({
      where: {
        tipo: 'RECEITA',
        statusPagamento: 'PAGO',
        data: { gte: startDateAnterior, lte: endDateAnterior },
        OR: [
          { produto: { tipo: 'MRR' } },
          { recorrente: true, frequencia: 'MENSAL' }
        ]
      },
      _sum: { valor: true }
    });

    const previousMRR = parseFloat(mrrAnterior._sum.valor || 0);
    const churnMRR = parseFloat(churnMovements._sum.valor || 0);
    const churnRate = previousMRR > 0 ? (churnMRR / previousMRR) : 0.05; // Default 5% se não houver dados

    // LTV = ARPA / Churn Rate
    const ltv = churnRate > 0 ? arpa / churnRate : 0;

    // CAC - Custos de Marketing do mês / Novos clientes
    const cacCosts = await prisma.marketingCost.aggregate({
      where: {
        data: { gte: startDate, lte: endDate }
      },
      _sum: { valor: true }
    });

    const novosClientes = await prisma.mRRMovement.count({
      where: {
        mes: targetMes,
        ano: targetAno,
        tipo: 'NOVO'
      }
    });

    const totalCAC = parseFloat(cacCosts._sum.valor || 0);
    const cac = novosClientes > 0 ? totalCAC / novosClientes : 0;

    // LTV:CAC Ratio
    const ltvCacRatio = cac > 0 ? ltv / cac : 0;

    // Payback period em meses = CAC / ARPA
    const paybackMonths = arpa > 0 ? cac / arpa : 0;

    res.json({
      periodo: `${targetMes}/${targetAno}`,
      arpa: arpa.toFixed(2),
      churnRate: (churnRate * 100).toFixed(2) + '%',
      ltv: ltv.toFixed(2),
      cac: cac.toFixed(2),
      ltvCacRatio: ltvCacRatio.toFixed(2),
      paybackMonths: paybackMonths.toFixed(1),
      novosClientes,
      totalCAC: totalCAC.toFixed(2),
      benchmarks: {
        ltvCacRatio: 'Excelente: > 5x | Bom: 3-5x | Atenção: < 3x',
        payback: 'Excelente: < 12 meses | Bom: 12-18 meses'
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ========================================
// MÉTRICAS - CAMADA 2: RECEITA
// ========================================

// MRR Bridge (New, Expansion, Contraction, Churn, Reativação)
app.get('/api/metrics/mrr-bridge', async (req, res) => {
  try {
    const { mes, ano } = req.query;
    const now = new Date();
    const targetMes = mes ? parseInt(mes) : now.getMonth() + 1;
    const targetAno = ano ? parseInt(ano) : now.getFullYear();

    // MRR anterior
    const mesAnterior = targetMes === 1 ? 12 : targetMes - 1;
    const anoAnterior = targetMes === 1 ? targetAno - 1 : targetAno;

    const startDateAnterior = new Date(anoAnterior, mesAnterior - 1, 1);
    const endDateAnterior = new Date(anoAnterior, mesAnterior, 0, 23, 59, 59);

    const mrrInicial = await prisma.transacao.aggregate({
      where: {
        tipo: 'RECEITA',
        statusPagamento: 'PAGO',
        data: { gte: startDateAnterior, lte: endDateAnterior },
        OR: [
          { produto: { tipo: 'MRR' } },
          { recorrente: true, frequencia: 'MENSAL' }
        ]
      },
      _sum: { valor: true }
    });

    // MRR atual
    const startDate = new Date(targetAno, targetMes - 1, 1);
    const endDate = new Date(targetAno, targetMes, 0, 23, 59, 59);

    const mrrFinal = await prisma.transacao.aggregate({
      where: {
        tipo: 'RECEITA',
        statusPagamento: 'PAGO',
        data: { gte: startDate, lte: endDate },
        OR: [
          { produto: { tipo: 'MRR' } },
          { recorrente: true, frequencia: 'MENSAL' }
        ]
      },
      _sum: { valor: true }
    });

    // Movimentos do mês
    const [novo, expansion, contraction, churn, reativacao] = await Promise.all([
      prisma.mRRMovement.aggregate({
        where: { mes: targetMes, ano: targetAno, tipo: 'NOVO' },
        _sum: { valor: true }
      }),
      prisma.mRRMovement.aggregate({
        where: { mes: targetMes, ano: targetAno, tipo: 'EXPANSION' },
        _sum: { valor: true }
      }),
      prisma.mRRMovement.aggregate({
        where: { mes: targetMes, ano: targetAno, tipo: 'CONTRACTION' },
        _sum: { valor: true }
      }),
      prisma.mRRMovement.aggregate({
        where: { mes: targetMes, ano: targetAno, tipo: 'CHURN' },
        _sum: { valor: true }
      }),
      prisma.mRRMovement.aggregate({
        where: { mes: targetMes, ano: targetAno, tipo: 'REATIVACAO' },
        _sum: { valor: true }
      })
    ]);

    const mrrStart = parseFloat(mrrInicial._sum.valor || 0);
    const mrrEnd = parseFloat(mrrFinal._sum.valor || 0);
    const newMRR = parseFloat(novo._sum.valor || 0);
    const expansionMRR = parseFloat(expansion._sum.valor || 0);
    const contractionMRR = parseFloat(contraction._sum.valor || 0);
    const churnMRR = parseFloat(churn._sum.valor || 0);
    const reativacaoMRR = parseFloat(reativacao._sum.valor || 0);

    const netNewMRR = newMRR + expansionMRR + reativacaoMRR - contractionMRR - churnMRR;

    res.json({
      periodo: `${targetMes}/${targetAno}`,
      mrrInicial: mrrStart.toFixed(2),
      movimentos: {
        novo: newMRR.toFixed(2),
        expansion: expansionMRR.toFixed(2),
        contraction: contractionMRR.toFixed(2),
        churn: churnMRR.toFixed(2),
        reativacao: reativacaoMRR.toFixed(2)
      },
      netNewMRR: netNewMRR.toFixed(2),
      mrrFinal: mrrEnd.toFixed(2),
      crescimento: {
        absoluto: (mrrEnd - mrrStart).toFixed(2),
        percentual: mrrStart > 0 ? (((mrrEnd - mrrStart) / mrrStart) * 100).toFixed(2) : '0.00'
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ARPA por Plano/Produto
app.get('/api/metrics/arpa-by-product', async (req, res) => {
  try {
    const { mes, ano } = req.query;
    const now = new Date();
    const targetMes = mes ? parseInt(mes) : now.getMonth() + 1;
    const targetAno = ano ? parseInt(ano) : now.getFullYear();

    const startDate = new Date(targetAno, targetMes - 1, 1);
    const endDate = new Date(targetAno, targetMes, 0, 23, 59, 59);

    // Receita por produto
    const receitaPorProduto = await prisma.transacao.groupBy({
      by: ['produtoId'],
      where: {
        tipo: 'RECEITA',
        statusPagamento: 'PAGO',
        data: { gte: startDate, lte: endDate },
        produtoId: { not: null },
        produto: { tipo: 'MRR' }
      },
      _sum: { valor: true }
    });

    // Contar clientes únicos por produto
    const produtos = await Promise.all(
      receitaPorProduto.map(async (item) => {
        const produto = await prisma.produto.findUnique({
          where: { id: item.produtoId },
          select: { id: true, nome: true, tipo: true, valor: true }
        });

        // Clientes únicos do produto
        const clientesUnicos = await prisma.transacao.groupBy({
          by: ['clienteId'],
          where: {
            produtoId: item.produtoId,
            tipo: 'RECEITA',
            statusPagamento: 'PAGO',
            data: { gte: startDate, lte: endDate },
            clienteId: { not: null }
          }
        });

        const receita = parseFloat(item._sum.valor || 0);
        const numClientes = clientesUnicos.length;
        const arpa = numClientes > 0 ? receita / numClientes : 0;

        return {
          produto,
          receita: receita.toFixed(2),
          clientes: numClientes,
          arpa: arpa.toFixed(2)
        };
      })
    );

    res.json({
      periodo: `${targetMes}/${targetAno}`,
      produtos
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ========================================
// MÉTRICAS - CAMADA 3: UNIT ECONOMICS
// ========================================

// Margens e COGS
app.get('/api/metrics/unit-economics', async (req, res) => {
  try {
    const { mes, ano } = req.query;
    const now = new Date();
    const targetMes = mes ? parseInt(mes) : now.getMonth() + 1;
    const targetAno = ano ? parseInt(ano) : now.getFullYear();

    const startDate = new Date(targetAno, targetMes - 1, 1);
    const endDate = new Date(targetAno, targetMes, 0, 23, 59, 59);

    // Receitas totais
    const receitas = await prisma.transacao.aggregate({
      where: {
        tipo: 'RECEITA',
        statusPagamento: 'PAGO',
        data: { gte: startDate, lte: endDate }
      },
      _sum: { valor: true }
    });

    // COGS, OPEX, CAC
    const [cogs, opex, cac] = await Promise.all([
      prisma.operationalCost.aggregate({
        where: {
          tipo: 'COGS',
          data: { gte: startDate, lte: endDate }
        },
        _sum: { valor: true }
      }),
      prisma.operationalCost.aggregate({
        where: {
          tipo: 'OPEX',
          data: { gte: startDate, lte: endDate }
        },
        _sum: { valor: true }
      }),
      prisma.marketingCost.aggregate({
        where: {
          data: { gte: startDate, lte: endDate }
        },
        _sum: { valor: true }
      })
    ]);

    const totalReceitas = parseFloat(receitas._sum.valor || 0);
    const totalCOGS = parseFloat(cogs._sum.valor || 0);
    const totalOPEX = parseFloat(opex._sum.valor || 0);
    const totalCAC = parseFloat(cac._sum.valor || 0);

    // Margens
    const margemBruta = totalReceitas > 0 ? ((totalReceitas - totalCOGS) / totalReceitas) * 100 : 0;
    const margemOperacional = totalReceitas > 0 ? ((totalReceitas - totalCOGS - totalOPEX) / totalReceitas) * 100 : 0;
    const margemLiquida = totalReceitas > 0 ? ((totalReceitas - totalCOGS - totalOPEX - totalCAC) / totalReceitas) * 100 : 0;

    // COGS por cliente ativo
    const clientesAtivos = await prisma.transacao.groupBy({
      by: ['clienteId'],
      where: {
        tipo: 'RECEITA',
        statusPagamento: 'PAGO',
        data: { gte: startDate, lte: endDate },
        clienteId: { not: null }
      }
    });

    const cogsPerCustomer = clientesAtivos.length > 0 ? totalCOGS / clientesAtivos.length : 0;

    // Magic Number = Net New MRR / Sales & Marketing Spend
    // Vamos usar crescimento de MRR
    const mesAnterior = targetMes === 1 ? 12 : targetMes - 1;
    const anoAnterior = targetMes === 1 ? targetAno - 1 : targetAno;
    const startDateAnterior = new Date(anoAnterior, mesAnterior - 1, 1);
    const endDateAnterior = new Date(anoAnterior, mesAnterior, 0, 23, 59, 59);

    const [mrrAtual, mrrAnterior] = await Promise.all([
      prisma.transacao.aggregate({
        where: {
          tipo: 'RECEITA',
          statusPagamento: 'PAGO',
          data: { gte: startDate, lte: endDate },
          OR: [
            { produto: { tipo: 'MRR' } },
            { recorrente: true, frequencia: 'MENSAL' }
          ]
        },
        _sum: { valor: true }
      }),
      prisma.transacao.aggregate({
        where: {
          tipo: 'RECEITA',
          statusPagamento: 'PAGO',
          data: { gte: startDateAnterior, lte: endDateAnterior },
          OR: [
            { produto: { tipo: 'MRR' } },
            { recorrente: true, frequencia: 'MENSAL' }
          ]
        },
        _sum: { valor: true }
      })
    ]);

    const currentMRR = parseFloat(mrrAtual._sum.valor || 0);
    const previousMRR = parseFloat(mrrAnterior._sum.valor || 0);
    const netNewMRR = currentMRR - previousMRR;

    const magicNumber = totalCAC > 0 ? netNewMRR / totalCAC : 0;

    res.json({
      periodo: `${targetMes}/${targetAno}`,
      receitas: totalReceitas.toFixed(2),
      custos: {
        cogs: totalCOGS.toFixed(2),
        opex: totalOPEX.toFixed(2),
        cac: totalCAC.toFixed(2),
        total: (totalCOGS + totalOPEX + totalCAC).toFixed(2)
      },
      margens: {
        bruta: margemBruta.toFixed(2) + '%',
        operacional: margemOperacional.toFixed(2) + '%',
        liquida: margemLiquida.toFixed(2) + '%'
      },
      cogsPerCustomer: cogsPerCustomer.toFixed(2),
      magicNumber: magicNumber.toFixed(2),
      clientesAtivos: clientesAtivos.length,
      benchmarks: {
        margemBruta: 'SaaS: > 70% | Agência: > 50%',
        magicNumber: 'Excelente: > 1.0 | Bom: 0.75-1.0 | Atenção: < 0.75'
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ========================================
// MÉTRICAS - CAMADA 5: CUSTOMER SUCCESS
// ========================================

// Health Scores e NPS
app.get('/api/metrics/customer-health', async (req, res) => {
  try {
    const { limit = 50 } = req.query;

    // Distribuição de health scores
    const healthDistribution = await prisma.customerHealth.groupBy({
      by: ['healthScore'],
      _count: true
    });

    // NPS médio
    const npsData = await prisma.customerHealth.aggregate({
      where: { nps: { not: null } },
      _avg: { nps: true },
      _count: { nps: true }
    });

    // Clientes em risco
    const clientesRisco = await prisma.customerHealth.findMany({
      where: {
        OR: [
          { healthScore: { in: ['RISCO', 'CRITICO'] } },
          { riscoPagamento: true },
          { diasSemUso: { gte: 30 } }
        ]
      },
      include: {
        cliente: {
          select: { id: true, nome: true, email: true }
        }
      },
      orderBy: { scoreNumerico: 'asc' },
      take: parseInt(limit)
    });

    // Taxa de retenção (clientes com health score bom/excelente)
    const totalClientes = await prisma.customerHealth.count();
    const clientesSaudaveis = await prisma.customerHealth.count({
      where: {
        healthScore: { in: ['EXCELENTE', 'BOM'] }
      }
    });

    const retentionRate = totalClientes > 0 ? (clientesSaudaveis / totalClientes) * 100 : 0;

    res.json({
      distribuicao: healthDistribution.map(item => ({
        healthScore: item.healthScore,
        quantidade: item._count
      })),
      nps: {
        media: npsData._avg.nps ? parseFloat(npsData._avg.nps).toFixed(1) : null,
        respostas: npsData._count.nps
      },
      retentionRate: retentionRate.toFixed(2) + '%',
      clientesEmRisco: {
        total: clientesRisco.length,
        clientes: clientesRisco.map(h => ({
          cliente: h.cliente,
          healthScore: h.healthScore,
          scoreNumerico: h.scoreNumerico,
          diasSemUso: h.diasSemUso,
          riscoPagamento: h.riscoPagamento,
          ticketsAbertos: h.ticketsAbertos,
          observacoes: h.observacoes
        }))
      },
      totalClientes,
      benchmarks: {
        nps: 'Excelente: > 50 | Bom: 30-50 | Atenção: < 30',
        retention: 'SaaS: > 90%'
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// SLA e FCR (Suporte)
app.get('/api/metrics/support-sla', async (req, res) => {
  try {
    const { mes, ano } = req.query;
    const now = new Date();
    const targetMes = mes ? parseInt(mes) : now.getMonth() + 1;
    const targetAno = ano ? parseInt(ano) : now.getFullYear();

    const startDate = new Date(targetAno, targetMes - 1, 1);
    const endDate = new Date(targetAno, targetMes, 0, 23, 59, 59);

    // Tickets do período
    const tickets = await prisma.supportTicket.findMany({
      where: {
        dataAbertura: { gte: startDate, lte: endDate }
      }
    });

    const totalTickets = tickets.length;

    // Tempo médio de resposta
    const ticketsComResposta = tickets.filter(t => t.tempoResposta !== null);
    const tempoMedioResposta = ticketsComResposta.length > 0
      ? ticketsComResposta.reduce((sum, t) => sum + (t.tempoResposta || 0), 0) / ticketsComResposta.length
      : 0;

    // Tempo médio de resolução
    const ticketsResolvidos = tickets.filter(t => t.tempoResolucao !== null);
    const tempoMedioResolucao = ticketsResolvidos.length > 0
      ? ticketsResolvidos.reduce((sum, t) => sum + (t.tempoResolucao || 0), 0) / ticketsResolvidos.length
      : 0;

    // FCR - First Contact Resolution
    const fcrTickets = tickets.filter(t => t.primeiroContato === true && t.status === 'RESOLVIDO');
    const fcrRate = totalTickets > 0 ? (fcrTickets.length / totalTickets) * 100 : 0;

    // Distribuição por status
    const porStatus = await prisma.supportTicket.groupBy({
      by: ['status'],
      where: {
        dataAbertura: { gte: startDate, lte: endDate }
      },
      _count: true
    });

    // Distribuição por prioridade
    const porPrioridade = await prisma.supportTicket.groupBy({
      by: ['prioridade'],
      where: {
        dataAbertura: { gte: startDate, lte: endDate }
      },
      _count: true
    });

    res.json({
      periodo: `${targetMes}/${targetAno}`,
      totalTickets,
      sla: {
        tempoMedioResposta: `${(tempoMedioResposta / 60).toFixed(1)} horas`,
        tempoMedioResolucao: `${(tempoMedioResolucao / 60).toFixed(1)} horas`,
        fcrRate: fcrRate.toFixed(2) + '%'
      },
      distribuicao: {
        porStatus: porStatus.map(s => ({ status: s.status, quantidade: s._count })),
        porPrioridade: porPrioridade.map(p => ({ prioridade: p.prioridade, quantidade: p._count }))
      },
      benchmarks: {
        tempoResposta: 'Excelente: < 1h | Bom: 1-4h',
        tempoResolucao: 'Excelente: < 24h | Bom: 24-48h',
        fcr: 'Excelente: > 70% | Bom: 50-70%'
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ========================================
// MÉTRICAS - CAMADA 6: AGENCY OPERATIONS
// ========================================

// Utilização e Margens de Projetos
app.get('/api/metrics/agency-operations', async (req, res) => {
  try {
    const { mes, ano } = req.query;
    const now = new Date();
    const targetMes = mes ? parseInt(mes) : now.getMonth() + 1;
    const targetAno = ano ? parseInt(ano) : now.getFullYear();

    const startDate = new Date(targetAno, targetMes - 1, 1);
    const endDate = new Date(targetAno, targetMes, 0, 23, 59, 59);

    // Projetos do período
    const projetos = await prisma.agencyProject.findMany({
      where: {
        dataInicio: { lte: endDate },
        OR: [
          { dataConclusao: null },
          { dataConclusao: { gte: startDate } }
        ]
      },
      include: {
        cliente: {
          select: { id: true, nome: true }
        }
      }
    });

    const totalProjetos = projetos.length;

    // Horas totais
    const horasEstimadas = projetos.reduce((sum, p) => sum + parseFloat(p.horasEstimadas || 0), 0);
    const horasRealizadas = projetos.reduce((sum, p) => sum + parseFloat(p.horasRealizadas || 0), 0);
    const horasFaturaveis = projetos.reduce((sum, p) => sum + parseFloat(p.horasFaturaveis || 0), 0);

    // Utilização = Horas Faturáveis / Horas Realizadas
    const utilizacao = horasRealizadas > 0 ? (horasFaturaveis / horasRealizadas) * 100 : 0;

    // Valores
    const valorContratado = projetos.reduce((sum, p) => sum + parseFloat(p.valorContratado || 0), 0);
    const valorFaturado = projetos.reduce((sum, p) => sum + parseFloat(p.valorFaturado || 0), 0);
    const custoReal = projetos.reduce((sum, p) => sum + parseFloat(p.custoReal || 0), 0);

    // Blended Rate = Valor Faturado / Horas Faturáveis
    const blendedRate = horasFaturaveis > 0 ? valorFaturado / horasFaturaveis : 0;

    // Margem Bruta Média
    const margemBruta = valorFaturado > 0 ? ((valorFaturado - custoReal) / valorFaturado) * 100 : 0;

    // WIP (Work in Progress) - Projetos em andamento
    const projetosEmAndamento = projetos.filter(p => p.status === 'EM_ANDAMENTO').length;
    const wipValue = projetos
      .filter(p => p.status === 'EM_ANDAMENTO')
      .reduce((sum, p) => sum + (parseFloat(p.valorContratado) - parseFloat(p.valorFaturado)), 0);

    // Distribuição por status
    const porStatus = await prisma.agencyProject.groupBy({
      by: ['status'],
      where: {
        dataInicio: { lte: endDate },
        OR: [
          { dataConclusao: null },
          { dataConclusao: { gte: startDate } }
        ]
      },
      _count: true,
      _sum: {
        valorContratado: true,
        valorFaturado: true,
        horasRealizadas: true
      }
    });

    res.json({
      periodo: `${targetMes}/${targetAno}`,
      totalProjetos,
      horas: {
        estimadas: horasEstimadas.toFixed(2),
        realizadas: horasRealizadas.toFixed(2),
        faturaveis: horasFaturaveis.toFixed(2),
        utilizacao: utilizacao.toFixed(2) + '%'
      },
      financeiro: {
        valorContratado: valorContratado.toFixed(2),
        valorFaturado: valorFaturado.toFixed(2),
        custoReal: custoReal.toFixed(2),
        margemBruta: margemBruta.toFixed(2) + '%',
        blendedRate: blendedRate.toFixed(2)
      },
      wip: {
        projetos: projetosEmAndamento,
        valor: wipValue.toFixed(2)
      },
      distribuicao: porStatus.map(s => ({
        status: s.status,
        quantidade: s._count,
        valorContratado: parseFloat(s._sum.valorContratado || 0).toFixed(2),
        valorFaturado: parseFloat(s._sum.valorFaturado || 0).toFixed(2),
        horas: parseFloat(s._sum.horasRealizadas || 0).toFixed(2)
      })),
      benchmarks: {
        utilizacao: 'Excelente: > 80% | Bom: 70-80%',
        margemBruta: 'Excelente: > 40% | Bom: 30-40%'
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ========================================
// MÉTRICAS - CAMADA 7: TREASURY
// ========================================

// DSO e AR Aging
app.get('/api/metrics/treasury', async (req, res) => {
  try {
    const { mes, ano } = req.query;
    const now = new Date();
    const targetMes = mes ? parseInt(mes) : now.getMonth() + 1;
    const targetAno = ano ? parseInt(ano) : now.getFullYear();

    const startDate = new Date(targetAno, targetMes - 1, 1);
    const endDate = new Date(targetAno, targetMes, 0, 23, 59, 59);

    // Receitas do período
    const receitas = await prisma.transacao.aggregate({
      where: {
        tipo: 'RECEITA',
        statusPagamento: 'PAGO',
        data: { gte: startDate, lte: endDate }
      },
      _sum: { valor: true }
    });

    // Contas a receber (pendentes + atrasadas)
    const contasReceber = await prisma.transacao.findMany({
      where: {
        tipo: 'RECEITA',
        statusPagamento: { in: ['PENDENTE', 'ATRASADO'] }
      }
    });

    const totalAR = contasReceber.reduce((sum, t) => sum + parseFloat(t.valor), 0);

    // DSO = (Contas a Receber / Receitas Totais) × Número de Dias
    const diasNoMes = new Date(targetAno, targetMes, 0).getDate();
    const receitasTotal = parseFloat(receitas._sum.valor || 0);
    const dso = receitasTotal > 0 ? (totalAR / receitasTotal) * diasNoMes : 0;

    // AR Aging
    const hoje = new Date();
    const aging = {
      atual: 0,      // 0-30 dias
      dias30: 0,     // 31-60 dias
      dias60: 0,     // 61-90 dias
      dias90: 0      // > 90 dias
    };

    contasReceber.forEach(t => {
      const diasAtraso = Math.floor((hoje - new Date(t.data)) / (1000 * 60 * 60 * 24));
      const valor = parseFloat(t.valor);

      if (diasAtraso <= 30) aging.atual += valor;
      else if (diasAtraso <= 60) aging.dias30 += valor;
      else if (diasAtraso <= 90) aging.dias60 += valor;
      else aging.dias90 += valor;
    });

    // Métodos de pagamento
    const porMetodo = await prisma.transacao.groupBy({
      by: ['metodoPagamento'],
      where: {
        tipo: 'RECEITA',
        statusPagamento: 'PAGO',
        data: { gte: startDate, lte: endDate }
      },
      _sum: { valor: true },
      _count: true
    });

    // Cash balance do mês
    const cashBalance = await prisma.cashBalance.findFirst({
      where: { mes: targetMes, ano: targetAno }
    });

    res.json({
      periodo: `${targetMes}/${targetAno}`,
      dso: dso.toFixed(1) + ' dias',
      contasReceber: {
        total: totalAR.toFixed(2),
        quantidade: contasReceber.length
      },
      arAging: {
        atual: aging.atual.toFixed(2),
        dias30: aging.dias30.toFixed(2),
        dias60: aging.dias60.toFixed(2),
        dias90: aging.dias90.toFixed(2)
      },
      metodosPagamento: porMetodo.map(m => ({
        metodo: m.metodoPagamento,
        valor: parseFloat(m._sum.valor || 0).toFixed(2),
        quantidade: m._count
      })),
      cashBalance: cashBalance ? {
        saldoInicial: parseFloat(cashBalance.saldoInicial).toFixed(2),
        entradas: parseFloat(cashBalance.entradas).toFixed(2),
        saidas: parseFloat(cashBalance.saidas).toFixed(2),
        saldoFinal: parseFloat(cashBalance.saldoFinal).toFixed(2),
        burnRate: cashBalance.burnRate ? parseFloat(cashBalance.burnRate).toFixed(2) : null,
        runway: cashBalance.runwayMeses
      } : null,
      benchmarks: {
        dso: 'Excelente: < 30 dias | Bom: 30-45 dias | Atenção: > 45 dias'
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ========================================
// ROTAS - CONFIGURAÇÃO
// ========================================

// Obter configuração atual
app.get('/api/configuracao', async (req, res) => {
  try {
    let config = await prisma.configuracao.findFirst();

    // Se não existir configuração, criar uma padrão
    if (!config) {
      config = await prisma.configuracao.create({
        data: {
          nomeAgencia: 'Minha Agência',
          tema: 'LIGHT',
          corPrimaria: '#3B82F6',
          corSecundaria: '#10B981'
        }
      });
    }

    res.json(config);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Atualizar configuração
app.put('/api/configuracao', async (req, res) => {
  try {
    let config = await prisma.configuracao.findFirst();

    if (!config) {
      // Criar se não existir
      config = await prisma.configuracao.create({
        data: req.body
      });
    } else {
      // Atualizar existente
      config = await prisma.configuracao.update({
        where: { id: config.id },
        data: req.body
      });
    }

    res.json(config);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Upload de logotipo
app.post('/api/configuracao/upload-logo', upload.single('logo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Nenhum arquivo enviado' });
    }

    const logoUrl = `/uploads/${req.file.filename}`;

    // Atualizar configuração com novo logo
    let config = await prisma.configuracao.findFirst();

    if (!config) {
      config = await prisma.configuracao.create({
        data: {
          nomeAgencia: 'Minha Agência',
          logoUrl,
          tema: 'LIGHT'
        }
      });
    } else {
      // Deletar logo antigo se existir
      if (config.logoUrl) {
        const oldLogoPath = path.join(__dirname, '..', config.logoUrl);
        if (fs.existsSync(oldLogoPath)) {
          fs.unlinkSync(oldLogoPath);
        }
      }

      config = await prisma.configuracao.update({
        where: { id: config.id },
        data: { logoUrl }
      });
    }

    res.json({
      message: 'Logo atualizado com sucesso',
      logoUrl,
      config
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
