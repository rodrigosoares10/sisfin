const express = require('express');
const categoryController = require('../controllers/categoryController');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

router.use(authMiddleware);

router.post('/', categoryController.create);
router.get('/', categoryController.getAll);
router.get('/stats', categoryController.getStats);
router.get('/:id', categoryController.getById);
router.put('/:id', categoryController.update);
router.delete('/:id', categoryController.delete);

module.exports = router;
