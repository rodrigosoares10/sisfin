/**
 * Exemplos de Uso da API
 * Demonstra como usar todos os recursos avançados do sistema
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const recorrenteService = require('../src/services/recorrenteService');
const notificacaoService = require('../src/services/notificacaoService');
const moedaService = require('../src/services/moedaService');
const anexoService = require('../src/services/anexoService');
const permissaoService = require('../src/services/permissaoService');
const permissaoMiddleware = require('../src/middleware/permissaoMiddleware');

// ========================================
// 1. TRANSAÇÕES RECORRENTES
// ========================================

async function exemploTransacaoRecorrente() {
  console.log('\n📅 === TRANSAÇÕES RECORRENTES ===\n');

  // Criar uma transação recorrente mensal
  const recorrente = await recorrenteService.criar({
    tipo: 'DESPESA',
    valor: 1500.00,
    descricao: 'Aluguel do escritório',
    categoria: 'Infraestrutura',
    frequencia: 'MENSAL',
    dataInicio: new Date('2024-01-05'),
    diaVencimento: 5, // Dia 5 de cada mês
    metodoPagamento: 'BOLETO',
    centroCustoId: 'centro-custo-id-aqui'
  });

  console.log('✓ Transação recorrente criada:', recorrente.id);

  // Listar transações recorrentes ativas
  const ativas = await recorrenteService.listarAtivas();
  console.log(`✓ ${ativas.length} transações recorrentes ativas`);

  // Gerar transações manualmente (normalmente feito por cron)
  const geradas = await recorrenteService.gerarTransacoes();
  console.log(`✓ ${geradas.length} transações geradas`);
}

// ========================================
// 2. NOTIFICAÇÕES
// ========================================

async function exemploNotificacoes() {
  console.log('\n🔔 === NOTIFICAÇÕES ===\n');

  // Criar notificação manual
  const notificacao = await notificacaoService.criar({
    usuarioId: 'usuario-id-aqui',
    tipo: 'SISTEMA',
    titulo: 'Bem-vindo ao sistema!',
    mensagem: 'Seu cadastro foi concluído com sucesso.',
    metadata: { origem: 'sistema' }
  });

  console.log('✓ Notificação criada:', notificacao.id);

  // Listar notificações do usuário
  const notificacoes = await notificacaoService.listarPorUsuario('usuario-id-aqui');
  console.log(`✓ Usuário tem ${notificacoes.length} notificações`);

  // Marcar como lida
  await notificacaoService.marcarComoLida(notificacao.id);
  console.log('✓ Notificação marcada como lida');

  // Executar verificações automáticas
  await notificacaoService.notificarTransacoesVencendo();
  console.log('✓ Verificação de transações vencendo executada');

  await notificacaoService.verificarMetasCentroCusto();
  console.log('✓ Verificação de metas executada');
}

// ========================================
// 3. MULTI-MOEDA
// ========================================

async function exemploMultiMoeda() {
  console.log('\n💱 === MULTI-MOEDA ===\n');

  // Inicializar moedas padrão
  await moedaService.inicializarMoedasPadrao();
  console.log('✓ Moedas padrão inicializadas');

  // Criar moeda customizada
  const moeda = await moedaService.criarMoeda({
    codigo: 'ARS',
    nome: 'Peso Argentino',
    simbolo: '$',
    casasDecimais: 2,
    padrao: false
  });

  console.log('✓ Moeda criada:', moeda.codigo);

  // Registrar taxa de câmbio
  await moedaService.registrarTaxaCambio({
    codigoOrigem: 'BRL',
    codigoDestino: 'USD',
    taxa: 0.20,
    fonte: 'manual'
  });

  console.log('✓ Taxa de câmbio registrada');

  // Obter taxa de câmbio
  const taxa = await moedaService.obterTaxaCambio('BRL', 'USD');
  console.log(`✓ Taxa BRL/USD: ${taxa.taxa}`);

  // Converter valor
  const valorConvertido = await moedaService.converter(1000, 'BRL', 'USD');
  console.log(`✓ R$ 1.000,00 = $ ${valorConvertido.toFixed(2)}`);

  // Gerar relatório com conversão
  const dataInicio = new Date('2024-01-01');
  const dataFim = new Date('2024-01-31');
  const relatorio = await moedaService.gerarRelatorioConvertido(dataInicio, dataFim);
  console.log('✓ Relatório gerado:', relatorio);
}

// ========================================
// 4. ANEXOS
// ========================================

async function exemploAnexos() {
  console.log('\n📎 === ANEXOS ===\n');

  // Inicializar serviço de anexos
  await anexoService.inicializar();

  // Simular upload de arquivo
  const arquivoSimulado = {
    originalname: 'nota-fiscal-123.pdf',
    buffer: Buffer.from('conteúdo do PDF'),
    size: 1024 * 50, // 50KB
    mimetype: 'application/pdf'
  };

  const anexo = await anexoService.upload({
    transacaoId: 'transacao-id-aqui',
    tipo: 'NOTA_FISCAL',
    arquivo: arquivoSimulado,
    descricao: 'Nota fiscal do fornecedor XYZ'
  });

  console.log('✓ Arquivo enviado:', anexo.nomeOriginal);

  // Listar anexos da transação
  const anexos = await anexoService.listarPorTransacao('transacao-id-aqui');
  console.log(`✓ Transação tem ${anexos.length} anexo(s)`);

  // Obter estatísticas
  const stats = await anexoService.obterEstatisticas();
  console.log('✓ Estatísticas:', {
    total: stats.totalAnexos,
    tamanhoMB: stats.tamanhoTotalMB
  });

  // Gerar URL assinada (S3)
  // const url = await anexoService.gerarUrlAssinada(anexo.id);
  // console.log('✓ URL assinada:', url);
}

// ========================================
// 5. CONTROLE DE ACESSO
// ========================================

async function exemploControleAcesso() {
  console.log('\n🔐 === CONTROLE DE ACESSO ===\n');

  // Inicializar sistema de permissões
  await permissaoService.inicializarSistema();
  console.log('✓ Sistema de permissões inicializado');

  // Verificar permissão
  const temPermissao = await permissaoMiddleware.verificarPermissao(
    'usuario-id-aqui',
    'TRANSACAO_CRIAR'
  );

  console.log(`✓ Usuário pode criar transação: ${temPermissao}`);

  // Listar permissões do usuário
  const permissoes = await permissaoMiddleware.listarPermissoesUsuario('usuario-id-aqui');
  console.log(`✓ Usuário tem ${permissoes.length} permissões`);

  // Conceder permissão específica
  await permissaoMiddleware.concederPermissao(
    'usuario-id-aqui',
    'RELATORIO_GERENCIAL'
  );

  console.log('✓ Permissão concedida');

  // Listar permissões de uma role
  const permissoesFinanceiro = await permissaoService.listarPermissoesRole('FINANCEIRO');
  console.log(`✓ Role FINANCEIRO tem ${permissoesFinanceiro.length} permissões`);
}

// ========================================
// 6. TRANSAÇÃO COM MÚLTIPLOS RECURSOS
// ========================================

async function exemploTransacaoCompleta() {
  console.log('\n💰 === TRANSAÇÃO COMPLETA ===\n');

  // Criar transação com multi-moeda
  const moedaUSD = await moedaService.buscarPorCodigo('USD');
  const taxa = await moedaService.obterTaxaCambio('USD', 'BRL');

  const transacao = await prisma.transacao.create({
    data: {
      tipo: 'RECEITA',
      valor: 1000 * taxa.taxa, // Convertido para BRL
      valorOriginal: 1000, // $1000
      taxaConversao: taxa.taxa,
      descricao: 'Pagamento de cliente internacional',
      categoria: 'Vendas',
      data: new Date(),
      dataVencimento: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 dias
      metodoPagamento: 'TRANSFERENCIA',
      statusPagamento: 'PENDENTE',
      centroCustoId: 'centro-custo-id',
      clienteId: 'cliente-id',
      moedaId: moedaUSD.id
    }
  });

  console.log('✓ Transação criada:', transacao.id);
  console.log(`  Valor original: $ ${transacao.valorOriginal}`);
  console.log(`  Valor convertido: R$ ${transacao.valor}`);
  console.log(`  Taxa de conversão: ${transacao.taxaConversao}`);

  // Adicionar anexo à transação
  const arquivoSimulado = {
    originalname: 'contrato.pdf',
    buffer: Buffer.from('conteúdo do contrato'),
    size: 1024 * 100,
    mimetype: 'application/pdf'
  };

  const anexo = await anexoService.upload({
    transacaoId: transacao.id,
    tipo: 'CONTRATO',
    arquivo: arquivoSimulado,
    descricao: 'Contrato do cliente'
  });

  console.log('✓ Anexo adicionado:', anexo.nomeOriginal);

  return transacao;
}

// ========================================
// 7. EXEMPLO DE API EXPRESS
// ========================================

function exemploAPIExpress() {
  console.log('\n🌐 === EXEMPLO API EXPRESS ===\n');

  const codigoExemplo = `
const express = require('express');
const app = express();
const permissaoMiddleware = require('./src/middleware/permissaoMiddleware');

app.use(express.json());

// Rota protegida por permissão
app.post('/api/transacoes',
  permissaoMiddleware.requerPermissao('TRANSACAO_CRIAR'),
  async (req, res) => {
    try {
      const transacao = await prisma.transacao.create({
        data: req.body
      });
      res.json(transacao);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// Rota com múltiplas permissões (OR)
app.get('/api/relatorios',
  permissaoMiddleware.requerQualquerPermissao([
    'RELATORIO_FINANCEIRO',
    'RELATORIO_GERENCIAL'
  ]),
  async (req, res) => {
    // Gerar relatório
    res.json({ ... });
  }
);

// Rota restrita por role
app.post('/api/usuarios',
  permissaoMiddleware.requerRole(['ADMIN']),
  async (req, res) => {
    // Criar usuário
    res.json({ ... });
  }
);

app.listen(3000, () => {
  console.log('API rodando na porta 3000');
});
  `;

  console.log(codigoExemplo);
}

// ========================================
// EXECUTAR EXEMPLOS
// ========================================

async function executarTodosExemplos() {
  try {
    console.log('\n🚀 === INICIANDO EXEMPLOS ===\n');

    // Descomente a linha do exemplo que deseja executar:

    // await exemploTransacaoRecorrente();
    // await exemploNotificacoes();
    // await exemploMultiMoeda();
    // await exemploAnexos();
    // await exemploControleAcesso();
    // await exemploTransacaoCompleta();
    exemploAPIExpress();

    console.log('\n✅ === EXEMPLOS CONCLUÍDOS ===\n');
  } catch (error) {
    console.error('❌ Erro ao executar exemplos:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  executarTodosExemplos();
}

module.exports = {
  exemploTransacaoRecorrente,
  exemploNotificacoes,
  exemploMultiMoeda,
  exemploAnexos,
  exemploControleAcesso,
  exemploTransacaoCompleta,
  exemploAPIExpress
};
