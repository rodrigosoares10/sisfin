const express = require('express');
const authRoutes = require('./authRoutes');
const transactionRoutes = require('./transactionRoutes');
const accountRoutes = require('./accountRoutes');
const categoryRoutes = require('./categoryRoutes');
const dashboardRoutes = require('./dashboardRoutes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/transactions', transactionRoutes);
router.use('/accounts', accountRoutes);
router.use('/categories', categoryRoutes);
router.use('/dashboard', dashboardRoutes);

module.exports = router;
