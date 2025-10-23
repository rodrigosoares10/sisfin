import { Router } from 'express';
import { ProdutoController } from '../controllers/produto.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { createProdutoSchema, updateProdutoSchema } from '../utils/validators';

const router = Router();
const controller = new ProdutoController();

// Todas as rotas requerem autenticação
router.use(authMiddleware);

router.get('/', controller.getAll);
router.get('/mrr', controller.getMRR);
router.get('/:id', controller.getById);
router.post('/', validate(createProdutoSchema), controller.create);
router.put('/:id', validate(updateProdutoSchema), controller.update);
router.delete('/:id', controller.delete);

export default router;
