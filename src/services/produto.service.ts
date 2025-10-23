import { AppDataSource } from '../config/database';
import { Produto } from '../entities/Produto';
import { AppError } from '../middleware/error.middleware';

export class ProdutoService {
  private repository = AppDataSource.getRepository(Produto);

  async getAll() {
    return await this.repository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async getById(id: number) {
    const produto = await this.repository.findOne({
      where: { id },
    });

    if (!produto) {
      throw new AppError('Produto não encontrado', 404);
    }

    return produto;
  }

  async create(data: Partial<Produto>) {
    const produto = this.repository.create(data);
    return await this.repository.save(produto);
  }

  async update(id: number, data: Partial<Produto>) {
    const produto = await this.getById(id);

    Object.assign(produto, data);

    return await this.repository.save(produto);
  }

  async delete(id: number) {
    const produto = await this.getById(id);
    return await this.repository.remove(produto);
  }

  async getMRR() {
    const produtos = await this.repository.find({
      where: { ativo: true },
    });

    const mrr = produtos.reduce((sum, produto) => {
      return sum + (Number(produto.precoRecorrente) || 0);
    }, 0);

    return {
      mrr,
      totalProdutosRecorrentes: produtos.filter((p) => p.precoRecorrente).length,
      detalhes: produtos
        .filter((p) => p.precoRecorrente)
        .map((p) => ({
          id: p.id,
          nome: p.nome,
          precoRecorrente: p.precoRecorrente,
        })),
    };
  }
}
