import prisma from '../config/database.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// GET /api/usuarios - Listar todos usuários
export const getUsuarios = asyncHandler(async (req, res) => {
  const { ativo, role } = req.query;

  const where = {};
  if (ativo !== undefined) where.ativo = ativo === 'true';
  if (role) where.role = role;

  const usuarios = await prisma.usuario.findMany({
    where,
    select: {
      id: true,
      nome: true,
      email: true,
      role: true,
      ativo: true,
      createdAt: true,
      updatedAt: true,
      // Não retornar senha
    },
    orderBy: { createdAt: 'desc' },
  });

  res.json({
    success: true,
    count: usuarios.length,
    data: usuarios,
  });
});

// GET /api/usuarios/:id - Buscar usuário por ID
export const getUsuarioById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const usuario = await prisma.usuario.findUnique({
    where: { id },
    select: {
      id: true,
      nome: true,
      email: true,
      role: true,
      ativo: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!usuario) {
    throw ApiError.notFound('Usuário não encontrado');
  }

  res.json({
    success: true,
    data: usuario,
  });
});

// POST /api/usuarios - Criar novo usuário
export const createUsuario = asyncHandler(async (req, res) => {
  const { nome, email, senha, role } = req.body;

  if (!nome || !email || !senha) {
    throw ApiError.badRequest('Nome, email e senha são obrigatórios');
  }

  // Verificar se email já existe
  const emailExists = await prisma.usuario.findUnique({ where: { email } });
  if (emailExists) {
    throw ApiError.conflict('Email já cadastrado');
  }

  const usuario = await prisma.usuario.create({
    data: {
      nome,
      email,
      senha, // Em produção, usar bcrypt para hash
      role: role || 'USUARIO',
    },
    select: {
      id: true,
      nome: true,
      email: true,
      role: true,
      ativo: true,
      createdAt: true,
    },
  });

  res.status(201).json({
    success: true,
    message: 'Usuário criado com sucesso',
    data: usuario,
  });
});

// PUT /api/usuarios/:id - Atualizar usuário
export const updateUsuario = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { nome, email, role, ativo } = req.body;

  // Verificar se usuário existe
  const usuarioExists = await prisma.usuario.findUnique({ where: { id } });
  if (!usuarioExists) {
    throw ApiError.notFound('Usuário não encontrado');
  }

  // Se mudar email, verificar se não está duplicado
  if (email && email !== usuarioExists.email) {
    const emailExists = await prisma.usuario.findUnique({ where: { email } });
    if (emailExists) {
      throw ApiError.conflict('Email já cadastrado');
    }
  }

  const usuario = await prisma.usuario.update({
    where: { id },
    data: {
      ...(nome && { nome }),
      ...(email && { email }),
      ...(role && { role }),
      ...(ativo !== undefined && { ativo }),
    },
    select: {
      id: true,
      nome: true,
      email: true,
      role: true,
      ativo: true,
      updatedAt: true,
    },
  });

  res.json({
    success: true,
    message: 'Usuário atualizado com sucesso',
    data: usuario,
  });
});

// DELETE /api/usuarios/:id - Deletar usuário
export const deleteUsuario = asyncHandler(async (req, res) => {
  const { id } = req.params;

  await prisma.usuario.delete({
    where: { id },
  });

  res.json({
    success: true,
    message: 'Usuário deletado com sucesso',
  });
});
