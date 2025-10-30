import { Router } from 'express';
import {
  getProdutos,
  getProdutoById,
  createProduto,
  updateProduto,
  deleteProduto,
} from '../controllers/produto.controller.js';

const router = Router();

/**
 * @route GET /api/produtos
 * @desc Listar todos produtos
 * @query ativo=true/false - Filtrar por status
 * @query tipo=UNICO/MRR - Filtrar por tipo
 */
router.get('/', getProdutos);

/**
 * @route GET /api/produtos/:id
 * @desc Buscar produto por ID
 */
router.get('/:id', getProdutoById);

/**
 * @route POST /api/produtos
 * @desc Criar novo produto
 * @body { nome, tipo, valor, descricao? }
 */
router.post('/', createProduto);

/**
 * @route PUT /api/produtos/:id
 * @desc Atualizar produto
 * @body { nome?, tipo?, valor?, descricao?, ativo? }
 */
router.put('/:id', updateProduto);

/**
 * @route DELETE /api/produtos/:id
 * @desc Deletar produto
 */
router.delete('/:id', deleteProduto);

export default router;
