const dashboardService = require('../services/dashboardService');

/**
 * Handle GET /api/dashboard request.
 */
const getDashboard = async (req, res, next) => {
  try {
    const now = new Date();
    const currentMonth = now.getUTCMonth() + 1;
    const currentYear = now.getUTCFullYear();

    const month = req.query.month !== undefined ? parseInt(req.query.month, 10) : currentMonth;
    const year = req.query.year !== undefined ? parseInt(req.query.year, 10) : currentYear;

    const dashboardData = await dashboardService.getDashboardData(req.user.id, { month, year });

    res.status(200).json({
      success: true,
      data: dashboardData,
    });
  } catch (error) {
    if (error.statusCode) {
      res.status(error.statusCode);
    }
    next(error);
  }
};

module.exports = {
  getDashboard,
};
