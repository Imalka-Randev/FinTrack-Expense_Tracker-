const mongoose = require('mongoose');

const validateTransactionId = (req, res, next) => {
  const { id } = req.params;

  if (!id || !/^[0-9a-fA-F]{24}$/.test(id) || !mongoose.Types.ObjectId.isValid(id)) {
    res.status(400);
    return next(new Error('Invalid transaction ID format'));
  }

  next();
};

const validateCreateTransaction = (req, res, next) => {
  const { type, amount, category, description, date, userId, _id } = req.body;

  // Check type
  if (!type || typeof type !== 'string' || !['income', 'expense'].includes(type.trim().toLowerCase())) {
    res.status(400);
    return next(new Error("Transaction type is required and must be either 'income' or 'expense'"));
  }

  // Check amount
  if (amount === undefined || amount === null || typeof amount !== 'number' || !Number.isFinite(amount) || amount <= 0) {
    res.status(400);
    return next(new Error('Amount is required and must be a finite number greater than 0'));
  }

  // Check category
  if (!category || typeof category !== 'string' || category.trim().length === 0) {
    res.status(400);
    return next(new Error('Category is required and must be a non-empty string'));
  }

  if (category.trim().length > 100) {
    res.status(400);
    return next(new Error('Category cannot exceed 100 characters'));
  }

  // Check description (optional)
  if (description !== undefined && description !== null) {
    if (typeof description !== 'string') {
      res.status(400);
      return next(new Error('Description must be a string'));
    }
    if (description.length > 500) {
      res.status(400);
      return next(new Error('Description cannot exceed 500 characters'));
    }
  }

  // Check date (optional, defaults to Date.now in model)
  if (date !== undefined && date !== null) {
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      res.status(400);
      return next(new Error('Invalid date format'));
    }
  }

  next();
};

const validateUpdateTransaction = (req, res, next) => {
  if (!req.body || typeof req.body !== 'object' || Object.keys(req.body).length === 0) {
    res.status(400);
    return next(new Error('At least one field must be provided for update'));
  }

  // Prevent changing ownership or internal ID
  if ('userId' in req.body) {
    res.status(400);
    return next(new Error('Cannot modify transaction ownership'));
  }

  if ('_id' in req.body) {
    res.status(400);
    return next(new Error('Cannot modify transaction ID'));
  }

  const allowedFields = ['type', 'amount', 'category', 'description', 'date'];
  const updateFields = Object.keys(req.body).filter(k => allowedFields.includes(k));

  if (updateFields.length === 0) {
    res.status(400);
    return next(new Error('At least one valid field must be provided for update'));
  }

  // Reject unsupported fields
  const unsupportedFields = Object.keys(req.body).filter(k => !allowedFields.includes(k));
  if (unsupportedFields.length > 0) {
    res.status(400);
    return next(new Error(`Unsupported field(s): ${unsupportedFields.join(', ')}`));
  }

  const { type, amount, category, description, date } = req.body;

  if (type !== undefined) {
    if (typeof type !== 'string' || !['income', 'expense'].includes(type.trim().toLowerCase())) {
      res.status(400);
      return next(new Error("Transaction type must be either 'income' or 'expense'"));
    }
  }

  if (amount !== undefined) {
    if (typeof amount !== 'number' || !Number.isFinite(amount) || amount <= 0) {
      res.status(400);
      return next(new Error('Amount must be a finite number greater than 0'));
    }
  }

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

  if (description !== undefined && description !== null) {
    if (typeof description !== 'string') {
      res.status(400);
      return next(new Error('Description must be a string'));
    }
    if (description.length > 500) {
      res.status(400);
      return next(new Error('Description cannot exceed 500 characters'));
    }
  }

  if (date !== undefined && date !== null) {
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      res.status(400);
      return next(new Error('Invalid date format'));
    }
  }

  next();
};

const validateGetTransactions = (req, res, next) => {
  const { type, startDate, endDate } = req.query;

  if (type !== undefined) {
    if (typeof type !== 'string' || !['income', 'expense'].includes(type.trim().toLowerCase())) {
      res.status(400);
      return next(new Error("Query parameter 'type' must be either 'income' or 'expense'"));
    }
  }

  if (startDate !== undefined) {
    const parsedStart = new Date(startDate);
    if (isNaN(parsedStart.getTime())) {
      res.status(400);
      return next(new Error("Invalid 'startDate' query parameter format"));
    }
  }

  if (endDate !== undefined) {
    const parsedEnd = new Date(endDate);
    if (isNaN(parsedEnd.getTime())) {
      res.status(400);
      return next(new Error("Invalid 'endDate' query parameter format"));
    }
  }

  if (startDate !== undefined && endDate !== undefined) {
    if (new Date(startDate) > new Date(endDate)) {
      res.status(400);
      return next(new Error("'startDate' cannot be after 'endDate'"));
    }
  }

  next();
};

module.exports = {
  validateTransactionId,
  validateCreateTransaction,
  validateUpdateTransaction,
  validateGetTransactions,
};
