const mongoose = require('mongoose');
const Transaction = require('../models/Transaction');

/**
 * Retrieve aggregated financial summary, expense breakdown,
 * income vs expense time-series, and recent transactions for the dashboard.
 *
 * @param {string} userId - Authenticated user's ID
 * @param {Object} options - { month: number (1-12), year: number }
 * @returns {Promise<Object>}
 */
const getDashboardData = async (userId, { month, year }) => {
  const userObjectId = new mongoose.Types.ObjectId(userId);

  // Month date range in UTC
  const startDate = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0));
  const endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));

  const monthMatch = {
    userId: userObjectId,
    date: { $gte: startDate, $lte: endDate },
  };

  // 1. Financial Summary: Total Income & Total Expenses
  const summaryAgg = await Transaction.aggregate([
    { $match: monthMatch },
    {
      $group: {
        _id: '$type',
        total: { $sum: '$amount' },
      },
    },
  ]);

  let totalIncome = 0;
  let totalExpenses = 0;

  summaryAgg.forEach((item) => {
    if (item._id === 'income') {
      totalIncome = Math.round(item.total * 100) / 100;
    } else if (item._id === 'expense') {
      totalExpenses = Math.round(item.total * 100) / 100;
    }
  });

  const balance = Math.round((totalIncome - totalExpenses) * 100) / 100;

  // 2. Expense Breakdown by Category
  const expenseAgg = await Transaction.aggregate([
    {
      $match: {
        userId: userObjectId,
        type: 'expense',
        date: { $gte: startDate, $lte: endDate },
      },
    },
    {
      $group: {
        _id: '$category',
        amount: { $sum: '$amount' },
      },
    },
    {
      $sort: { amount: -1 },
    },
  ]);

  const expenseBreakdown = expenseAgg.map((item) => {
    const amount = Math.round(item.amount * 100) / 100;
    const percentage =
      totalExpenses > 0
        ? Math.round((amount / totalExpenses) * 10000) / 100
        : 0;

    return {
      category: item._id,
      amount,
      percentage,
    };
  });

  // 3. Income vs. Expenses Time-Series (grouped by day)
  const timeSeriesAgg = await Transaction.aggregate([
    { $match: monthMatch },
    {
      $group: {
        _id: {
          dateStr: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
          type: '$type',
        },
        total: { $sum: '$amount' },
      },
    },
    {
      $sort: { '_id.dateStr': 1 },
    },
  ]);

  const timeSeriesMap = new Map();
  timeSeriesAgg.forEach((item) => {
    const dateStr = item._id.dateStr;
    if (!timeSeriesMap.has(dateStr)) {
      timeSeriesMap.set(dateStr, { date: dateStr, income: 0, expense: 0 });
    }
    const entry = timeSeriesMap.get(dateStr);
    const rounded = Math.round(item.total * 100) / 100;
    if (item._id.type === 'income') {
      entry.income = Math.round((entry.income + rounded) * 100) / 100;
    } else if (item._id.type === 'expense') {
      entry.expense = Math.round((entry.expense + rounded) * 100) / 100;
    }
  });

  const incomeVsExpenses = Array.from(timeSeriesMap.values()).sort((a, b) =>
    a.date.localeCompare(b.date)
  );

  // 4. Latest 5 Transactions for the Authenticated User
  const recentTransactions = await Transaction.find({ userId: userObjectId })
    .sort({ date: -1, createdAt: -1 })
    .limit(5)
    .select('_id type amount category description date createdAt');

  return {
    month,
    year,
    summary: {
      totalIncome,
      totalExpenses,
      balance,
    },
    expenseBreakdown,
    incomeVsExpenses,
    recentTransactions,
  };
};

module.exports = {
  getDashboardData,
};
