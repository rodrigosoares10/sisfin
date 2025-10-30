import { Router } from 'express';
import {
  getClientes,
  getClienteById,
  createCliente,
  updateCliente,
  deleteCliente,
} from '../controllers/cliente.controller.js';

const router = Router();

/**
 * @route GET /api/clientes
 * @desc Listar todos clientes
 * @query ativo=true/false - Filtrar por status
 * @query tipo=PESSOA_FISICA/PESSOA_JURIDICA - Filtrar por tipo
 */
router.get('/', getClientes);

/**
 * @route GET /api/clientes/:id
 * @desc Buscar cliente por ID
 * @query includeTransacoes=true - Incluir últimas 10 transações
 */
router.get('/:id', getClienteById);

/**
 * @route POST /api/clientes
 * @desc Criar novo cliente
 * @body { nome, email?, telefone?, empresa?, tipo? }
 */
router.post('/', createCliente);

/**
 * @route PUT /api/clientes/:id
 * @desc Atualizar cliente
 * @body { nome?, email?, telefone?, empresa?, tipo?, ativo? }
 */
router.put('/:id', updateCliente);

/**
 * @route DELETE /api/clientes/:id
 * @desc Deletar cliente
 */
router.delete('/:id', deleteCliente);

export default router;
