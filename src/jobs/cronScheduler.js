/**
 * Agendador de Tarefas Automatizadas (Cron Jobs)
 * Gerencia execução automática de tarefas do sistema
 */

const cron = require('node-cron');
const recorrenteService = require('../services/recorrenteService');
const notificacaoService = require('../services/notificacaoService');
const moedaService = require('../services/moedaService');

class CronScheduler {
  constructor() {
    this.jobs = [];
  }

  /**
   * Inicia todos os cron jobs
   */
  iniciar() {
    console.log('⏰ Iniciando agendador de tarefas...');

    // Job 1: Gerar transações recorrentes (todo dia às 00:05)
    this.jobs.push(
      cron.schedule('5 0 * * *', async () => {
        console.log('🔄 Executando: Geração de transações recorrentes');
        try {
          const transacoes = await recorrenteService.gerarTransacoes();
          console.log(`✓ ${transacoes.length} transações recorrentes geradas`);
        } catch (error) {
          console.error('✗ Erro ao gerar transações recorrentes:', error);
        }
      }, {
        timezone: 'America/Sao_Paulo'
      })
    );

    // Job 2: Notificar transações vencendo (todo dia às 09:00)
    this.jobs.push(
      cron.schedule('0 9 * * *', async () => {
        console.log('🔔 Executando: Notificação de transações vencendo');
        try {
          await notificacaoService.notificarTransacoesVencendo();
          console.log('✓ Notificações de vencimento enviadas');
        } catch (error) {
          console.error('✗ Erro ao notificar transações vencendo:', error);
        }
      }, {
        timezone: 'America/Sao_Paulo'
      })
    );

    // Job 3: Notificar transações vencidas (todo dia às 10:00)
    this.jobs.push(
      cron.schedule('0 10 * * *', async () => {
        console.log('⚠️  Executando: Notificação de transações vencidas');
        try {
          await notificacaoService.notificarTransacoesVencidas();
          console.log('✓ Notificações de transações vencidas enviadas');
        } catch (error) {
          console.error('✗ Erro ao notificar transações vencidas:', error);
        }
      }, {
        timezone: 'America/Sao_Paulo'
      })
    );

    // Job 4: Verificar metas de centros de custo (todo dia às 11:00)
    this.jobs.push(
      cron.schedule('0 11 * * *', async () => {
        console.log('🎯 Executando: Verificação de metas');
        try {
          await notificacaoService.verificarMetasCentroCusto();
          console.log('✓ Verificação de metas concluída');
        } catch (error) {
          console.error('✗ Erro ao verificar metas:', error);
        }
      }, {
        timezone: 'America/Sao_Paulo'
      })
    );

    // Job 5: Resumo semanal (toda segunda-feira às 09:00)
    this.jobs.push(
      cron.schedule('0 9 * * 1', async () => {
        console.log('📊 Executando: Resumo semanal');
        try {
          await notificacaoService.gerarResumoSemanal();
          console.log('✓ Resumo semanal enviado');
        } catch (error) {
          console.error('✗ Erro ao gerar resumo semanal:', error);
        }
      }, {
        timezone: 'America/Sao_Paulo'
      })
    );

    // Job 6: Resumo mensal (primeiro dia do mês às 09:00)
    this.jobs.push(
      cron.schedule('0 9 1 * *', async () => {
        console.log('📈 Executando: Resumo mensal');
        try {
          await notificacaoService.gerarResumoMensal();
          console.log('✓ Resumo mensal enviado');
        } catch (error) {
          console.error('✗ Erro ao gerar resumo mensal:', error);
        }
      }, {
        timezone: 'America/Sao_Paulo'
      })
    );

    // Job 7: Atualizar taxas de câmbio (todo dia às 08:00)
    this.jobs.push(
      cron.schedule('0 8 * * *', async () => {
        console.log('💱 Executando: Atualização de taxas de câmbio');
        try {
          await moedaService.atualizarTaxasAutomaticamente();
          console.log('✓ Taxas de câmbio atualizadas');
        } catch (error) {
          console.error('✗ Erro ao atualizar taxas de câmbio:', error);
        }
      }, {
        timezone: 'America/Sao_Paulo'
      })
    );

    console.log(`✓ ${this.jobs.length} tarefas agendadas`);
    this.listarTarefas();
  }

  /**
   * Para todos os cron jobs
   */
  parar() {
    console.log('⏹️  Parando agendador de tarefas...');
    this.jobs.forEach(job => job.stop());
    console.log('✓ Agendador de tarefas parado');
  }

  /**
   * Lista todas as tarefas agendadas
   */
  listarTarefas() {
    console.log('\n📋 Tarefas agendadas:');
    console.log('  1. Gerar transações recorrentes - 00:05 (diário)');
    console.log('  2. Notificar transações vencendo - 09:00 (diário)');
    console.log('  3. Notificar transações vencidas - 10:00 (diário)');
    console.log('  4. Verificar metas - 11:00 (diário)');
    console.log('  5. Resumo semanal - 09:00 (segunda-feira)');
    console.log('  6. Resumo mensal - 09:00 (dia 1)');
    console.log('  7. Atualizar taxas de câmbio - 08:00 (diário)');
    console.log('');
  }

  /**
   * Executa uma tarefa manualmente
   */
  async executarManual(tarefa) {
    console.log(`🔧 Executando tarefa manualmente: ${tarefa}`);

    try {
      switch (tarefa) {
        case 'recorrentes':
          const transacoes = await recorrenteService.gerarTransacoes();
          console.log(`✓ ${transacoes.length} transações geradas`);
          break;

        case 'vencendo':
          await notificacaoService.notificarTransacoesVencendo();
          console.log('✓ Notificações enviadas');
          break;

        case 'vencidas':
          await notificacaoService.notificarTransacoesVencidas();
          console.log('✓ Notificações enviadas');
          break;

        case 'metas':
          await notificacaoService.verificarMetasCentroCusto();
          console.log('✓ Verificação concluída');
          break;

        case 'resumo-semanal':
          await notificacaoService.gerarResumoSemanal();
          console.log('✓ Resumo enviado');
          break;

        case 'resumo-mensal':
          await notificacaoService.gerarResumoMensal();
          console.log('✓ Resumo enviado');
          break;

        case 'taxas':
          await moedaService.atualizarTaxasAutomaticamente();
          console.log('✓ Taxas atualizadas');
          break;

        default:
          console.log('❌ Tarefa não encontrada');
      }
    } catch (error) {
      console.error('✗ Erro ao executar tarefa:', error);
    }
  }
}

// Singleton
const scheduler = new CronScheduler();

module.exports = scheduler;
