import { Router } from 'express';
import {
  getTransacoes,
  getResumoTransacoes,
  getTransacaoById,
  createTransacao,
  updateTransacao,
  deleteTransacao,
} from '../controllers/transacao.controller.js';

const router = Router();

/**
 * @route GET /api/transacoes
 * @desc Listar todas transações
 * @query tipo=RECEITA/DESPESA - Filtrar por tipo
 * @query statusPagamento - Filtrar por status
 * @query centroCustoId - Filtrar por centro de custo
 * @query clienteId - Filtrar por cliente
 * @query produtoId - Filtrar por produto
 * @query recorrente=true/false - Filtrar por recorrência
 * @query dataInicio - Data início (ISO)
 * @query dataFim - Data fim (ISO)
 * @query page=1 - Página
 * @query limit=50 - Itens por página
 */
router.get('/', getTransacoes);

/**
 * @route GET /api/transacoes/resumo
 * @desc Obter resumo financeiro (receitas, despesas, saldo)
 * @query dataInicio - Data início (ISO)
 * @query dataFim - Data fim (ISO)
 * @query centroCustoId - Filtrar por centro de custo
 */
router.get('/resumo', getResumoTransacoes);

/**
 * @route GET /api/transacoes/:id
 * @desc Buscar transação por ID
 */
router.get('/:id', getTransacaoById);

/**
 * @route POST /api/transacoes
 * @desc Criar nova transação
 * @body { tipo, valor, descricao, centroCustoId, metodoPagamento, data?, categoria?, recorrente?, frequencia?, statusPagamento?, anexoUrl?, clienteId?, produtoId? }
 */
router.post('/', createTransacao);

/**
 * @route PUT /api/transacoes/:id
 * @desc Atualizar transação
 */
router.put('/:id', updateTransacao);

/**
 * @route DELETE /api/transacoes/:id
 * @desc Deletar transação
 */
router.delete('/:id', deleteTransacao);

export default router;
