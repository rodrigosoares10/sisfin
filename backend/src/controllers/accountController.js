const prisma = require('../config/database');

class AccountController {
  async create(req, res, next) {
    try {
      const { name, type, initialBalance, description } = req.body;

      const account = await prisma.account.create({
        data: {
          name,
          type,
          initialBalance,
          balance: initialBalance,
          description,
          userId: req.userId,
        },
      });

      res.status(201).json(account);
    } catch (error) {
      next(error);
    }
  }

  async getAll(req, res, next) {
    try {
      const { active } = req.query;

      const where = {
        userId: req.userId,
      };

      if (active !== undefined) {
        where.active = active === 'true';
      }

      const accounts = await prisma.account.findMany({
        where,
        orderBy: {
          createdAt: 'desc',
        },
      });

      const totalBalance = accounts.reduce((sum, acc) => sum + Number(acc.balance), 0);

      res.json({
        accounts,
        totalBalance,
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const { id } = req.params;

      const account = await prisma.account.findFirst({
        where: {
          id,
          userId: req.userId,
        },
        include: {
          transactionsFrom: {
            include: {
              category: true,
            },
            orderBy: {
              date: 'desc',
            },
            take: 10,
          },
          transactionsTo: {
            include: {
              category: true,
            },
            orderBy: {
              date: 'desc',
            },
            take: 10,
          },
        },
      });

      if (!account) {
        return res.status(404).json({ error: 'Conta não encontrada' });
      }

      res.json(account);
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const { id } = req.params;
      const { name, type, description, active } = req.body;

      const existingAccount = await prisma.account.findFirst({
        where: { id, userId: req.userId },
      });

      if (!existingAccount) {
        return res.status(404).json({ error: 'Conta não encontrada' });
      }

      const account = await prisma.account.update({
        where: { id },
        data: {
          name,
          type,
          description,
          active,
        },
      });

      res.json(account);
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      const { id } = req.params;

      const account = await prisma.account.findFirst({
        where: { id, userId: req.userId },
      });

      if (!account) {
        return res.status(404).json({ error: 'Conta não encontrada' });
      }

      // Verificar se há transações associadas
      const transactionsCount = await prisma.transaction.count({
        where: {
          OR: [{ accountFromId: id }, { accountToId: id }],
        },
      });

      if (transactionsCount > 0) {
        return res.status(400).json({
          error: 'Não é possível excluir conta com transações associadas',
        });
      }

      await prisma.account.delete({
        where: { id },
      });

      res.json({ message: 'Conta excluída com sucesso' });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AccountController();
