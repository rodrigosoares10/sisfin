const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Erro de validação',
      details: err.errors,
    });
  }

  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: 'Token inválido',
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: 'Token expirado',
    });
  }

  if (err.code === 'P2002') {
    return res.status(409).json({
      error: 'Registro duplicado',
      field: err.meta?.target,
    });
  }

  if (err.code === 'P2025') {
    return res.status(404).json({
      error: 'Registro não encontrado',
    });
  }

  res.status(err.status || 500).json({
    error: err.message || 'Erro interno do servidor',
  });
};

module.exports = errorHandler;
