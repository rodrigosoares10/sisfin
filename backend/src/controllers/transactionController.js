const prisma = require('../config/database');

class TransactionController {
  async create(req, res, next) {
    try {
      const {
        description,
        amount,
        type,
        date,
        isPaid,
        isRecurring,
        categoryId,
        accountFromId,
        accountToId,
      } = req.body;

      const transaction = await prisma.transaction.create({
        data: {
          description,
          amount,
          type,
          date: new Date(date),
          isPaid,
          isRecurring,
          categoryId,
          accountFromId,
          accountToId,
          userId: req.userId,
        },
        include: {
          category: true,
          accountFrom: true,
          accountTo: true,
        },
      });

      // Atualizar saldo das contas
      if (isPaid) {
        if (type === 'EXPENSE' && accountFromId) {
          await prisma.account.update({
            where: { id: accountFromId },
            data: {
              balance: { decrement: amount },
            },
          });
        } else if (type === 'INCOME' && accountToId) {
          await prisma.account.update({
            where: { id: accountToId },
            data: {
              balance: { increment: amount },
            },
          });
        } else if (type === 'TRANSFER' && accountFromId && accountToId) {
          await prisma.account.update({
            where: { id: accountFromId },
            data: {
              balance: { decrement: amount },
            },
          });
          await prisma.account.update({
            where: { id: accountToId },
            data: {
              balance: { increment: amount },
            },
          });
        }
      }

      res.status(201).json(transaction);
    } catch (error) {
      next(error);
    }
  }

  async getAll(req, res, next) {
    try {
      const { startDate, endDate, type, categoryId, isPaid } = req.query;

      const where = {
        userId: req.userId,
      };

      if (startDate && endDate) {
        where.date = {
          gte: new Date(startDate),
          lte: new Date(endDate),
        };
      }

      if (type) {
        where.type = type;
      }

      if (categoryId) {
        where.categoryId = categoryId;
      }

      if (isPaid !== undefined) {
        where.isPaid = isPaid === 'true';
      }

      const transactions = await prisma.transaction.findMany({
        where,
        include: {
          category: true,
          accountFrom: true,
          accountTo: true,
        },
        orderBy: {
          date: 'desc',
        },
      });

      res.json(transactions);
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const { id } = req.params;

      const transaction = await prisma.transaction.findFirst({
        where: {
          id,
          userId: req.userId,
        },
        include: {
          category: true,
          accountFrom: true,
          accountTo: true,
        },
      });

      if (!transaction) {
        return res.status(404).json({ error: 'Transação não encontrada' });
      }

      res.json(transaction);
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const { id } = req.params;
      const {
        description,
        amount,
        type,
        date,
        isPaid,
        isRecurring,
        categoryId,
        accountFromId,
        accountToId,
      } = req.body;

      const existingTransaction = await prisma.transaction.findFirst({
        where: { id, userId: req.userId },
      });

      if (!existingTransaction) {
        return res.status(404).json({ error: 'Transação não encontrada' });
      }

      const transaction = await prisma.transaction.update({
        where: { id },
        data: {
          description,
          amount,
          type,
          date: date ? new Date(date) : undefined,
          isPaid,
          isRecurring,
          categoryId,
          accountFromId,
          accountToId,
        },
        include: {
          category: true,
          accountFrom: true,
          accountTo: true,
        },
      });

      res.json(transaction);
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      const { id } = req.params;

      const transaction = await prisma.transaction.findFirst({
        where: { id, userId: req.userId },
      });

      if (!transaction) {
        return res.status(404).json({ error: 'Transação não encontrada' });
      }

      await prisma.transaction.delete({
        where: { id },
      });

      res.json({ message: 'Transação excluída com sucesso' });
    } catch (error) {
      next(error);
    }
  }

  async getStats(req, res, next) {
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

      const transactions = await prisma.transaction.findMany({
        where,
      });

      const totalIncome = transactions
        .filter((t) => t.type === 'INCOME')
        .reduce((sum, t) => sum + Number(t.amount), 0);

      const totalExpense = transactions
        .filter((t) => t.type === 'EXPENSE')
        .reduce((sum, t) => sum + Number(t.amount), 0);

      const balance = totalIncome - totalExpense;

      res.json({
        totalIncome,
        totalExpense,
        balance,
        transactionsCount: transactions.length,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new TransactionController();
