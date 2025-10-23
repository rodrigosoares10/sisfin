import { Between } from 'typeorm';
import { AppDataSource } from '../config/database';
import { Transacao } from '../entities/Transacao';
import { Produto } from '../entities/Produto';
import { Cliente } from '../entities/Cliente';
import { CentroCusto } from '../entities/CentroCusto';

export class DashboardService {
  private transacaoRepository = AppDataSource.getRepository(Transacao);
  private produtoRepository = AppDataSource.getRepository(Produto);
  private clienteRepository = AppDataSource.getRepository(Cliente);
  private centroCustoRepository = AppDataSource.getRepository(CentroCusto);

  async getResumo(mes?: number, ano?: number) {
    const now = new Date();
    const targetMes = mes || now.getMonth() + 1;
    const targetAno = ano || now.getFullYear();

    const dataInicio = new Date(targetAno, targetMes - 1, 1);
    const dataFim = new Date(targetAno, targetMes, 0);

    const transacoes = await this.transacaoRepository.find({
      where: {
        data: Between(dataInicio, dataFim),
      },
      relations: ['centroCusto'],
    });

    const receitas = transacoes
      .filter((t) => t.tipo === 'receita')
      .reduce((sum, t) => sum + Number(t.valor), 0);

    const despesas = transacoes
      .filter((t) => t.tipo === 'despesa')
      .reduce((sum, t) => sum + Number(t.valor), 0);

    const lucro = receitas - despesas;

    const totalClientes = await this.clienteRepository.count({
      where: { ativo: true },
    });

    const totalProdutos = await this.produtoRepository.count({
      where: { ativo: true },
    });

    const totalCentrosCusto = await this.centroCustoRepository.count({
      where: { ativo: true },
    });

    return {
      periodo: {
        mes: targetMes,
        ano: targetAno,
      },
      financeiro: {
        receitas,
        despesas,
        lucro,
        totalTransacoes: transacoes.length,
      },
      estatisticas: {
        totalClientes,
        totalProdutos,
        totalCentrosCusto,
      },
    };
  }

  async getGraficos(periodo: string = '30d') {
    let dataInicio: Date;
    const dataFim = new Date();

    // Calcular data de início baseado no período
    switch (periodo) {
      case '7d':
        dataInicio = new Date();
        dataInicio.setDate(dataInicio.getDate() - 7);
        break;
      case '30d':
        dataInicio = new Date();
        dataInicio.setDate(dataInicio.getDate() - 30);
        break;
      case '90d':
        dataInicio = new Date();
        dataInicio.setDate(dataInicio.getDate() - 90);
        break;
      case '1y':
        dataInicio = new Date();
        dataInicio.setFullYear(dataInicio.getFullYear() - 1);
        break;
      default:
        dataInicio = new Date();
        dataInicio.setDate(dataInicio.getDate() - 30);
    }

    const transacoes = await this.transacaoRepository.find({
      where: {
        data: Between(dataInicio, dataFim),
      },
      relations: ['centroCusto'],
      order: { data: 'ASC' },
    });

    // Agrupar por data
    const transacoesPorDia: { [key: string]: { receitas: number; despesas: number } } = {};

    transacoes.forEach((t) => {
      const dataKey = t.data.toISOString().split('T')[0];

      if (!transacoesPorDia[dataKey]) {
        transacoesPorDia[dataKey] = { receitas: 0, despesas: 0 };
      }

      if (t.tipo === 'receita') {
        transacoesPorDia[dataKey].receitas += Number(t.valor);
      } else {
        transacoesPorDia[dataKey].despesas += Number(t.valor);
      }
    });

    // Agrupar por centro de custo
    const porCentroCusto: { [key: string]: number } = {};

    transacoes.forEach((t) => {
      const centroCusto = t.centroCusto?.nome || 'Sem Centro de Custo';
      porCentroCusto[centroCusto] = (porCentroCusto[centroCusto] || 0) + Number(t.valor);
    });

    return {
      periodo: {
        inicio: dataInicio,
        fim: dataFim,
      },
      transacoesPorDia,
      porCentroCusto,
      totalReceitas: transacoes
        .filter((t) => t.tipo === 'receita')
        .reduce((sum, t) => sum + Number(t.valor), 0),
      totalDespesas: transacoes
        .filter((t) => t.tipo === 'despesa')
        .reduce((sum, t) => sum + Number(t.valor), 0),
    };
  }

  async getFluxoCaixa(dataInicio: string, dataFim: string) {
    const transacoes = await this.transacaoRepository.find({
      where: {
        data: Between(new Date(dataInicio), new Date(dataFim)),
      },
      relations: ['centroCusto'],
      order: { data: 'ASC' },
    });

    let saldoAcumulado = 0;
    const fluxoDiario = transacoes.map((t) => {
      const valor = Number(t.valor);
      const movimento = t.tipo === 'receita' ? valor : -valor;
      saldoAcumulado += movimento;

      return {
        data: t.data,
        tipo: t.tipo,
        valor: valor,
        descricao: t.descricao,
        centroCusto: t.centroCusto?.nome || null,
        saldoAcumulado,
      };
    });

    const totalReceitas = transacoes
      .filter((t) => t.tipo === 'receita')
      .reduce((sum, t) => sum + Number(t.valor), 0);

    const totalDespesas = transacoes
      .filter((t) => t.tipo === 'despesa')
      .reduce((sum, t) => sum + Number(t.valor), 0);

    return {
      periodo: {
        inicio: dataInicio,
        fim: dataFim,
      },
      fluxoDiario,
      resumo: {
        totalReceitas,
        totalDespesas,
        saldoFinal: saldoAcumulado,
      },
    };
  }
}
