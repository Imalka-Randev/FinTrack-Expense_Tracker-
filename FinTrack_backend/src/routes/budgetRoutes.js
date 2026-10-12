const express = require('express');
const router = express.Router();
const {
  createBudget,
  getBudgets,
  getBudgetById,
  updateBudget,
  deleteBudget,
} = require('../controllers/budgetController');
const { protect } = require('../middleware/authMiddleware');
const {
  validateBudgetId,
  validateCreateBudget,
  validateUpdateBudget,
  validateGetBudgets,
} = require('../validators/budgetValidator');

// Protect all budget routes with JWT authentication
router.use(protect);

router.route('/')
  .post(validateCreateBudget, createBudget)
  .get(validateGetBudgets, getBudgets);

router.route('/:id')
  .get(validateBudgetId, getBudgetById)
  .put(validateBudgetId, validateUpdateBudget, updateBudget)
  .delete(validateBudgetId, deleteBudget);

module.exports = router;
