import 'reflect-metadata';
import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { config } from './config/env';
import { errorHandler } from './middleware/error.middleware';

// Import routes
import authRoutes from './routes/auth.routes';
import centroCustoRoutes from './routes/centrocusto.routes';
import transacaoRoutes from './routes/transacao.routes';
import produtoRoutes from './routes/produto.routes';
import clienteRoutes from './routes/cliente.routes';
import dashboardRoutes from './routes/dashboard.routes';
import relatorioRoutes from './routes/relatorio.routes';

export const createApp = (): Application => {
  const app = express();

  // Security middleware
  app.use(helmet());

  // CORS
  app.use(
    cors({
      origin: config.cors.origin,
      credentials: true,
    })
  );

  // Rate limiting
  const limiter = rateLimit({
    windowMs: config.rateLimit.windowMs,
    max: config.rateLimit.max,
    message: {
      success: false,
      error: 'Muitas requisições. Tente novamente mais tarde.',
    },
  });

  app.use('/api/', limiter);

  // Body parser
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Health check
  app.get('/health', (req, res) => {
    res.status(200).json({
      success: true,
      message: 'API is running',
      timestamp: new Date().toISOString(),
    });
  });

  // API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/centros-custo', centroCustoRoutes);
  app.use('/api/transacoes', transacaoRoutes);
  app.use('/api/produtos', produtoRoutes);
  app.use('/api/clientes', clienteRoutes);
  app.use('/api/dashboard', dashboardRoutes);
  app.use('/api/relatorios', relatorioRoutes);

  // 404 handler
  app.use((req, res) => {
    res.status(404).json({
      success: false,
      error: 'Endpoint não encontrado',
    });
  });

  // Error handler (must be last)
  app.use(errorHandler);

  return app;
};
