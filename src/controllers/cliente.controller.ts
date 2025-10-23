import { Request, Response, NextFunction } from 'express';
import { ClienteService } from '../services/cliente.service';

const service = new ClienteService();

export class ClienteController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const clientes = await service.getAll();
      res.status(200).json({
        success: true,
        data: clientes,
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const cliente = await service.getById(Number(req.params.id));
      res.status(200).json({
        success: true,
        data: cliente,
      });
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const cliente = await service.create(req.body);
      res.status(201).json({
        success: true,
        data: cliente,
        message: 'Cliente criado com sucesso',
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const cliente = await service.update(Number(req.params.id), req.body);
      res.status(200).json({
        success: true,
        data: cliente,
        message: 'Cliente atualizado com sucesso',
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
        message: 'Cliente excluído com sucesso',
      });
    } catch (error) {
      next(error);
    }
  }
}
