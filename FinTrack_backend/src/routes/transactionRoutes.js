const express = require('express');
const router = express.Router();
const {
  createTransaction,
  getTransactions,
  getTransactionById,
  updateTransaction,
  deleteTransaction,
} = require('../controllers/transactionController');
const { protect } = require('../middleware/authMiddleware');
const {
  validateTransactionId,
  validateCreateTransaction,
  validateUpdateTransaction,
  validateGetTransactions,
} = require('../validators/transactionValidator');

// Protect all transaction routes with JWT authentication
router.use(protect);

router.route('/')
  .post(validateCreateTransaction, createTransaction)
  .get(validateGetTransactions, getTransactions);

router.route('/:id')
  .get(validateTransactionId, getTransactionById)
  .put(validateTransactionId, validateUpdateTransaction, updateTransaction)
  .delete(validateTransactionId, deleteTransaction);

module.exports = router;
