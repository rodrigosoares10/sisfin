import { Router } from 'express';
import { ClienteController } from '../controllers/cliente.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { createClienteSchema, updateClienteSchema } from '../utils/validators';

const router = Router();
const controller = new ClienteController();

// Todas as rotas requerem autenticação
router.use(authMiddleware);

router.get('/', controller.getAll);
router.get('/:id', controller.getById);
router.post('/', validate(createClienteSchema), controller.create);
router.put('/:id', validate(updateClienteSchema), controller.update);
router.delete('/:id', controller.delete);

export default router;
