/**
 * Serviço de Transações Recorrentes
 * Gerencia a criação, atualização e geração automática de transações recorrentes
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class RecorrenteService {
  /**
   * Cria uma nova transação recorrente
   */
  async criar(dados) {
    const {
      tipo,
      valor,
      descricao,
      categoria,
      frequencia,
      dataInicio,
      dataFim,
      diaVencimento,
      metodoPagamento,
      centroCustoId,
      clienteId,
      produtoId,
      moedaId
    } = dados;

    // Calcula a próxima geração baseado na frequência
    const proximaGeracao = this.calcularProximaGeracao(dataInicio, frequencia, diaVencimento);

    return await prisma.transacaoRecorrente.create({
      data: {
        tipo,
        valor,
        descricao,
        categoria,
        frequencia,
        dataInicio,
        dataFim,
        diaVencimento,
        proximaGeracao,
        metodoPagamento,
        centroCustoId,
        clienteId,
        produtoId,
        moedaId,
        ativo: true
      },
      include: {
        centroCusto: true,
        cliente: true,
        produto: true,
        moeda: true
      }
    });
  }

  /**
   * Lista transações recorrentes ativas
   */
  async listarAtivas() {
    return await prisma.transacaoRecorrente.findMany({
      where: { ativo: true },
      include: {
        centroCusto: true,
        cliente: true,
        produto: true,
        moeda: true,
        transacoesGeradas: {
          take: 5,
          orderBy: { data: 'desc' }
        }
      },
      orderBy: { proximaGeracao: 'asc' }
    });
  }

  /**
   * Busca transações que devem ser geradas
   */
  async buscarParaGerar(dataReferencia = new Date()) {
    return await prisma.transacaoRecorrente.findMany({
      where: {
        ativo: true,
        proximaGeracao: {
          lte: dataReferencia
        },
        OR: [
          { dataFim: null },
          { dataFim: { gte: dataReferencia } }
        ]
      },
      include: {
        centroCusto: true,
        cliente: true,
        produto: true,
        moeda: true
      }
    });
  }

  /**
   * Gera transações baseadas nos agendamentos recorrentes
   */
  async gerarTransacoes(dataReferencia = new Date()) {
    const recorrentes = await this.buscarParaGerar(dataReferencia);
    const transacoesCriadas = [];

    for (const recorrente of recorrentes) {
      try {
        // Cria a transação
        const transacao = await prisma.transacao.create({
          data: {
            tipo: recorrente.tipo,
            valor: recorrente.valor,
            descricao: recorrente.descricao,
            categoria: recorrente.categoria,
            data: recorrente.proximaGeracao,
            dataVencimento: recorrente.proximaGeracao,
            metodoPagamento: recorrente.metodoPagamento,
            statusPagamento: 'PENDENTE',
            centroCustoId: recorrente.centroCustoId,
            clienteId: recorrente.clienteId,
            produtoId: recorrente.produtoId,
            moedaId: recorrente.moedaId,
            transacaoRecorrenteId: recorrente.id,
            recorrente: true,
            frequencia: recorrente.frequencia
          }
        });

        transacoesCriadas.push(transacao);

        // Atualiza a transação recorrente
        const proximaGeracao = this.calcularProximaGeracao(
          recorrente.proximaGeracao,
          recorrente.frequencia,
          recorrente.diaVencimento
        );

        await prisma.transacaoRecorrente.update({
          where: { id: recorrente.id },
          data: {
            ultimaGeracao: recorrente.proximaGeracao,
            proximaGeracao: proximaGeracao
          }
        });

        console.log(`✓ Transação recorrente gerada: ${recorrente.descricao} - ${transacao.id}`);
      } catch (error) {
        console.error(`✗ Erro ao gerar transação recorrente ${recorrente.id}:`, error);
      }
    }

    return transacoesCriadas;
  }

  /**
   * Calcula a próxima data de geração baseado na frequência
   */
  calcularProximaGeracao(dataAtual, frequencia, diaVencimento = null) {
    const proxima = new Date(dataAtual);

    switch (frequencia) {
      case 'DIARIA':
        proxima.setDate(proxima.getDate() + 1);
        break;

      case 'SEMANAL':
        proxima.setDate(proxima.getDate() + 7);
        break;

      case 'QUINZENAL':
        proxima.setDate(proxima.getDate() + 15);
        break;

      case 'MENSAL':
        proxima.setMonth(proxima.getMonth() + 1);
        if (diaVencimento) {
          proxima.setDate(Math.min(diaVencimento, this.obterUltimoDiaMes(proxima)));
        }
        break;

      case 'BIMESTRAL':
        proxima.setMonth(proxima.getMonth() + 2);
        if (diaVencimento) {
          proxima.setDate(Math.min(diaVencimento, this.obterUltimoDiaMes(proxima)));
        }
        break;

      case 'TRIMESTRAL':
        proxima.setMonth(proxima.getMonth() + 3);
        if (diaVencimento) {
          proxima.setDate(Math.min(diaVencimento, this.obterUltimoDiaMes(proxima)));
        }
        break;

      case 'SEMESTRAL':
        proxima.setMonth(proxima.getMonth() + 6);
        if (diaVencimento) {
          proxima.setDate(Math.min(diaVencimento, this.obterUltimoDiaMes(proxima)));
        }
        break;

      case 'ANUAL':
        proxima.setFullYear(proxima.getFullYear() + 1);
        if (diaVencimento) {
          proxima.setDate(Math.min(diaVencimento, this.obterUltimoDiaMes(proxima)));
        }
        break;
    }

    return proxima;
  }

  /**
   * Obtém o último dia do mês
   */
  obterUltimoDiaMes(data) {
    return new Date(data.getFullYear(), data.getMonth() + 1, 0).getDate();
  }

  /**
   * Desativa uma transação recorrente
   */
  async desativar(id) {
    return await prisma.transacaoRecorrente.update({
      where: { id },
      data: { ativo: false }
    });
  }

  /**
   * Atualiza uma transação recorrente
   */
  async atualizar(id, dados) {
    return await prisma.transacaoRecorrente.update({
      where: { id },
      data: dados,
      include: {
        centroCusto: true,
        cliente: true,
        produto: true,
        moeda: true
      }
    });
  }
}

module.exports = new RecorrenteService();
