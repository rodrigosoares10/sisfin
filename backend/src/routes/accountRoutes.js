const express = require('express');
const accountController = require('../controllers/accountController');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

router.use(authMiddleware);

router.post('/', accountController.create);
router.get('/', accountController.getAll);
router.get('/:id', accountController.getById);
router.put('/:id', accountController.update);
router.delete('/:id', accountController.delete);

module.exports = router;
