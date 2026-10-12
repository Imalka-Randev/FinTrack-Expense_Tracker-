const mongoose = require('mongoose');
const Budget = require('../models/Budget');
const Transaction = require('../models/Transaction');

/**
 * Escape special regex characters.
 * @param {string} str
 * @returns {string}
 */
const escapeRegex = (str) => {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

/**
 * Calculate spending progress for a given budget document.
 * @param {Object} budget - Mongoose Budget document or plain object
 * @returns {Promise<Object>}
 */
const calculateBudgetProgress = async (budget) => {
  const userObjectId = new mongoose.Types.ObjectId(budget.userId);

  // Month boundary in UTC
  const startDate = new Date(Date.UTC(budget.year, budget.month - 1, 1, 0, 0, 0, 0));
  const endDate = new Date(Date.UTC(budget.year, budget.month, 0, 23, 59, 59, 999));

  // Match only expense transactions for this user, category, and month
  const categoryRegex = new RegExp(`^${escapeRegex(budget.category.trim())}$`, 'i');

  const expenseAgg = await Transaction.aggregate([
    {
      $match: {
        userId: userObjectId,
        type: 'expense',
        category: { $regex: categoryRegex },
        date: { $gte: startDate, $lte: endDate },
      },
    },
    {
      $group: {
        _id: null,
        total: { $sum: '$amount' },
      },
    },
  ]);

  const spentAmount = expenseAgg.length > 0 ? Math.round(expenseAgg[0].total * 100) / 100 : 0;
  const budgetAmount = Math.round(budget.amount * 100) / 100;
  const remainingAmount = Math.round((budgetAmount - spentAmount) * 100) / 100;
  const percentageUsed =
    budgetAmount > 0 ? Math.round((spentAmount / budgetAmount) * 10000) / 100 : 0;
  const isExceeded = spentAmount > budgetAmount;

  return {
    _id: budget._id,
    userId: budget.userId,
    category: budget.category,
    amount: budget.amount,
    budgetAmount,
    spentAmount,
    remainingAmount,
    percentageUsed,
    isExceeded,
    month: budget.month,
    year: budget.year,
    createdAt: budget.createdAt,
    updatedAt: budget.updatedAt,
  };
};

/**
 * Create a new budget for the authenticated user.
 * @param {string} userId
 * @param {Object} data - { category, amount, month, year }
 * @returns {Promise<Object>}
 */
const createBudget = async (userId, data) => {
  const { category, amount, month, year } = data;
  const trimmedCategory = category.trim();

  // Check for duplicate budget
  const existingBudget = await Budget.findOne({
    userId,
    category: { $regex: new RegExp(`^${escapeRegex(trimmedCategory)}$`, 'i') },
    month,
    year,
  });

  if (existingBudget) {
    const error = new Error('A budget for this category, month, and year already exists');
    error.statusCode = 400;
    throw error;
  }

  const budget = await Budget.create({
    userId,
    category: trimmedCategory,
    amount,
    month,
    year,
  });

  return await calculateBudgetProgress(budget);
};

/**
 * Retrieve budgets for the authenticated user with optional filtering and spending progress.
 * Defaults to the current month and year when omitted.
 * @param {string} userId
 * @param {Object} filters - { month, year, category }
 * @returns {Promise<Array>}
 */
const getBudgets = async (userId, filters = {}) => {
  const now = new Date();
  const currentMonth = now.getUTCMonth() + 1;
  const currentYear = now.getUTCFullYear();

  const month = filters.month !== undefined ? Number(filters.month) : currentMonth;
  const year = filters.year !== undefined ? Number(filters.year) : currentYear;

  const query = {
    userId,
    month,
    year,
  };

  if (filters.category && filters.category.trim().length > 0) {
    query.category = {
      $regex: new RegExp(`^${escapeRegex(filters.category.trim())}$`, 'i'),
    };
  }

  const budgets = await Budget.find(query).sort({ category: 1, createdAt: -1 });

  return await Promise.all(budgets.map((b) => calculateBudgetProgress(b)));
};

/**
 * Retrieve a single budget by ID with spending progress.
 * @param {string} userId
 * @param {string} budgetId
 * @returns {Promise<Object>}
 */
const getBudgetById = async (userId, budgetId) => {
  const budget = await Budget.findOne({ _id: budgetId, userId });

  if (!budget) {
    const error = new Error('Budget not found');
    error.statusCode = 404;
    throw error;
  }

  return await calculateBudgetProgress(budget);
};

/**
 * Update a budget for the authenticated user.
 * @param {string} userId
 * @param {string} budgetId
 * @param {Object} updateData
 * @returns {Promise<Object>}
 */
const updateBudget = async (userId, budgetId, updateData) => {
  const budget = await Budget.findOne({ _id: budgetId, userId });

  if (!budget) {
    const error = new Error('Budget not found');
    error.statusCode = 404;
    throw error;
  }

  const targetCategory =
    updateData.category !== undefined ? updateData.category.trim() : budget.category;
  const targetMonth = updateData.month !== undefined ? Number(updateData.month) : budget.month;
  const targetYear = updateData.year !== undefined ? Number(updateData.year) : budget.year;

  // Check for duplicate category/month/year combination
  const duplicate = await Budget.findOne({
    _id: { $ne: budgetId },
    userId,
    category: { $regex: new RegExp(`^${escapeRegex(targetCategory)}$`, 'i') },
    month: targetMonth,
    year: targetYear,
  });

  if (duplicate) {
    const error = new Error('A budget for this category, month, and year already exists');
    error.statusCode = 400;
    throw error;
  }

  if (updateData.category !== undefined) {
    budget.category = targetCategory;
  }
  if (updateData.amount !== undefined) {
    budget.amount = updateData.amount;
  }
  if (updateData.month !== undefined) {
    budget.month = targetMonth;
  }
  if (updateData.year !== undefined) {
    budget.year = targetYear;
  }

  await budget.save();

  return await calculateBudgetProgress(budget);
};

/**
 * Delete a budget for the authenticated user.
 * @param {string} userId
 * @param {string} budgetId
 * @returns {Promise<Object>}
 */
const deleteBudget = async (userId, budgetId) => {
  const budget = await Budget.findOneAndDelete({ _id: budgetId, userId });

  if (!budget) {
    const error = new Error('Budget not found');
    error.statusCode = 404;
    throw error;
  }

  return budget;
};

module.exports = {
  createBudget,
  getBudgets,
  getBudgetById,
  updateBudget,
  deleteBudget,
  calculateBudgetProgress,
};
