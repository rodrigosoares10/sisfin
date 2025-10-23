import { Router } from 'express';
import { CentroCustoController } from '../controllers/centrocusto.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { createCentroCustoSchema, updateCentroCustoSchema } from '../utils/validators';

const router = Router();
const controller = new CentroCustoController();

// Todas as rotas requerem autenticação
router.use(authMiddleware);

router.get('/', controller.getAll);
router.get('/:id', controller.getById);
router.post('/', validate(createCentroCustoSchema), controller.create);
router.put('/:id', validate(updateCentroCustoSchema), controller.update);
router.delete('/:id', controller.delete);

export default router;
