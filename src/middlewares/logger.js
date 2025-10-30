import morgan from 'morgan';

/**
 * Configuração do Morgan para logging de requisições
 */
export const logger = morgan(
  process.env.NODE_ENV === 'production'
    ? 'combined' // Formato Apache padrão
    : 'dev' // Formato colorido e simplificado
);
