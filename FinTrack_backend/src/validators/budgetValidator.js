const mongoose = require('mongoose');

/**
 * Validate MongoDB ObjectId in req.params.id
 */
const validateBudgetId = (req, res, next) => {
  const { id } = req.params;

  if (!id || !/^[0-9a-fA-F]{24}$/.test(id) || !mongoose.Types.ObjectId.isValid(id)) {
    res.status(400);
    return next(new Error('Invalid budget ID format'));
  }

  next();
};

/**
 * Validate body for POST /api/budgets
 */
const validateCreateBudget = (req, res, next) => {
  if (!req.body || typeof req.body !== 'object') {
    res.status(400);
    return next(new Error('Request body must be provided'));
  }

  const { category, amount, month, year } = req.body;

  // Validate category
  if (!category || typeof category !== 'string' || category.trim().length === 0) {
    res.status(400);
    return next(new Error('Category is required and must be a non-empty string'));
  }

  if (category.trim().length > 100) {
    res.status(400);
    return next(new Error('Category cannot exceed 100 characters'));
  }

  // Validate amount
  if (amount === undefined || amount === null || typeof amount !== 'number' || !Number.isFinite(amount) || amount <= 0) {
    res.status(400);
    return next(new Error('Budget amount is required and must be a finite number greater than 0'));
  }

  // Validate month
  const monthNum = Number(month);
  if (month === undefined || month === null || !Number.isInteger(monthNum) || monthNum < 1 || monthNum > 12) {
    res.status(400);
    return next(new Error('Month is required and must be an integer between 1 and 12'));
  }

  // Validate year
  const yearNum = Number(year);
  if (
    year === undefined ||
    year === null ||
    !/^\d{4}$/.test(String(year).trim()) ||
    !Number.isInteger(yearNum) ||
    yearNum < 1000 ||
    yearNum > 9999
  ) {
    res.status(400);
    return next(new Error('Year is required and must be a valid 4-digit year'));
  }

  next();
};

/**
 * Validate body for PUT /api/budgets/:id
 */
const validateUpdateBudget = (req, res, next) => {
  if (!req.body || typeof req.body !== 'object' || Object.keys(req.body).length === 0) {
    res.status(400);
    return next(new Error('At least one field must be provided for update'));
  }

  // Prevent changing ownership or internal ID
  if ('userId' in req.body) {
    res.status(400);
    return next(new Error('Cannot modify budget ownership'));
  }

  if ('_id' in req.body) {
    res.status(400);
    return next(new Error('Cannot modify budget ID'));
  }

  const allowedFields = ['category', 'amount', 'month', 'year'];
  const updateFields = Object.keys(req.body).filter((k) => allowedFields.includes(k));

  if (updateFields.length === 0) {
    res.status(400);
    return next(new Error('At least one valid field must be provided for update'));
  }

  // Reject unsupported fields
  const unsupportedFields = Object.keys(req.body).filter((k) => !allowedFields.includes(k));
  if (unsupportedFields.length > 0) {
    res.status(400);
    return next(new Error(`Unsupported field(s): ${unsupportedFields.join(', ')}`));
  }

  const { category, amount, month, year } = req.body;

  if (category !== undefined) {
    if (typeof category !== 'string' || category.trim().length === 0) {
      res.status(400);
      return next(new Error('Category must be a non-empty string'));
    }
    if (category.trim().length > 100) {
      res.status(400);
      return next(new Error('Category cannot exceed 100 characters'));
    }
  }

  if (amount !== undefined) {
    if (typeof amount !== 'number' || !Number.isFinite(amount) || amount <= 0) {
      res.status(400);
      return next(new Error('Budget amount must be a finite number greater than 0'));
    }
  }

  if (month !== undefined) {
    const monthNum = Number(month);
    if (!Number.isInteger(monthNum) || monthNum < 1 || monthNum > 12) {
      res.status(400);
      return next(new Error('Month must be an integer between 1 and 12'));
    }
  }

  if (year !== undefined) {
    const yearNum = Number(year);
    if (!/^\d{4}$/.test(String(year).trim()) || !Number.isInteger(yearNum) || yearNum < 1000 || yearNum > 9999) {
      res.status(400);
      return next(new Error('Year must be a valid 4-digit year'));
    }
  }

  next();
};

/**
 * Validate query parameters for GET /api/budgets
 */
const validateGetBudgets = (req, res, next) => {
  const { month, year, category } = req.query;

  if (month !== undefined) {
    const trimmedMonth = String(month).trim();
    const monthNum = Number(trimmedMonth);
    if (!Number.isInteger(monthNum) || monthNum < 1 || monthNum > 12) {
      res.status(400);
      return next(new Error('Month must be an integer between 1 and 12'));
    }
  }

  if (year !== undefined) {
    const trimmedYear = String(year).trim();
    const yearNum = Number(trimmedYear);
    if (!/^\d{4}$/.test(trimmedYear) || !Number.isInteger(yearNum) || yearNum < 1000 || yearNum > 9999) {
      res.status(400);
      return next(new Error('Year must be a valid 4-digit year'));
    }
  }

  if (category !== undefined) {
    if (typeof category !== 'string' || category.trim().length === 0) {
      res.status(400);
      return next(new Error('Category filter must be a non-empty string'));
    }
  }

  next();
};

module.exports = {
  validateBudgetId,
  validateCreateBudget,
  validateUpdateBudget,
  validateGetBudgets,
};
