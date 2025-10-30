import { Router } from 'express';
import {
  getMetas,
  getMetaById,
  getProgressoMeta,
  createMeta,
  updateMeta,
  deleteMeta,
} from '../controllers/meta.controller.js';

const router = Router();

/**
 * @route GET /api/metas
 * @desc Listar todas metas
 * @query tipo=RECEITA/DESPESA/LUCRO - Filtrar por tipo
 * @query ano - Filtrar por ano
 * @query mes - Filtrar por mês (1-12)
 * @query centroCustoId - Filtrar por centro de custo
 */
router.get('/', getMetas);

/**
 * @route GET /api/metas/:id
 * @desc Buscar meta por ID
 */
router.get('/:id', getMetaById);

/**
 * @route GET /api/metas/:id/progresso
 * @desc Ver progresso da meta (comparação com valores realizados)
 */
router.get('/:id/progresso', getProgressoMeta);

/**
 * @route POST /api/metas
 * @desc Criar nova meta
 * @body { tipo, valorMeta, mes, ano, descricao?, centroCustoId? }
 */
router.post('/', createMeta);

/**
 * @route PUT /api/metas/:id
 * @desc Atualizar meta
 * @body { tipo?, valorMeta?, mes?, ano?, descricao?, centroCustoId? }
 */
router.put('/:id', updateMeta);

/**
 * @route DELETE /api/metas/:id
 * @desc Deletar meta
 */
router.delete('/:id', deleteMeta);

export default router;
