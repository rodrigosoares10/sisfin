// Sistema Financeiro - API REST
// Servidor Express.js com Prisma ORM

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { PrismaClient } = require('@prisma/client');

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
    version: '1.0.0',
    endpoints: {
      health: '/health',
      transacoes: '/api/transacoes',
      clientes: '/api/clientes',
      produtos: '/api/produtos',
      centrosCusto: '/api/centros-custo',
      metas: '/api/metas',
      configuracao: '/api/configuracao',
      uploadLogo: '/api/configuracao/upload-logo'
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
