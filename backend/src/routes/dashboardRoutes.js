const express = require('express');
const dashboardController = require('../controllers/dashboardController');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

router.use(authMiddleware);

router.get('/overview', dashboardController.getOverview);
router.get('/monthly-trend', dashboardController.getMonthlyTrend);

module.exports = router;
