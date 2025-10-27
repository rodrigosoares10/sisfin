/**
 * Serviço de Gerenciamento de Permissões
 * Inicializa e configura permissões padrão do sistema
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class PermissaoService {
  /**
   * Inicializa todas as permissões no banco de dados
   */
  async inicializarPermissoes() {
    const permissoes = [
      // Transações
      { tipo: 'TRANSACAO_CRIAR', nome: 'Criar Transação', descricao: 'Permite criar novas transações' },
      { tipo: 'TRANSACAO_EDITAR', nome: 'Editar Transação', descricao: 'Permite editar transações existentes' },
      { tipo: 'TRANSACAO_DELETAR', nome: 'Deletar Transação', descricao: 'Permite deletar transações' },
      { tipo: 'TRANSACAO_VISUALIZAR', nome: 'Visualizar Transação', descricao: 'Permite visualizar transações' },

      // Centro de Custo
      { tipo: 'CENTRO_CUSTO_CRIAR', nome: 'Criar Centro de Custo', descricao: 'Permite criar novos centros de custo' },
      { tipo: 'CENTRO_CUSTO_EDITAR', nome: 'Editar Centro de Custo', descricao: 'Permite editar centros de custo' },
      { tipo: 'CENTRO_CUSTO_DELETAR', nome: 'Deletar Centro de Custo', descricao: 'Permite deletar centros de custo' },
      { tipo: 'CENTRO_CUSTO_VISUALIZAR', nome: 'Visualizar Centro de Custo', descricao: 'Permite visualizar centros de custo' },

      // Clientes
      { tipo: 'CLIENTE_CRIAR', nome: 'Criar Cliente', descricao: 'Permite criar novos clientes' },
      { tipo: 'CLIENTE_EDITAR', nome: 'Editar Cliente', descricao: 'Permite editar clientes' },
      { tipo: 'CLIENTE_DELETAR', nome: 'Deletar Cliente', descricao: 'Permite deletar clientes' },
      { tipo: 'CLIENTE_VISUALIZAR', nome: 'Visualizar Cliente', descricao: 'Permite visualizar clientes' },

      // Produtos
      { tipo: 'PRODUTO_CRIAR', nome: 'Criar Produto', descricao: 'Permite criar novos produtos' },
      { tipo: 'PRODUTO_EDITAR', nome: 'Editar Produto', descricao: 'Permite editar produtos' },
      { tipo: 'PRODUTO_DELETAR', nome: 'Deletar Produto', descricao: 'Permite deletar produtos' },
      { tipo: 'PRODUTO_VISUALIZAR', nome: 'Visualizar Produto', descricao: 'Permite visualizar produtos' },

      // Metas
      { tipo: 'META_CRIAR', nome: 'Criar Meta', descricao: 'Permite criar novas metas' },
      { tipo: 'META_EDITAR', nome: 'Editar Meta', descricao: 'Permite editar metas' },
      { tipo: 'META_DELETAR', nome: 'Deletar Meta', descricao: 'Permite deletar metas' },
      { tipo: 'META_VISUALIZAR', nome: 'Visualizar Meta', descricao: 'Permite visualizar metas' },

      // Relatórios
      { tipo: 'RELATORIO_FINANCEIRO', nome: 'Relatório Financeiro', descricao: 'Permite gerar relatórios financeiros' },
      { tipo: 'RELATORIO_GERENCIAL', nome: 'Relatório Gerencial', descricao: 'Permite gerar relatórios gerenciais' },
      { tipo: 'RELATORIO_EXPORTAR', nome: 'Exportar Relatórios', descricao: 'Permite exportar relatórios' },

      // Usuários
      { tipo: 'USUARIO_CRIAR', nome: 'Criar Usuário', descricao: 'Permite criar novos usuários' },
      { tipo: 'USUARIO_EDITAR', nome: 'Editar Usuário', descricao: 'Permite editar usuários' },
      { tipo: 'USUARIO_DELETAR', nome: 'Deletar Usuário', descricao: 'Permite deletar usuários' },
      { tipo: 'USUARIO_VISUALIZAR', nome: 'Visualizar Usuário', descricao: 'Permite visualizar usuários' },

      // Sistema
      { tipo: 'CONFIGURACOES_SISTEMA', nome: 'Configurações do Sistema', descricao: 'Permite acessar configurações do sistema' },
      { tipo: 'AUDITORIA_VISUALIZAR', nome: 'Visualizar Auditoria', descricao: 'Permite visualizar logs de auditoria' }
    ];

    for (const perm of permissoes) {
      await prisma.permissao.upsert({
        where: { tipo: perm.tipo },
        update: perm,
        create: perm
      });
    }

    console.log(`✓ ${permissoes.length} permissões inicializadas`);
  }

  /**
   * Configura permissões padrão para roles
   */
  async configurarPermissoesRoles() {
    // Permissões do ADMIN (todas)
    // ADMIN já tem acesso total via middleware, não precisa configurar

    // Permissões do FINANCEIRO
    const permissoesFinanceiro = [
      'TRANSACAO_CRIAR',
      'TRANSACAO_EDITAR',
      'TRANSACAO_DELETAR',
      'TRANSACAO_VISUALIZAR',
      'CENTRO_CUSTO_VISUALIZAR',
      'CLIENTE_CRIAR',
      'CLIENTE_EDITAR',
      'CLIENTE_VISUALIZAR',
      'PRODUTO_VISUALIZAR',
      'META_VISUALIZAR',
      'RELATORIO_FINANCEIRO',
      'RELATORIO_EXPORTAR'
    ];

    await this.atribuirPermissoesRole('FINANCEIRO', permissoesFinanceiro);

    // Permissões do VISUALIZADOR
    const permissoesVisualizador = [
      'TRANSACAO_VISUALIZAR',
      'CENTRO_CUSTO_VISUALIZAR',
      'CLIENTE_VISUALIZAR',
      'PRODUTO_VISUALIZAR',
      'META_VISUALIZAR',
      'RELATORIO_FINANCEIRO'
    ];

    await this.atribuirPermissoesRole('VISUALIZADOR', permissoesVisualizador);

    console.log('✓ Permissões de roles configuradas');
  }

  /**
   * Atribui lista de permissões a uma role
   */
  async atribuirPermissoesRole(role, permissoesTipo) {
    for (const tipo of permissoesTipo) {
      const permissao = await prisma.permissao.findUnique({
        where: { tipo }
      });

      if (permissao) {
        await prisma.rolePermissao.upsert({
          where: {
            role_permissaoId: {
              role,
              permissaoId: permissao.id
            }
          },
          update: {},
          create: {
            role,
            permissaoId: permissao.id
          }
        });
      }
    }
  }

  /**
   * Lista permissões de uma role
   */
  async listarPermissoesRole(role) {
    const permissoesRole = await prisma.rolePermissao.findMany({
      where: { role },
      include: {
        permissao: true
      }
    });

    return permissoesRole.map(p => ({
      tipo: p.permissao.tipo,
      nome: p.permissao.nome,
      descricao: p.permissao.descricao
    }));
  }

  /**
   * Inicialização completa do sistema de permissões
   */
  async inicializarSistema() {
    console.log('🔐 Inicializando sistema de permissões...');
    await this.inicializarPermissoes();
    await this.configurarPermissoesRoles();
    console.log('✓ Sistema de permissões inicializado com sucesso');
  }
}

module.exports = new PermissaoService();
