import { AppDataSource } from '../config/database';
import { CentroCusto } from '../entities/CentroCusto';
import { AppError } from '../middleware/error.middleware';

export class CentroCustoService {
  private repository = AppDataSource.getRepository(CentroCusto);

  async getAll() {
    return await this.repository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async getById(id: number) {
    const centroCusto = await this.repository.findOne({
      where: { id },
      relations: ['transacoes'],
    });

    if (!centroCusto) {
      throw new AppError('Centro de custo não encontrado', 404);
    }

    return centroCusto;
  }

  async create(data: Partial<CentroCusto>) {
    const centroCusto = this.repository.create(data);
    return await this.repository.save(centroCusto);
  }

  async update(id: number, data: Partial<CentroCusto>) {
    const centroCusto = await this.getById(id);

    Object.assign(centroCusto, data);

    return await this.repository.save(centroCusto);
  }

  async delete(id: number) {
    const centroCusto = await this.getById(id);

    // Soft delete - apenas desativa
    centroCusto.ativo = false;

    return await this.repository.save(centroCusto);
  }
}
