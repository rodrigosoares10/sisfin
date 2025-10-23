import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { User } from '../entities/User';
import { CentroCusto } from '../entities/CentroCusto';
import { Transacao } from '../entities/Transacao';
import { Produto } from '../entities/Produto';
import { Cliente } from '../entities/Cliente';

dotenv.config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_DATABASE || 'sisfin',
  synchronize: process.env.NODE_ENV === 'development', // Auto-sync schema in dev
  logging: process.env.NODE_ENV === 'development',
  entities: [User, CentroCusto, Transacao, Produto, Cliente],
  migrations: ['src/migrations/**/*.ts'],
  subscribers: [],
});
