const express = require('express');
const transactionController = require('../controllers/transactionController');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

router.use(authMiddleware);

router.post('/', transactionController.create);
router.get('/', transactionController.getAll);
router.get('/stats', transactionController.getStats);
router.get('/:id', transactionController.getById);
router.put('/:id', transactionController.update);
router.delete('/:id', transactionController.delete);

module.exports = router;
