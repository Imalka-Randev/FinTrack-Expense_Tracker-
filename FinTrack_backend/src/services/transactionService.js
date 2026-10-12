const Transaction = require('../models/Transaction');

/**
 * Escapes special characters for use in a regular expression.
 * @param {string} str 
 * @returns {string}
 */
const escapeRegex = (str) => {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

/**
 * Create a new transaction for the authenticated user.
 * @param {string} userId 
 * @param {Object} transactionData 
 * @returns {Promise<Object>}
 */
const createTransaction = async (userId, transactionData) => {
  const { type, amount, category, description, date } = transactionData;

  const transaction = await Transaction.create({
    userId,
    type: type.toLowerCase(),
    amount,
    category: category.trim(),
    description: description !== undefined && description !== null ? description.trim() : undefined,
    date: date ? new Date(date) : undefined,
  });

  return transaction;
};

/**
 * Retrieve transactions for the authenticated user with optional filtering.
 * @param {string} userId 
 * @param {Object} filters 
 * @returns {Promise<Array>}
 */
const getTransactions = async (userId, filters = {}) => {
  const query = { userId };

  // Filter by type ('income' or 'expense')
  if (filters.type) {
    query.type = filters.type.trim().toLowerCase();
  }

  // Filter by category (case-insensitive exact match)
  if (filters.category && filters.category.trim().length > 0) {
    const escapedCategory = escapeRegex(filters.category.trim());
    query.category = { $regex: new RegExp(`^${escapedCategory}$`, 'i') };
  }

  // Safe keyword search in description
  if (filters.search && filters.search.trim().length > 0) {
    const escapedSearch = escapeRegex(filters.search.trim());
    query.description = { $regex: escapedSearch, $options: 'i' };
  }

  // Filter by date range (startDate / endDate)
  if (filters.startDate || filters.endDate) {
    query.date = {};

    if (filters.startDate) {
      const start = new Date(filters.startDate);
      // If provided as YYYY-MM-DD, set to start of day in UTC
      if (/^\d{4}-\d{2}-\d{2}$/.test(filters.startDate.trim())) {
        start.setUTCHours(0, 0, 0, 0);
      }
      query.date.$gte = start;
    }

    if (filters.endDate) {
      const end = new Date(filters.endDate);
      // If provided as YYYY-MM-DD, set to end of day in UTC
      if (/^\d{4}-\d{2}-\d{2}$/.test(filters.endDate.trim())) {
        end.setUTCHours(23, 59, 59, 999);
      }
      query.date.$lte = end;
    }
  }

  return await Transaction.find(query).sort({ date: -1, createdAt: -1 });
};

/**
 * Retrieve a single transaction by ID for the authenticated user.
 * @param {string} userId 
 * @param {string} transactionId 
 * @returns {Promise<Object>}
 */
const getTransactionById = async (userId, transactionId) => {
  const transaction = await Transaction.findOne({ _id: transactionId, userId });

  if (!transaction) {
    const error = new Error('Transaction not found');
    error.statusCode = 404;
    throw error;
  }

  return transaction;
};

/**
 * Update an existing transaction for the authenticated user.
 * Prevents modifying transaction ownership or internal IDs.
 * @param {string} userId 
 * @param {string} transactionId 
 * @param {Object} updateData 
 * @returns {Promise<Object>}
 */
const updateTransaction = async (userId, transactionId, updateData) => {
  const updatePayload = {};

  if (updateData.type !== undefined) {
    updatePayload.type = updateData.type.trim().toLowerCase();
  }
  if (updateData.amount !== undefined) {
    updatePayload.amount = updateData.amount;
  }
  if (updateData.category !== undefined) {
    updatePayload.category = updateData.category.trim();
  }
  if (updateData.description !== undefined) {
    updatePayload.description = updateData.description !== null ? updateData.description.trim() : '';
  }
  if (updateData.date !== undefined) {
    updatePayload.date = new Date(updateData.date);
  }

  const transaction = await Transaction.findOneAndUpdate(
    { _id: transactionId, userId },
    { $set: updatePayload },
    { returnDocument: 'after', runValidators: true }
  );

  if (!transaction) {
    const error = new Error('Transaction not found');
    error.statusCode = 404;
    throw error;
  }

  return transaction;
};

/**
 * Delete a transaction for the authenticated user.
 * @param {string} userId 
 * @param {string} transactionId 
 * @returns {Promise<Object>}
 */
const deleteTransaction = async (userId, transactionId) => {
  const transaction = await Transaction.findOneAndDelete({ _id: transactionId, userId });

  if (!transaction) {
    const error = new Error('Transaction not found');
    error.statusCode = 404;
    throw error;
  }

  return transaction;
};

module.exports = {
  createTransaction,
  getTransactions,
  getTransactionById,
  updateTransaction,
  deleteTransaction,
  escapeRegex,
};
