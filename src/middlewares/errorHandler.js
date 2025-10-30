import { Prisma } from '@prisma/client';
import { ApiError } from '../utils/ApiError.js';

/**
 * Middleware para tratamento de erros
 */
export const errorHandler = (err, req, res, next) => {
  let error = err;

  // Prisma Errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case 'P2002':
        error = ApiError.conflict(
          `Registro duplicado: ${err.meta?.target?.join(', ') || 'campo único'}`
        );
        break;
      case 'P2025':
        error = ApiError.notFound('Registro não encontrado');
        break;
      case 'P2003':
        error = ApiError.badRequest('Violação de chave estrangeira');
        break;
      case 'P2014':
        error = ApiError.badRequest('Violação de relação necessária');
        break;
      default:
        error = ApiError.internal(`Erro de banco de dados: ${err.code}`);
    }
  }

  // Prisma Validation Error
  if (err instanceof Prisma.PrismaClientValidationError) {
    error = ApiError.badRequest('Dados inválidos fornecidos');
  }

  // Default para erros não tratados
  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || 500;
    const message = error.message || 'Erro interno do servidor';
    error = new ApiError(statusCode, message);
  }

  const statusCode = error.statusCode || 500;
  const response = {
    success: false,
    message: error.message,
    ...(error.errors && error.errors.length > 0 && { errors: error.errors }),
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
  };

  console.error(`[ERROR] ${statusCode} - ${error.message}`);
  if (process.env.NODE_ENV === 'development') {
    console.error(error.stack);
  }

  res.status(statusCode).json(response);
};

/**
 * Middleware para rotas não encontradas
 */
export const notFound = (req, res, next) => {
  const error = ApiError.notFound(`Rota não encontrada: ${req.originalUrl}`);
  next(error);
};
