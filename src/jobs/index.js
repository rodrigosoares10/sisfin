/**
 * Inicializador de Jobs
 * Arquivo principal para iniciar o sistema de cron jobs
 */

const cronScheduler = require('./cronScheduler');

// Inicia o agendador
cronScheduler.iniciar();

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Recebido sinal de término...');
  cronScheduler.parar();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Recebido sinal de término...');
  cronScheduler.parar();
  process.exit(0);
});

console.log('✓ Sistema de jobs inicializado');
console.log('💡 Dica: Use Ctrl+C para parar o agendador\n');
