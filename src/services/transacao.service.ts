import { Between } from 'typeorm';
import { AppDataSource } from '../config/database';
import { Transacao } from '../entities/Transacao';
import { AppError } from '../middleware/error.middleware';
import { TransacaoQueryParams } from '../types';

export class TransacaoService {
  private repository = AppDataSource.getRepository(Transacao);

  async getAll(params: TransacaoQueryParams) {
    const where: any = {};

    // Filtro por período
    if (params.dataInicio && params.dataFim) {
      where.data = Between(new Date(params.dataInicio), new Date(params.dataFim));
    }

    // Filtro por tipo
    if (params.tipo) {
      where.tipo = params.tipo;
    }

    // Filtro por centro de custo
    if (params.centroCustoId) {
      where.centroCustoId = params.centroCustoId;
    }

    return await this.repository.find({
      where,
      relations: ['centroCusto'],
      order: { data: 'DESC' },
    });
  }

  async getById(id: number) {
    const transacao = await this.repository.findOne({
      where: { id },
      relations: ['centroCusto'],
    });

    if (!transacao) {
      throw new AppError('Transação não encontrada', 404);
    }

    return transacao;
  }

  async create(data: Partial<Transacao>) {
    const transacao = this.repository.create(data);
    return await this.repository.save(transacao);
  }

  async update(id: number, data: Partial<Transacao>) {
    const transacao = await this.getById(id);

    Object.assign(transacao, data);

    return await this.repository.save(transacao);
  }

  async delete(id: number) {
    const transacao = await this.getById(id);
    return await this.repository.remove(transacao);
  }

  async getResumo(dataInicio?: string, dataFim?: string) {
    const where: any = {};

    if (dataInicio && dataFim) {
      where.data = Between(new Date(dataInicio), new Date(dataFim));
    }

    const transacoes = await this.repository.find({ where });

    const receitas = transacoes
      .filter((t) => t.tipo === 'receita')
      .reduce((sum, t) => sum + Number(t.valor), 0);

    const despesas = transacoes
      .filter((t) => t.tipo === 'despesa')
      .reduce((sum, t) => sum + Number(t.valor), 0);

    const lucro = receitas - despesas;

    return {
      receitas,
      despesas,
      lucro,
      periodo: {
        inicio: dataInicio || null,
        fim: dataFim || null,
      },
    };
  }
}
