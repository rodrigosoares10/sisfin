import { AppDataSource } from '../config/database';
import { Cliente } from '../entities/Cliente';
import { AppError } from '../middleware/error.middleware';

export class ClienteService {
  private repository = AppDataSource.getRepository(Cliente);

  async getAll() {
    return await this.repository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async getById(id: number) {
    const cliente = await this.repository.findOne({
      where: { id },
    });

    if (!cliente) {
      throw new AppError('Cliente não encontrado', 404);
    }

    return cliente;
  }

  async create(data: Partial<Cliente>) {
    // Verificar se email já existe
    const existingCliente = await this.repository.findOne({
      where: { email: data.email },
    });

    if (existingCliente) {
      throw new AppError('Email já cadastrado', 400);
    }

    const cliente = this.repository.create(data);
    return await this.repository.save(cliente);
  }

  async update(id: number, data: Partial<Cliente>) {
    const cliente = await this.getById(id);

    // Se estiver atualizando email, verificar se já existe
    if (data.email && data.email !== cliente.email) {
      const existingCliente = await this.repository.findOne({
        where: { email: data.email },
      });

      if (existingCliente) {
        throw new AppError('Email já cadastrado', 400);
      }
    }

    Object.assign(cliente, data);

    return await this.repository.save(cliente);
  }

  async delete(id: number) {
    const cliente = await this.getById(id);
    return await this.repository.remove(cliente);
  }
}
