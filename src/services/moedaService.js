/**
 * Serviço de Multi-Moeda
 * Gerencia moedas, taxas de câmbio e conversões
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class MoedaService {
  /**
   * Cria uma nova moeda
   */
  async criarMoeda(dados) {
    const { codigo, nome, simbolo, casasDecimais = 2, padrao = false } = dados;

    // Se for definida como padrão, remove a flag de outras moedas
    if (padrao) {
      await prisma.moeda.updateMany({
        where: { padrao: true },
        data: { padrao: false }
      });
    }

    return await prisma.moeda.create({
      data: {
        codigo: codigo.toUpperCase(),
        nome,
        simbolo,
        casasDecimais,
        padrao,
        ativo: true
      }
    });
  }

  /**
   * Lista moedas ativas
   */
  async listarMoedas() {
    return await prisma.moeda.findMany({
      where: { ativo: true },
      orderBy: [
        { padrao: 'desc' },
        { codigo: 'asc' }
      ]
    });
  }

  /**
   * Obtém moeda padrão do sistema
   */
  async obterMoedaPadrao() {
    return await prisma.moeda.findFirst({
      where: { padrao: true, ativo: true }
    });
  }

  /**
   * Busca moeda por código
   */
  async buscarPorCodigo(codigo) {
    return await prisma.moeda.findUnique({
      where: { codigo: codigo.toUpperCase() }
    });
  }

  /**
   * Registra uma taxa de câmbio
   */
  async registrarTaxaCambio(dados) {
    const { codigoOrigem, codigoDestino, taxa, fonte = 'manual' } = dados;

    const moedaOrigem = await this.buscarPorCodigo(codigoOrigem);
    const moedaDestino = await this.buscarPorCodigo(codigoDestino);

    if (!moedaOrigem || !moedaDestino) {
      throw new Error('Moeda não encontrada');
    }

    return await prisma.taxaCambio.create({
      data: {
        moedaOrigemId: moedaOrigem.id,
        moedaDestinoId: moedaDestino.id,
        taxa,
        fonte,
        data: new Date()
      }
    });
  }

  /**
   * Obtém a taxa de câmbio mais recente entre duas moedas
   */
  async obterTaxaCambio(codigoOrigem, codigoDestino) {
    const moedaOrigem = await this.buscarPorCodigo(codigoOrigem);
    const moedaDestino = await this.buscarPorCodigo(codigoDestino);

    if (!moedaOrigem || !moedaDestino) {
      throw new Error('Moeda não encontrada');
    }

    // Se for a mesma moeda, retorna taxa 1
    if (moedaOrigem.id === moedaDestino.id) {
      return { taxa: 1, data: new Date() };
    }

    // Busca a taxa mais recente
    const taxaCambio = await prisma.taxaCambio.findFirst({
      where: {
        moedaOrigemId: moedaOrigem.id,
        moedaDestinoId: moedaDestino.id
      },
      orderBy: { data: 'desc' }
    });

    if (!taxaCambio) {
      // Tenta buscar a taxa inversa
      const taxaInversa = await prisma.taxaCambio.findFirst({
        where: {
          moedaOrigemId: moedaDestino.id,
          moedaDestinoId: moedaOrigem.id
        },
        orderBy: { data: 'desc' }
      });

      if (taxaInversa) {
        return {
          taxa: 1 / parseFloat(taxaInversa.taxa),
          data: taxaInversa.data
        };
      }

      throw new Error(`Taxa de câmbio não encontrada para ${codigoOrigem} -> ${codigoDestino}`);
    }

    return {
      taxa: parseFloat(taxaCambio.taxa),
      data: taxaCambio.data
    };
  }

  /**
   * Converte valor entre moedas
   */
  async converter(valor, codigoOrigem, codigoDestino) {
    const { taxa } = await this.obterTaxaCambio(codigoOrigem, codigoDestino);
    return valor * taxa;
  }

  /**
   * Atualiza taxas de câmbio via API externa
   * Exemplo usando uma API gratuita (você pode trocar por outra)
   */
  async atualizarTaxasAutomaticamente() {
    try {
      const moedaPadrao = await this.obterMoedaPadrao();
      if (!moedaPadrao) {
        console.log('⚠️  Nenhuma moeda padrão definida');
        return;
      }

      const moedas = await this.listarMoedas();

      // Exemplo de integração com API de câmbio (exchangerate-api.com)
      // Você precisará se cadastrar e obter uma chave de API
      const apiKey = process.env.EXCHANGE_RATE_API_KEY;

      if (!apiKey) {
        console.log('⚠️  Chave de API de câmbio não configurada (EXCHANGE_RATE_API_KEY)');
        return;
      }

      const response = await fetch(
        `https://v6.exchangerate-api.com/v6/${apiKey}/latest/${moedaPadrao.codigo}`
      );
      const data = await response.json();

      if (data.result === 'success') {
        const taxasAtualizadas = [];

        for (const moeda of moedas) {
          if (moeda.codigo === moedaPadrao.codigo) continue;

          const taxa = data.conversion_rates[moeda.codigo];
          if (taxa) {
            await this.registrarTaxaCambio({
              codigoOrigem: moedaPadrao.codigo,
              codigoDestino: moeda.codigo,
              taxa,
              fonte: 'exchangerate-api'
            });
            taxasAtualizadas.push(`${moedaPadrao.codigo}/${moeda.codigo}: ${taxa}`);
          }
        }

        console.log(`✓ Taxas de câmbio atualizadas: ${taxasAtualizadas.length} pares`);
        console.log(taxasAtualizadas.join(', '));
      }
    } catch (error) {
      console.error('✗ Erro ao atualizar taxas de câmbio:', error.message);
    }
  }

  /**
   * Converte transação para moeda padrão
   */
  async converterTransacaoParaMoedaPadrao(transacao) {
    const moedaPadrao = await this.obterMoedaPadrao();

    if (!transacao.moedaId || transacao.moedaId === moedaPadrao.id) {
      return {
        valor: transacao.valor,
        moeda: moedaPadrao
      };
    }

    const moedaOrigem = await prisma.moeda.findUnique({
      where: { id: transacao.moedaId }
    });

    if (!moedaOrigem) {
      throw new Error('Moeda da transação não encontrada');
    }

    const valorConvertido = await this.converter(
      parseFloat(transacao.valorOriginal || transacao.valor),
      moedaOrigem.codigo,
      moedaPadrao.codigo
    );

    return {
      valor: valorConvertido,
      moeda: moedaPadrao,
      moedaOriginal: moedaOrigem,
      valorOriginal: transacao.valorOriginal || transacao.valor
    };
  }

  /**
   * Gera relatório com conversão para moeda base
   */
  async gerarRelatorioConvertido(dataInicio, dataFim) {
    const moedaPadrao = await this.obterMoedaPadrao();

    const transacoes = await prisma.transacao.findMany({
      where: {
        data: {
          gte: dataInicio,
          lte: dataFim
        }
      },
      include: {
        moeda: true,
        centroCusto: true
      }
    });

    let totalReceitasPadrao = 0;
    let totalDespesasPadrao = 0;
    const transacoesPorMoeda = {};

    for (const transacao of transacoes) {
      const moeda = transacao.moeda || moedaPadrao;

      // Agrupa por moeda original
      if (!transacoesPorMoeda[moeda.codigo]) {
        transacoesPorMoeda[moeda.codigo] = {
          receitas: 0,
          despesas: 0,
          count: 0
        };
      }

      const valor = parseFloat(transacao.valorOriginal || transacao.valor);

      if (transacao.tipo === 'RECEITA') {
        transacoesPorMoeda[moeda.codigo].receitas += valor;
      } else {
        transacoesPorMoeda[moeda.codigo].despesas += valor;
      }
      transacoesPorMoeda[moeda.codigo].count++;

      // Converte para moeda padrão
      let valorPadrao = valor;
      if (moeda.codigo !== moedaPadrao.codigo) {
        valorPadrao = await this.converter(valor, moeda.codigo, moedaPadrao.codigo);
      }

      if (transacao.tipo === 'RECEITA') {
        totalReceitasPadrao += valorPadrao;
      } else {
        totalDespesasPadrao += valorPadrao;
      }
    }

    return {
      periodo: {
        inicio: dataInicio,
        fim: dataFim
      },
      moedaPadrao: moedaPadrao.codigo,
      totais: {
        receitas: totalReceitasPadrao,
        despesas: totalDespesasPadrao,
        saldo: totalReceitasPadrao - totalDespesasPadrao
      },
      porMoeda: transacoesPorMoeda,
      totalTransacoes: transacoes.length
    };
  }

  /**
   * Inicializa moedas padrão
   */
  async inicializarMoedasPadrao() {
    const moedasPadrao = [
      { codigo: 'BRL', nome: 'Real Brasileiro', simbolo: 'R$', padrao: true },
      { codigo: 'USD', nome: 'Dólar Americano', simbolo: '$', padrao: false },
      { codigo: 'EUR', nome: 'Euro', simbolo: '€', padrao: false },
      { codigo: 'GBP', nome: 'Libra Esterlina', simbolo: '£', padrao: false },
      { codigo: 'JPY', nome: 'Iene Japonês', simbolo: '¥', padrao: false }
    ];

    for (const moeda of moedasPadrao) {
      const existente = await this.buscarPorCodigo(moeda.codigo);
      if (!existente) {
        await this.criarMoeda(moeda);
        console.log(`✓ Moeda ${moeda.codigo} criada`);
      }
    }
  }
}

module.exports = new MoedaService();
