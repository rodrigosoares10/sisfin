import { Router } from 'express';
import {
  getUsuarios,
  getUsuarioById,
  createUsuario,
  updateUsuario,
  deleteUsuario,
} from '../controllers/usuario.controller.js';

const router = Router();

/**
 * @route GET /api/usuarios
 * @desc Listar todos usuários
 * @query ativo=true/false - Filtrar por status
 * @query role=ADMIN/USUARIO/VISUALIZADOR - Filtrar por role
 */
router.get('/', getUsuarios);

/**
 * @route GET /api/usuarios/:id
 * @desc Buscar usuário por ID
 */
router.get('/:id', getUsuarioById);

/**
 * @route POST /api/usuarios
 * @desc Criar novo usuário
 * @body { nome, email, senha, role }
 */
router.post('/', createUsuario);

/**
 * @route PUT /api/usuarios/:id
 * @desc Atualizar usuário
 * @body { nome?, email?, role?, ativo? }
 */
router.put('/:id', updateUsuario);

/**
 * @route DELETE /api/usuarios/:id
 * @desc Deletar usuário
 */
router.delete('/:id', deleteUsuario);

export default router;
