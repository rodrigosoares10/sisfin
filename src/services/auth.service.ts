import bcrypt from 'bcrypt';
import { AppDataSource } from '../config/database';
import { User } from '../entities/User';
import { LoginRequest, RegisterRequest } from '../types';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { AppError } from '../middleware/error.middleware';

export class AuthService {
  private userRepository = AppDataSource.getRepository(User);

  async register(data: RegisterRequest) {
    const existingUser = await this.userRepository.findOne({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new AppError('Email já cadastrado', 400);
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = this.userRepository.create({
      email: data.email,
      password: hashedPassword,
      nome: data.nome,
    });

    await this.userRepository.save(user);

    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
    });

    const refreshToken = generateRefreshToken({
      userId: user.id,
      email: user.email,
    });

    user.refreshToken = refreshToken;
    await this.userRepository.save(user);

    return {
      user: {
        id: user.id,
        email: user.email,
        nome: user.nome,
      },
      accessToken,
      refreshToken,
    };
  }

  async login(data: LoginRequest) {
    const user = await this.userRepository.findOne({
      where: { email: data.email },
    });

    if (!user) {
      throw new AppError('Credenciais inválidas', 401);
    }

    const isPasswordValid = await bcrypt.compare(data.password, user.password);

    if (!isPasswordValid) {
      throw new AppError('Credenciais inválidas', 401);
    }

    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
    });

    const refreshToken = generateRefreshToken({
      userId: user.id,
      email: user.email,
    });

    user.refreshToken = refreshToken;
    await this.userRepository.save(user);

    return {
      user: {
        id: user.id,
        email: user.email,
        nome: user.nome,
      },
      accessToken,
      refreshToken,
    };
  }

  async refresh(token: string) {
    try {
      const payload = verifyRefreshToken(token);

      const user = await this.userRepository.findOne({
        where: { id: payload.userId },
      });

      if (!user || user.refreshToken !== token) {
        throw new AppError('Token inválido', 401);
      }

      const accessToken = generateAccessToken({
        userId: user.id,
        email: user.email,
      });

      const refreshToken = generateRefreshToken({
        userId: user.id,
        email: user.email,
      });

      user.refreshToken = refreshToken;
      await this.userRepository.save(user);

      return {
        accessToken,
        refreshToken,
      };
    } catch (error) {
      throw new AppError('Token inválido ou expirado', 401);
    }
  }
}
