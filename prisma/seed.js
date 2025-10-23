const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

  // Criar usuário admin padrão
  const admin = await prisma.usuario.upsert({
    where: { email: 'admin@sisfin.com' },
    update: {},
    create: {
      nome: 'Administrador',
      email: 'admin@sisfin.com',
      senha: '$2b$10$example.hash', // Em produção, use bcrypt para hash
      role: 'ADMIN',
      ativo: true,
    },
  });
  console.log('✅ Usuário admin criado:', admin.email);

  // Criar centros de custo padrão
  const centrosCusto = await Promise.all([
    prisma.centroCusto.create({
      data: {
        nome: 'Vendas',
        descricao: 'Centro de custo para vendas e receitas',
        cor: '#10B981', // Verde
        ativo: true,
      },
    }),
    prisma.centroCusto.create({
      data: {
        nome: 'Marketing',
        descricao: 'Despesas com marketing e publicidade',
        cor: '#F59E0B', // Laranja
        ativo: true,
      },
    }),
    prisma.centroCusto.create({
      data: {
        nome: 'Operacional',
        descricao: 'Despesas operacionais gerais',
        cor: '#3B82F6', // Azul
        ativo: true,
      },
    }),
    prisma.centroCusto.create({
      data: {
        nome: 'Infraestrutura',
        descricao: 'Custos com servidores, ferramentas e tecnologia',
        cor: '#8B5CF6', // Roxo
        ativo: true,
      },
    }),
  ]);
  console.log(`✅ ${centrosCusto.length} centros de custo criados`);

  // Criar produtos exemplo
  const produtos = await Promise.all([
    prisma.produto.create({
      data: {
        nome: 'Plano Básico',
        tipo: 'MRR',
        valor: 99.90,
        descricao: 'Plano mensal básico com recursos essenciais',
        ativo: true,
      },
    }),
    prisma.produto.create({
      data: {
        nome: 'Plano Pro',
        tipo: 'MRR',
        valor: 299.90,
        descricao: 'Plano mensal profissional com recursos avançados',
        ativo: true,
      },
    }),
    prisma.produto.create({
      data: {
        nome: 'Consultoria',
        tipo: 'UNICO',
        valor: 1500.00,
        descricao: 'Serviço de consultoria personalizada',
        ativo: true,
      },
    }),
  ]);
  console.log(`✅ ${produtos.length} produtos criados`);

  // Criar clientes exemplo
  const clientes = await Promise.all([
    prisma.cliente.create({
      data: {
        nome: 'João Silva',
        email: 'joao@email.com',
        telefone: '(11) 99999-9999',
        tipo: 'PESSOA_FISICA',
        ativo: true,
      },
    }),
    prisma.cliente.create({
      data: {
        nome: 'Maria Santos',
        email: 'maria@empresa.com',
        telefone: '(11) 98888-8888',
        empresa: 'Empresa XYZ Ltda',
        tipo: 'PESSOA_JURIDICA',
        ativo: true,
      },
    }),
  ]);
  console.log(`✅ ${clientes.length} clientes criados`);

  // Criar transações exemplo
  const hoje = new Date();
  const transacoes = await Promise.all([
    // Receita - Venda do Plano Básico
    prisma.transacao.create({
      data: {
        tipo: 'RECEITA',
        valor: 99.90,
        descricao: 'Assinatura Plano Básico - João Silva',
        data: hoje,
        categoria: 'Assinaturas',
        recorrente: true,
        frequencia: 'MENSAL',
        statusPagamento: 'PAGO',
        metodoPagamento: 'PIX',
        centroCustoId: centrosCusto[0].id,
        clienteId: clientes[0].id,
        produtoId: produtos[0].id,
      },
    }),
    // Receita - Consultoria
    prisma.transacao.create({
      data: {
        tipo: 'RECEITA',
        valor: 1500.00,
        descricao: 'Consultoria Estratégica - Empresa XYZ',
        data: hoje,
        categoria: 'Serviços',
        recorrente: false,
        statusPagamento: 'PAGO',
        metodoPagamento: 'TRANSFERENCIA',
        centroCustoId: centrosCusto[0].id,
        clienteId: clientes[1].id,
        produtoId: produtos[2].id,
      },
    }),
    // Despesa - Marketing
    prisma.transacao.create({
      data: {
        tipo: 'DESPESA',
        valor: 500.00,
        descricao: 'Anúncios Google Ads',
        data: hoje,
        categoria: 'Publicidade Online',
        recorrente: true,
        frequencia: 'MENSAL',
        statusPagamento: 'PAGO',
        metodoPagamento: 'CARTAO_CREDITO',
        centroCustoId: centrosCusto[1].id,
      },
    }),
    // Despesa - Infraestrutura
    prisma.transacao.create({
      data: {
        tipo: 'DESPESA',
        valor: 150.00,
        descricao: 'Servidor AWS',
        data: hoje,
        categoria: 'Cloud Computing',
        recorrente: true,
        frequencia: 'MENSAL',
        statusPagamento: 'PENDENTE',
        metodoPagamento: 'CARTAO_CREDITO',
        centroCustoId: centrosCusto[3].id,
      },
    }),
  ]);
  console.log(`✅ ${transacoes.length} transações criadas`);

  // Criar metas exemplo
  const mesAtual = hoje.getMonth() + 1;
  const anoAtual = hoje.getFullYear();

  const metas = await Promise.all([
    // Meta de receita geral
    prisma.meta.create({
      data: {
        tipo: 'RECEITA',
        valorMeta: 50000.00,
        mes: mesAtual,
        ano: anoAtual,
        descricao: 'Meta de receita mensal geral',
      },
    }),
    // Meta de despesa para marketing
    prisma.meta.create({
      data: {
        tipo: 'DESPESA',
        valorMeta: 5000.00,
        mes: mesAtual,
        ano: anoAtual,
        descricao: 'Limite de despesas com marketing',
        centroCustoId: centrosCusto[1].id,
      },
    }),
    // Meta de lucro
    prisma.meta.create({
      data: {
        tipo: 'LUCRO',
        valorMeta: 30000.00,
        mes: mesAtual,
        ano: anoAtual,
        descricao: 'Meta de lucro líquido mensal',
      },
    }),
  ]);
  console.log(`✅ ${metas.length} metas criadas`);

  console.log('\n🎉 Seed concluído com sucesso!\n');
}

main()
  .catch((e) => {
    console.error('❌ Erro durante o seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
