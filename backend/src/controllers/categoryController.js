const prisma = require('../config/database');

class CategoryController {
  async create(req, res, next) {
    try {
      const { name, type, color, icon, description } = req.body;

      const category = await prisma.category.create({
        data: {
          name,
          type,
          color,
          icon,
          description,
          userId: req.userId,
        },
      });

      res.status(201).json(category);
    } catch (error) {
      next(error);
    }
  }

  async getAll(req, res, next) {
    try {
      const { type } = req.query;

      const where = {
        userId: req.userId,
      };

      if (type) {
        where.type = type;
      }

      const categories = await prisma.category.findMany({
        where,
        include: {
          _count: {
            select: { transactions: true },
          },
        },
        orderBy: {
          name: 'asc',
        },
      });

      res.json(categories);
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const { id } = req.params;

      const category = await prisma.category.findFirst({
        where: {
          id,
          userId: req.userId,
        },
        include: {
          transactions: {
            orderBy: {
              date: 'desc',
            },
            take: 10,
          },
          _count: {
            select: { transactions: true },
          },
        },
      });

      if (!category) {
        return res.status(404).json({ error: 'Categoria não encontrada' });
      }

      res.json(category);
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const { id } = req.params;
      const { name, type, color, icon, description } = req.body;

      const existingCategory = await prisma.category.findFirst({
        where: { id, userId: req.userId },
      });

      if (!existingCategory) {
        return res.status(404).json({ error: 'Categoria não encontrada' });
      }

      const category = await prisma.category.update({
        where: { id },
        data: {
          name,
          type,
          color,
          icon,
          description,
        },
      });

      res.json(category);
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      const { id } = req.params;

      const category = await prisma.category.findFirst({
        where: { id, userId: req.userId },
      });

      if (!category) {
        return res.status(404).json({ error: 'Categoria não encontrada' });
      }

      // Verificar se há transações associadas
      const transactionsCount = await prisma.transaction.count({
        where: { categoryId: id },
      });

      if (transactionsCount > 0) {
        return res.status(400).json({
          error: 'Não é possível excluir categoria com transações associadas',
        });
      }

      await prisma.category.delete({
        where: { id },
      });

      res.json({ message: 'Categoria excluída com sucesso' });
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
        include: {
          category: true,
        },
      });

      const categoryStats = {};

      transactions.forEach((transaction) => {
        const categoryName = transaction.category.name;
        if (!categoryStats[categoryName]) {
          categoryStats[categoryName] = {
            name: categoryName,
            type: transaction.category.type,
            color: transaction.category.color,
            total: 0,
            count: 0,
          };
        }
        categoryStats[categoryName].total += Number(transaction.amount);
        categoryStats[categoryName].count += 1;
      });

      const stats = Object.values(categoryStats).sort((a, b) => b.total - a.total);

      res.json(stats);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CategoryController();
