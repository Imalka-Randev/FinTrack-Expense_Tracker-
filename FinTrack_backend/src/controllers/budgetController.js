const budgetService = require('../services/budgetService');

/**
 * Handle POST /api/budgets
 */
const createBudget = async (req, res, next) => {
  try {
    const { category, amount, month, year } = req.body;

    const budget = await budgetService.createBudget(req.user.id, {
      category,
      amount,
      month: Number(month),
      year: Number(year),
    });

    res.status(201).json({
      success: true,
      message: 'Budget created successfully',
      data: {
        budget,
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      res.status(400);
      return next(new Error('A budget for this category, month, and year already exists'));
    }
    if (error.statusCode) {
      res.status(error.statusCode);
    }
    next(error);
  }
};

/**
 * Handle GET /api/budgets
 */
const getBudgets = async (req, res, next) => {
  try {
    const budgets = await budgetService.getBudgets(req.user.id, req.query);

    res.status(200).json({
      success: true,
      count: budgets.length,
      data: {
        budgets,
      },
    });
  } catch (error) {
    if (error.statusCode) {
      res.status(error.statusCode);
    }
    next(error);
  }
};

/**
 * Handle GET /api/budgets/:id
 */
const getBudgetById = async (req, res, next) => {
  try {
    const budget = await budgetService.getBudgetById(req.user.id, req.params.id);

    res.status(200).json({
      success: true,
      message: 'Budget retrieved successfully',
      data: {
        budget,
      },
    });
  } catch (error) {
    if (error.statusCode) {
      res.status(error.statusCode);
    }
    next(error);
  }
};

/**
 * Handle PUT /api/budgets/:id
 */
const updateBudget = async (req, res, next) => {
  try {
    const budget = await budgetService.updateBudget(req.user.id, req.params.id, req.body);

    res.status(200).json({
      success: true,
      message: 'Budget updated successfully',
      data: {
        budget,
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      res.status(400);
      return next(new Error('A budget for this category, month, and year already exists'));
    }
    if (error.statusCode) {
      res.status(error.statusCode);
    }
    next(error);
  }
};

/**
 * Handle DELETE /api/budgets/:id
 */
const deleteBudget = async (req, res, next) => {
  try {
    await budgetService.deleteBudget(req.user.id, req.params.id);

    res.status(200).json({
      success: true,
      message: 'Budget deleted successfully',
    });
  } catch (error) {
    if (error.statusCode) {
      res.status(error.statusCode);
    }
    next(error);
  }
};

module.exports = {
  createBudget,
  getBudgets,
  getBudgetById,
  updateBudget,
  deleteBudget,
};
