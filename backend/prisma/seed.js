const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando seed do banco de dados...');

  // Criar usuário administrador
  const hashedPassword = await bcrypt.hash('admin123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@rtcompany.com' },
    update: {},
    create: {
      email: 'admin@rtcompany.com',
      password: hashedPassword,
      name: 'Administrador',
      role: 'ADMIN',
    },
  });

  console.log('Usuário admin criado:', admin.email);

  // Criar categorias padrão de receita
  const incomeCategories = [
    { name: 'Salário', type: 'INCOME', color: '#10B981', icon: '💰' },
    { name: 'Freelance', type: 'INCOME', color: '#3B82F6', icon: '💼' },
    { name: 'Investimentos', type: 'INCOME', color: '#8B5CF6', icon: '📈' },
    { name: 'Vendas', type: 'INCOME', color: '#F59E0B', icon: '🛒' },
  ];

  for (const category of incomeCategories) {
    await prisma.category.upsert({
      where: { id: category.name },
      update: {},
      create: {
        ...category,
        userId: admin.id,
      },
    });
  }

  console.log('Categorias de receita criadas');

  // Criar categorias padrão de despesa
  const expenseCategories = [
    { name: 'Alimentação', type: 'EXPENSE', color: '#EF4444', icon: '🍔' },
    { name: 'Transporte', type: 'EXPENSE', color: '#F97316', icon: '🚗' },
    { name: 'Moradia', type: 'EXPENSE', color: '#06B6D4', icon: '🏠' },
    { name: 'Saúde', type: 'EXPENSE', color: '#EC4899', icon: '🏥' },
    { name: 'Educação', type: 'EXPENSE', color: '#6366F1', icon: '📚' },
    { name: 'Lazer', type: 'EXPENSE', color: '#14B8A6', icon: '🎮' },
    { name: 'Contas', type: 'EXPENSE', color: '#64748B', icon: '📄' },
  ];

  for (const category of expenseCategories) {
    await prisma.category.upsert({
      where: { id: category.name },
      update: {},
      create: {
        ...category,
        userId: admin.id,
      },
    });
  }

  console.log('Categorias de despesa criadas');

  // Criar contas padrão
  const accounts = [
    { name: 'Conta Corrente', type: 'CHECKING', initialBalance: 5000 },
    { name: 'Poupança', type: 'SAVINGS', initialBalance: 10000 },
    { name: 'Carteira', type: 'CASH', initialBalance: 500 },
  ];

  for (const account of accounts) {
    await prisma.account.create({
      data: {
        ...account,
        balance: account.initialBalance,
        userId: admin.id,
      },
    });
  }

  console.log('Contas criadas');

  console.log('Seed concluído com sucesso!');
}

main()
  .catch((e) => {
    console.error('Erro durante o seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
