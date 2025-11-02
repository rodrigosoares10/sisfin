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
    version: '2.0.0',
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
