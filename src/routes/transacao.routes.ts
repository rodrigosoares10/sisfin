import { Router } from 'express';
import { TransacaoController } from '../controllers/transacao.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { createTransacaoSchema, updateTransacaoSchema } from '../utils/validators';

const router = Router();
const controller = new TransacaoController();

// Todas as rotas requerem autenticação
router.use(authMiddleware);

router.get('/', controller.getAll);
router.get('/resumo', controller.getResumo);
router.get('/:id', controller.getById);
router.post('/', validate(createTransacaoSchema), controller.create);
router.put('/:id', validate(updateTransacaoSchema), controller.update);
router.delete('/:id', controller.delete);

export default router;
