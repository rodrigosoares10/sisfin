import { Request, Response, NextFunction } from 'express';
import { ProdutoService } from '../services/produto.service';

const service = new ProdutoService();

export class ProdutoController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const produtos = await service.getAll();
      res.status(200).json({
        success: true,
        data: produtos,
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const produto = await service.getById(Number(req.params.id));
      res.status(200).json({
        success: true,
        data: produto,
      });
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const produto = await service.create(req.body);
      res.status(201).json({
        success: true,
        data: produto,
        message: 'Produto criado com sucesso',
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const produto = await service.update(Number(req.params.id), req.body);
      res.status(200).json({
        success: true,
        data: produto,
        message: 'Produto atualizado com sucesso',
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await service.delete(Number(req.params.id));
      res.status(200).json({
        success: true,
        message: 'Produto excluído com sucesso',
      });
    } catch (error) {
      next(error);
    }
  }

  async getMRR(req: Request, res: Response, next: NextFunction) {
    try {
      const mrr = await service.getMRR();
      res.status(200).json({
        success: true,
        data: mrr,
      });
    } catch (error) {
      next(error);
    }
  }
}
