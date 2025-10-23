import { Request, Response, NextFunction } from 'express';
import { DashboardService } from '../services/dashboard.service';

const service = new DashboardService();

export class DashboardController {
  async getResumo(req: Request, res: Response, next: NextFunction) {
    try {
      const { mes, ano } = req.query;
      const resumo = await service.getResumo(
        mes ? Number(mes) : undefined,
        ano ? Number(ano) : undefined
      );
      res.status(200).json({
        success: true,
        data: resumo,
      });
    } catch (error) {
      next(error);
    }
  }

  async getGraficos(req: Request, res: Response, next: NextFunction) {
    try {
      const { periodo } = req.query;
      const graficos = await service.getGraficos(periodo as string);
      res.status(200).json({
        success: true,
        data: graficos,
      });
    } catch (error) {
      next(error);
    }
  }
}

export class RelatorioController {
  async getFluxoCaixa(req: Request, res: Response, next: NextFunction) {
    try {
      const { dataInicio, dataFim } = req.query;

      if (!dataInicio || !dataFim) {
        return res.status(400).json({
          success: false,
          error: 'Parâmetros dataInicio e dataFim são obrigatórios',
        });
      }

      const fluxoCaixa = await service.getFluxoCaixa(
        dataInicio as string,
        dataFim as string
      );

      res.status(200).json({
        success: true,
        data: fluxoCaixa,
      });
    } catch (error) {
      next(error);
    }
  }
}
