import { Router } from 'express';
import { DashboardController } from '../controllers/dashboard.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();
const controller = new DashboardController();

// Todas as rotas requerem autenticação
router.use(authMiddleware);

router.get('/resumo', controller.getResumo);
router.get('/graficos', controller.getGraficos);

export default router;
