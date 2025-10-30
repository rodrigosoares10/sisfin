import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { logger } from './middlewares/logger.js';
import { errorHandler, notFound } from './middlewares/errorHandler.js';
import './config/database.js'; // Inicializa conexão com banco

// Rotas
import usuarioRoutes from './routes/usuario.routes.js';
import centroCustoRoutes from './routes/centroCusto.routes.js';
import clienteRoutes from './routes/cliente.routes.js';
import produtoRoutes from './routes/produto.routes.js';
import transacaoRoutes from './routes/transacao.routes.js';
import metaRoutes from './routes/meta.routes.js';

const app = express();
const PORT = process.env.PORT || 3000;

// ========================================
// MIDDLEWARES GLOBAIS
// ========================================

// Segurança
app.use(helmet());

// CORS
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
}));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // Limite de 100 requisições por IP
  message: 'Muitas requisições deste IP, tente novamente mais tarde.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Body Parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logger
app.use(logger);

// ========================================
// ROTAS
// ========================================

// Health Check
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'SisFin API - Sistema Financeiro',
    version: '1.0.0',
    status: 'online',
    timestamp: new Date().toISOString(),
  });
});

app.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/centros-custo', centroCustoRoutes);
app.use('/api/clientes', clienteRoutes);
app.use('/api/produtos', produtoRoutes);
app.use('/api/transacoes', transacaoRoutes);
app.use('/api/metas', metaRoutes);

// ========================================
// ERROR HANDLING
// ========================================

// 404 Handler
app.use(notFound);

// Error Handler
app.use(errorHandler);

// ========================================
// SERVIDOR
// ========================================

app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════╗
║   💰 SisFin API - Sistema Financeiro      ║
╠═══════════════════════════════════════════╣
║   🚀 Servidor rodando na porta ${PORT}      ║
║   📝 Ambiente: ${process.env.NODE_ENV || 'development'}              ║
║   🌐 URL: http://localhost:${PORT}          ║
║   📚 Docs: http://localhost:${PORT}/api     ║
╚═══════════════════════════════════════════╝
  `);
});

// Graceful Shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM recebido, encerrando servidor...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT recebido, encerrando servidor...');
  process.exit(0);
});

export default app;
