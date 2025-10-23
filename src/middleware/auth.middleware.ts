import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt';
import { AppDataSource } from '../config/database';
import { User } from '../entities/User';

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        error: 'Token de autenticação não fornecido',
      });
    }

    const [bearer, token] = authHeader.split(' ');

    if (bearer !== 'Bearer' || !token) {
      return res.status(401).json({
        success: false,
        error: 'Formato de token inválido',
      });
    }

    const payload = verifyAccessToken(token);

    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({
      where: { id: payload.userId },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Usuário não encontrado',
      });
    }

    req.user = user;
    req.userId = user.id;

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: 'Token inválido ou expirado',
    });
  }
};
