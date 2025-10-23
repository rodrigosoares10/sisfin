const prisma = require('../config/database');

class DashboardController {
  async getOverview(req, res, next) {
    try {
      const { startDate, endDate } = req.query;

      const where = {
        userId: req.userId,
        isPaid: true,
      };

      if (startDate && endDate) {
        where.date = {
          gte: new Date(startDate),
          lte: new Date(endDate),
        };
      }

      // Estatísticas de transações
      const transactions = await prisma.transaction.findMany({
        where,
        include: {
          category: true,
        },
      });

      const totalIncome = transactions
        .filter((t) => t.type === 'INCOME')
        .reduce((sum, t) => sum + Number(t.amount), 0);

      const totalExpense = transactions
        .filter((t) => t.type === 'EXPENSE')
        .reduce((sum, t) => sum + Number(t.amount), 0);

      const balance = totalIncome - totalExpense;

      // Contas
      const accounts = await prisma.account.findMany({
        where: {
          userId: req.userId,
          active: true,
        },
      });

      const totalAccountBalance = accounts.reduce(
        (sum, acc) => sum + Number(acc.balance),
        0
      );

      // Transações recentes
      const recentTransactions = await prisma.transaction.findMany({
        where: { userId: req.userId },
        include: {
          category: true,
          accountFrom: true,
          accountTo: true,
        },
        orderBy: {
          date: 'desc',
        },
        take: 5,
      });

      // Despesas por categoria
      const expensesByCategory = {};
      transactions
        .filter((t) => t.type === 'EXPENSE')
        .forEach((transaction) => {
          const categoryName = transaction.category.name;
          if (!expensesByCategory[categoryName]) {
            expensesByCategory[categoryName] = {
              name: categoryName,
              color: transaction.category.color,
              total: 0,
            };
          }
          expensesByCategory[categoryName].total += Number(transaction.amount);
        });

      const topExpenseCategories = Object.values(expensesByCategory)
        .sort((a, b) => b.total - a.total)
        .slice(0, 5);

      res.json({
        summary: {
          totalIncome,
          totalExpense,
          balance,
          totalAccountBalance,
        },
        recentTransactions,
        topExpenseCategories,
        accountsCount: accounts.length,
        transactionsCount: transactions.length,
      });
    } catch (error) {
      next(error);
    }
  }

  async getMonthlyTrend(req, res, next) {
    try {
      const { year } = req.query;
      const targetYear = year ? parseInt(year) : new Date().getFullYear();

      const transactions = await prisma.transaction.findMany({
        where: {
          userId: req.userId,
          isPaid: true,
          date: {
            gte: new Date(`${targetYear}-01-01`),
            lte: new Date(`${targetYear}-12-31`),
          },
        },
      });

      const monthlyData = Array.from({ length: 12 }, (_, i) => ({
        month: i + 1,
        income: 0,
        expense: 0,
        balance: 0,
      }));

      transactions.forEach((transaction) => {
        const month = new Date(transaction.date).getMonth();
        const amount = Number(transaction.amount);

        if (transaction.type === 'INCOME') {
          monthlyData[month].income += amount;
        } else if (transaction.type === 'EXPENSE') {
          monthlyData[month].expense += amount;
        }
      });

      monthlyData.forEach((data) => {
        data.balance = data.income - data.expense;
      });

      res.json(monthlyData);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new DashboardController();
