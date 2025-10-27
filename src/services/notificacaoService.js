/**
 * Serviço de Notificações
 * Gerencia a criação e envio de notificações (in-app e email)
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class NotificacaoService {
  /**
   * Cria uma notificação
   */
  async criar(dados) {
    const { usuarioId, tipo, titulo, mensagem, metadata } = dados;

    return await prisma.notificacao.create({
      data: {
        usuarioId,
        tipo,
        titulo,
        mensagem,
        metadata,
        status: 'NAO_LIDA'
      }
    });
  }

  /**
   * Notifica sobre transações vencendo
   */
  async notificarTransacoesVencendo() {
    // Busca preferências de usuários
    const usuarios = await prisma.usuario.findMany({
      where: { ativo: true },
      include: { preferenciasNotificacao: true }
    });

    for (const usuario of usuarios) {
      const prefs = usuario.preferenciasNotificacao;
      if (!prefs?.emailTransacaoVencendo && !prefs?.notificacaoApp) continue;

      const diasAntes = prefs?.diasAntesVencimento || 3;
      const dataLimite = new Date();
      dataLimite.setDate(dataLimite.getDate() + diasAntes);

      // Busca transações pendentes que vencerão em breve
      const transacoes = await prisma.transacao.findMany({
        where: {
          statusPagamento: 'PENDENTE',
          dataVencimento: {
            gte: new Date(),
            lte: dataLimite
          }
        },
        include: {
          centroCusto: true,
          cliente: true
        }
      });

      if (transacoes.length === 0) continue;

      // Cria notificação in-app
      if (prefs?.notificacaoApp) {
        await this.criar({
          usuarioId: usuario.id,
          tipo: 'TRANSACAO_VENCENDO',
          titulo: `${transacoes.length} transação(ões) vencendo em ${diasAntes} dias`,
          mensagem: this.gerarMensagemTransacoesVencendo(transacoes),
          metadata: {
            transacoes: transacoes.map(t => ({
              id: t.id,
              descricao: t.descricao,
              valor: t.valor,
              dataVencimento: t.dataVencimento
            }))
          }
        });
      }

      // Envia email se configurado
      if (prefs?.emailAtivo && prefs?.emailTransacaoVencendo) {
        await this.enviarEmail(
          usuario.email,
          `Transações vencendo em ${diasAntes} dias`,
          this.templateTransacoesVencendo(transacoes, diasAntes)
        );
      }
    }
  }

  /**
   * Notifica sobre transações vencidas
   */
  async notificarTransacoesVencidas() {
    const usuarios = await prisma.usuario.findMany({
      where: { ativo: true },
      include: { preferenciasNotificacao: true }
    });

    for (const usuario of usuarios) {
      const prefs = usuario.preferenciasNotificacao;
      if (!prefs?.emailTransacaoVencida && !prefs?.notificacaoApp) continue;

      // Busca transações vencidas
      const transacoes = await prisma.transacao.findMany({
        where: {
          statusPagamento: 'PENDENTE',
          dataVencimento: {
            lt: new Date()
          }
        },
        include: {
          centroCusto: true,
          cliente: true
        }
      });

      if (transacoes.length === 0) continue;

      // Marca como atrasado
      await prisma.transacao.updateMany({
        where: {
          id: { in: transacoes.map(t => t.id) }
        },
        data: { statusPagamento: 'ATRASADO' }
      });

      // Cria notificação
      if (prefs?.notificacaoApp) {
        await this.criar({
          usuarioId: usuario.id,
          tipo: 'TRANSACAO_VENCIDA',
          titulo: `ATENÇÃO: ${transacoes.length} transação(ões) vencida(s)`,
          mensagem: this.gerarMensagemTransacoesVencidas(transacoes),
          metadata: { transacoes: transacoes.map(t => ({ id: t.id, descricao: t.descricao })) }
        });
      }

      // Envia email
      if (prefs?.emailAtivo && prefs?.emailTransacaoVencida) {
        await this.enviarEmail(
          usuario.email,
          'ATENÇÃO: Transações vencidas',
          this.templateTransacoesVencidas(transacoes)
        );
      }
    }
  }

  /**
   * Notifica quando meta de centro de custo for ultrapassada
   */
  async verificarMetasCentroCusto() {
    const dataAtual = new Date();
    const mes = dataAtual.getMonth() + 1;
    const ano = dataAtual.getFullYear();

    // Busca metas ativas do mês atual
    const metas = await prisma.meta.findMany({
      where: {
        mes,
        ano,
        alertaAtivo: true,
        centroCustoId: { not: null }
      },
      include: { centroCusto: true }
    });

    for (const meta of metas) {
      // Calcula gastos do centro de custo no mês
      const primeiroDiaMes = new Date(ano, mes - 1, 1);
      const ultimoDiaMes = new Date(ano, mes, 0, 23, 59, 59);

      const resultado = await prisma.transacao.aggregate({
        where: {
          centroCustoId: meta.centroCustoId,
          tipo: meta.tipo === 'RECEITA' ? 'RECEITA' : 'DESPESA',
          data: {
            gte: primeiroDiaMes,
            lte: ultimoDiaMes
          }
        },
        _sum: { valor: true }
      });

      const valorAtual = resultado._sum.valor || 0;
      const percentual = (valorAtual / meta.valorMeta) * 100;

      // Notifica se ultrapassar a meta
      if (valorAtual > meta.valorMeta) {
        const usuarios = await prisma.usuario.findMany({
          where: { ativo: true },
          include: { preferenciasNotificacao: true }
        });

        for (const usuario of usuarios) {
          const prefs = usuario.preferenciasNotificacao;

          if (prefs?.notificacaoApp) {
            await this.criar({
              usuarioId: usuario.id,
              tipo: 'META_ULTRAPASSADA',
              titulo: `Meta ultrapassada: ${meta.centroCusto.nome}`,
              mensagem: `O centro de custo "${meta.centroCusto.nome}" ultrapassou a meta de ${meta.tipo.toLowerCase()} em ${(percentual - 100).toFixed(1)}%. Valor atual: R$ ${valorAtual.toFixed(2)} / Meta: R$ ${meta.valorMeta}`,
              metadata: {
                metaId: meta.id,
                centroCustoId: meta.centroCustoId,
                valorAtual,
                valorMeta: meta.valorMeta,
                percentual
              }
            });
          }

          if (prefs?.emailAtivo && prefs?.emailMetaUltrapassada) {
            await this.enviarEmail(
              usuario.email,
              `Meta ultrapassada: ${meta.centroCusto.nome}`,
              this.templateMetaUltrapassada(meta, valorAtual, percentual)
            );
          }
        }
      }
    }
  }

  /**
   * Gera resumo semanal
   */
  async gerarResumoSemanal() {
    const usuarios = await prisma.usuario.findMany({
      where: { ativo: true },
      include: { preferenciasNotificacao: true }
    });

    const dataFim = new Date();
    const dataInicio = new Date();
    dataInicio.setDate(dataInicio.getDate() - 7);

    for (const usuario of usuarios) {
      const prefs = usuario.preferenciasNotificacao;
      if (!prefs?.emailResumoSemanal) continue;

      const resumo = await this.gerarResumo(dataInicio, dataFim);

      await this.enviarEmail(
        usuario.email,
        'Resumo Semanal - Sistema Financeiro',
        this.templateResumoSemanal(resumo, dataInicio, dataFim)
      );
    }
  }

  /**
   * Gera resumo mensal
   */
  async gerarResumoMensal() {
    const usuarios = await prisma.usuario.findMany({
      where: { ativo: true },
      include: { preferenciasNotificacao: true }
    });

    const dataAtual = new Date();
    const mesAnterior = new Date(dataAtual.getFullYear(), dataAtual.getMonth() - 1, 1);
    const dataInicio = new Date(mesAnterior.getFullYear(), mesAnterior.getMonth(), 1);
    const dataFim = new Date(mesAnterior.getFullYear(), mesAnterior.getMonth() + 1, 0, 23, 59, 59);

    for (const usuario of usuarios) {
      const prefs = usuario.preferenciasNotificacao;
      if (!prefs?.emailResumoMensal) continue;

      const resumo = await this.gerarResumo(dataInicio, dataFim);

      await this.enviarEmail(
        usuario.email,
        `Resumo Mensal - ${mesAnterior.toLocaleString('pt-BR', { month: 'long', year: 'numeric' })}`,
        this.templateResumoMensal(resumo, mesAnterior)
      );
    }
  }

  /**
   * Gera dados de resumo financeiro
   */
  async gerarResumo(dataInicio, dataFim) {
    const receitas = await prisma.transacao.aggregate({
      where: { tipo: 'RECEITA', data: { gte: dataInicio, lte: dataFim } },
      _sum: { valor: true },
      _count: true
    });

    const despesas = await prisma.transacao.aggregate({
      where: { tipo: 'DESPESA', data: { gte: dataInicio, lte: dataFim } },
      _sum: { valor: true },
      _count: true
    });

    const pendentes = await prisma.transacao.count({
      where: { statusPagamento: 'PENDENTE', data: { gte: dataInicio, lte: dataFim } }
    });

    return {
      receitas: receitas._sum.valor || 0,
      despesas: despesas._sum.valor || 0,
      saldo: (receitas._sum.valor || 0) - (despesas._sum.valor || 0),
      totalTransacoes: (receitas._count || 0) + (despesas._count || 0),
      transacoesPendentes: pendentes
    };
  }

  /**
   * Marca notificação como lida
   */
  async marcarComoLida(id) {
    return await prisma.notificacao.update({
      where: { id },
      data: {
        status: 'LIDA',
        leituraEm: new Date()
      }
    });
  }

  /**
   * Lista notificações do usuário
   */
  async listarPorUsuario(usuarioId, limite = 20) {
    return await prisma.notificacao.findMany({
      where: { usuarioId },
      orderBy: { createdAt: 'desc' },
      take: limite
    });
  }

  // ========================================
  // TEMPLATES DE MENSAGENS
  // ========================================

  gerarMensagemTransacoesVencendo(transacoes) {
    return transacoes.map(t =>
      `- ${t.descricao}: R$ ${t.valor} (vence em ${new Date(t.dataVencimento).toLocaleDateString('pt-BR')})`
    ).join('\n');
  }

  gerarMensagemTransacoesVencidas(transacoes) {
    return transacoes.map(t =>
      `- ${t.descricao}: R$ ${t.valor} (venceu em ${new Date(t.dataVencimento).toLocaleDateString('pt-BR')})`
    ).join('\n');
  }

  templateTransacoesVencendo(transacoes, diasAntes) {
    return `
      <h2>Transações vencendo em ${diasAntes} dias</h2>
      <p>As seguintes transações estão próximas do vencimento:</p>
      <ul>
        ${transacoes.map(t => `
          <li>
            <strong>${t.descricao}</strong><br>
            Valor: R$ ${t.valor}<br>
            Vencimento: ${new Date(t.dataVencimento).toLocaleDateString('pt-BR')}<br>
            Centro de Custo: ${t.centroCusto.nome}
          </li>
        `).join('')}
      </ul>
    `;
  }

  templateTransacoesVencidas(transacoes) {
    return `
      <h2>⚠️ Transações Vencidas</h2>
      <p>As seguintes transações estão vencidas e precisam de atenção:</p>
      <ul>
        ${transacoes.map(t => `
          <li style="color: red;">
            <strong>${t.descricao}</strong><br>
            Valor: R$ ${t.valor}<br>
            Vencimento: ${new Date(t.dataVencimento).toLocaleDateString('pt-BR')}<br>
            Centro de Custo: ${t.centroCusto.nome}
          </li>
        `).join('')}
      </ul>
    `;
  }

  templateMetaUltrapassada(meta, valorAtual, percentual) {
    return `
      <h2>⚠️ Meta Ultrapassada</h2>
      <p>O centro de custo <strong>${meta.centroCusto.nome}</strong> ultrapassou a meta de ${meta.tipo.toLowerCase()}.</p>
      <ul>
        <li>Valor atual: R$ ${valorAtual.toFixed(2)}</li>
        <li>Meta: R$ ${meta.valorMeta}</li>
        <li>Percentual: ${percentual.toFixed(1)}%</li>
        <li>Excedente: ${(percentual - 100).toFixed(1)}%</li>
      </ul>
    `;
  }

  templateResumoSemanal(resumo, dataInicio, dataFim) {
    return `
      <h2>Resumo Semanal</h2>
      <p>Período: ${dataInicio.toLocaleDateString('pt-BR')} a ${dataFim.toLocaleDateString('pt-BR')}</p>
      <ul>
        <li>Receitas: R$ ${resumo.receitas.toFixed(2)}</li>
        <li>Despesas: R$ ${resumo.despesas.toFixed(2)}</li>
        <li>Saldo: R$ ${resumo.saldo.toFixed(2)}</li>
        <li>Total de transações: ${resumo.totalTransacoes}</li>
        <li>Transações pendentes: ${resumo.transacoesPendentes}</li>
      </ul>
    `;
  }

  templateResumoMensal(resumo, mes) {
    return `
      <h2>Resumo Mensal - ${mes.toLocaleString('pt-BR', { month: 'long', year: 'numeric' })}</h2>
      <ul>
        <li>Receitas: R$ ${resumo.receitas.toFixed(2)}</li>
        <li>Despesas: R$ ${resumo.despesas.toFixed(2)}</li>
        <li>Saldo: R$ ${resumo.saldo.toFixed(2)}</li>
        <li>Total de transações: ${resumo.totalTransacoes}</li>
        <li>Transações pendentes: ${resumo.transacoesPendentes}</li>
      </ul>
    `;
  }

  /**
   * Envia email (implementação básica - integrar com serviço de email real)
   */
  async enviarEmail(destinatario, assunto, corpo) {
    // TODO: Integrar com serviço de email (nodemailer, SendGrid, etc.)
    console.log(`📧 Email enviado para ${destinatario}:`);
    console.log(`Assunto: ${assunto}`);
    console.log(`Corpo: ${corpo}`);

    // Exemplo de integração com nodemailer:
    // const transporter = nodemailer.createTransport({ ... });
    // await transporter.sendMail({
    //   from: 'noreply@seudominio.com',
    //   to: destinatario,
    //   subject: assunto,
    //   html: corpo
    // });
  }
}

module.exports = new NotificacaoService();
