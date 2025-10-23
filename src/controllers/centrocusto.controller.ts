import { Request, Response, NextFunction } from 'express';
import { CentroCustoService } from '../services/centrocusto.service';

const service = new CentroCustoService();

export class CentroCustoController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const centrosCusto = await service.getAll();
      res.status(200).json({
        success: true,
        data: centrosCusto,
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const centroCusto = await service.getById(Number(req.params.id));
      res.status(200).json({
        success: true,
        data: centroCusto,
      });
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const centroCusto = await service.create(req.body);
      res.status(201).json({
        success: true,
        data: centroCusto,
        message: 'Centro de custo criado com sucesso',
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const centroCusto = await service.update(Number(req.params.id), req.body);
      res.status(200).json({
        success: true,
        data: centroCusto,
        message: 'Centro de custo atualizado com sucesso',
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
        message: 'Centro de custo desativado com sucesso',
      });
    } catch (error) {
      next(error);
    }
  }
}
