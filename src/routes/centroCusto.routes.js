import { Router } from 'express';
import {
  getCentrosCusto,
  getCentroCustoById,
  createCentroCusto,
  updateCentroCusto,
  deleteCentroCusto,
} from '../controllers/centroCusto.controller.js';

const router = Router();

/**
 * @route GET /api/centros-custo
 * @desc Listar todos centros de custo
 * @query ativo=true/false - Filtrar por status
 */
router.get('/', getCentrosCusto);

/**
 * @route GET /api/centros-custo/:id
 * @desc Buscar centro de custo por ID
 */
router.get('/:id', getCentroCustoById);

/**
 * @route POST /api/centros-custo
 * @desc Criar novo centro de custo
 * @body { nome, descricao?, cor? }
 */
router.post('/', createCentroCusto);

/**
 * @route PUT /api/centros-custo/:id
 * @desc Atualizar centro de custo
 * @body { nome?, descricao?, cor?, ativo? }
 */
router.put('/:id', updateCentroCusto);

/**
 * @route DELETE /api/centros-custo/:id
 * @desc Deletar centro de custo
 */
router.delete('/:id', deleteCentroCusto);

export default router;
