/**
 * Middleware de Controle de Acesso
 * Valida permissões de usuários antes de executar ações
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class PermissaoMiddleware {
  /**
   * Verifica se o usuário tem a permissão necessária
   */
  async verificarPermissao(usuarioId, permissaoTipo) {
    // Busca usuário com suas permissões
    const usuario = await prisma.usuario.findUnique({
      where: { id: usuarioId },
      include: {
        permissoes: {
          include: {
            permissao: true
          }
        }
      }
    });

    if (!usuario || !usuario.ativo) {
      return false;
    }

    // Admin tem todas as permissões
    if (usuario.role === 'ADMIN') {
      return true;
    }

    // Busca permissões da role
    const permissoesRole = await prisma.rolePermissao.findMany({
      where: {
        role: usuario.role
      },
      include: {
        permissao: true
      }
    });

    const permissaoRole = permissoesRole.find(
      p => p.permissao.tipo === permissaoTipo
    );

    // Verifica se a role tem a permissão
    let temPermissao = !!permissaoRole;

    // Verifica permissões específicas do usuário (override)
    const permissaoUsuario = usuario.permissoes.find(
      p => p.permissao.tipo === permissaoTipo
    );

    if (permissaoUsuario) {
      temPermissao = permissaoUsuario.concedida;
    }

    return temPermissao;
  }

  /**
   * Middleware Express para verificar permissão
   */
  requerPermissao(permissaoTipo) {
    return async (req, res, next) => {
      try {
        // Assume que o usuário já foi autenticado e está em req.user
        if (!req.user) {
          return res.status(401).json({
            error: 'Não autenticado'
          });
        }

        const temPermissao = await this.verificarPermissao(
          req.user.id,
          permissaoTipo
        );

        if (!temPermissao) {
          return res.status(403).json({
            error: 'Acesso negado',
            permissaoNecessaria: permissaoTipo
          });
        }

        next();
      } catch (error) {
        console.error('Erro ao verificar permissão:', error);
        return res.status(500).json({
          error: 'Erro ao verificar permissões'
        });
      }
    };
  }

  /**
   * Middleware para verificar múltiplas permissões (OR)
   */
  requerQualquerPermissao(permissoes) {
    return async (req, res, next) => {
      try {
        if (!req.user) {
          return res.status(401).json({
            error: 'Não autenticado'
          });
        }

        for (const permissao of permissoes) {
          const temPermissao = await this.verificarPermissao(
            req.user.id,
            permissao
          );

          if (temPermissao) {
            return next();
          }
        }

        return res.status(403).json({
          error: 'Acesso negado',
          permissoesNecessarias: permissoes
        });
      } catch (error) {
        console.error('Erro ao verificar permissões:', error);
        return res.status(500).json({
          error: 'Erro ao verificar permissões'
        });
      }
    };
  }

  /**
   * Middleware para verificar role
   */
  requerRole(roles) {
    const rolesArray = Array.isArray(roles) ? roles : [roles];

    return async (req, res, next) => {
      try {
        if (!req.user) {
          return res.status(401).json({
            error: 'Não autenticado'
          });
        }

        const usuario = await prisma.usuario.findUnique({
          where: { id: req.user.id }
        });

        if (!usuario || !usuario.ativo) {
          return res.status(403).json({
            error: 'Usuário inativo ou não encontrado'
          });
        }

        if (!rolesArray.includes(usuario.role)) {
          return res.status(403).json({
            error: 'Acesso negado',
            roleNecessaria: rolesArray
          });
        }

        next();
      } catch (error) {
        console.error('Erro ao verificar role:', error);
        return res.status(500).json({
          error: 'Erro ao verificar role'
        });
      }
    };
  }

  /**
   * Lista permissões do usuário
   */
  async listarPermissoesUsuario(usuarioId) {
    const usuario = await prisma.usuario.findUnique({
      where: { id: usuarioId },
      include: {
        permissoes: {
          include: {
            permissao: true
          }
        }
      }
    });

    if (!usuario) {
      throw new Error('Usuário não encontrado');
    }

    // Permissões da role
    const permissoesRole = await prisma.rolePermissao.findMany({
      where: {
        role: usuario.role
      },
      include: {
        permissao: true
      }
    });

    const permissoes = new Set();

    // Se for admin, tem todas as permissões
    if (usuario.role === 'ADMIN') {
      const todasPermissoes = await prisma.permissao.findMany();
      return todasPermissoes.map(p => p.tipo);
    }

    // Adiciona permissões da role
    permissoesRole.forEach(p => {
      permissoes.add(p.permissao.tipo);
    });

    // Aplica overrides do usuário
    usuario.permissoes.forEach(p => {
      if (p.concedida) {
        permissoes.add(p.permissao.tipo);
      } else {
        permissoes.delete(p.permissao.tipo);
      }
    });

    return Array.from(permissoes);
  }

  /**
   * Concede permissão a um usuário
   */
  async concederPermissao(usuarioId, permissaoTipo) {
    const permissao = await prisma.permissao.findUnique({
      where: { tipo: permissaoTipo }
    });

    if (!permissao) {
      throw new Error('Permissão não encontrada');
    }

    return await prisma.usuarioPermissao.upsert({
      where: {
        usuarioId_permissaoId: {
          usuarioId,
          permissaoId: permissao.id
        }
      },
      update: {
        concedida: true
      },
      create: {
        usuarioId,
        permissaoId: permissao.id,
        concedida: true
      }
    });
  }

  /**
   * Revoga permissão de um usuário
   */
  async revogarPermissao(usuarioId, permissaoTipo) {
    const permissao = await prisma.permissao.findUnique({
      where: { tipo: permissaoTipo }
    });

    if (!permissao) {
      throw new Error('Permissão não encontrada');
    }

    return await prisma.usuarioPermissao.upsert({
      where: {
        usuarioId_permissaoId: {
          usuarioId,
          permissaoId: permissao.id
        }
      },
      update: {
        concedida: false
      },
      create: {
        usuarioId,
        permissaoId: permissao.id,
        concedida: false
      }
    });
  }
}

module.exports = new PermissaoMiddleware();
