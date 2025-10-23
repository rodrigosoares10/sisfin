import { Request, Response, NextFunction } from 'express';
import { TransacaoService } from '../services/transacao.service';

const service = new TransacaoService();

export class TransacaoController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const transacoes = await service.getAll(req.query);
      res.status(200).json({
        success: true,
        data: transacoes,
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const transacao = await service.getById(Number(req.params.id));
      res.status(200).json({
        success: true,
        data: transacao,
      });
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const transacao = await service.create(req.body);
      res.status(201).json({
        success: true,
        data: transacao,
        message: 'Transação criada com sucesso',
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const transacao = await service.update(Number(req.params.id), req.body);
      res.status(200).json({
        success: true,
        data: transacao,
        message: 'Transação atualizada com sucesso',
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
        message: 'Transação excluída com sucesso',
      });
    } catch (error) {
      next(error);
    }
  }

  async getResumo(req: Request, res: Response, next: NextFunction) {
    try {
      const { dataInicio, dataFim } = req.query;
      const resumo = await service.getResumo(
        dataInicio as string,
        dataFim as string
      );
      res.status(200).json({
        success: true,
        data: resumo,
      });
    } catch (error) {
      next(error);
    }
  }
}
