import { Router } from 'express';
import { RelatorioController } from '../controllers/dashboard.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();
const controller = new RelatorioController();

// Todas as rotas requerem autenticação
router.use(authMiddleware);

router.get('/fluxo-caixa', controller.getFluxoCaixa);

export default router;
