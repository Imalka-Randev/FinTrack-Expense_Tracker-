const transactionService = require('../services/transactionService');

const createTransaction = async (req, res, next) => {
  try {
    const transaction = await transactionService.createTransaction(req.user.id, req.body);

    res.status(201).json({
      success: true,
      message: 'Transaction created successfully',
      data: {
        transaction,
      },
    });
  } catch (error) {
    if (error.statusCode) {
      res.status(error.statusCode);
    }
    next(error);
  }
};

const getTransactions = async (req, res, next) => {
  try {
    const transactions = await transactionService.getTransactions(req.user.id, req.query);

    res.status(200).json({
      success: true,
      count: transactions.length,
      data: {
        transactions,
      },
    });
  } catch (error) {
    if (error.statusCode) {
      res.status(error.statusCode);
    }
    next(error);
  }
};

const getTransactionById = async (req, res, next) => {
  try {
    const transaction = await transactionService.getTransactionById(req.user.id, req.params.id);

    res.status(200).json({
      success: true,
      data: {
        transaction,
      },
    });
  } catch (error) {
    if (error.statusCode) {
      res.status(error.statusCode);
    }
    next(error);
  }
};

const updateTransaction = async (req, res, next) => {
  try {
    const transaction = await transactionService.updateTransaction(
      req.user.id,
      req.params.id,
      req.body
    );

    res.status(200).json({
      success: true,
      message: 'Transaction updated successfully',
      data: {
        transaction,
      },
    });
  } catch (error) {
    if (error.statusCode) {
      res.status(error.statusCode);
    }
    next(error);
  }
};

const deleteTransaction = async (req, res, next) => {
  try {
    await transactionService.deleteTransaction(req.user.id, req.params.id);

    res.status(200).json({
      success: true,
      message: 'Transaction deleted successfully',
    });
  } catch (error) {
    if (error.statusCode) {
      res.status(error.statusCode);
    }
    next(error);
  }
};

module.exports = {
  createTransaction,
  getTransactions,
  getTransactionById,
  updateTransaction,
  deleteTransaction,
};
