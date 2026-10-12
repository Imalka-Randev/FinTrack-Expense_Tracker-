/**
 * Validation middleware for GET /api/dashboard query parameters.
 */
const validateDashboardQuery = (req, res, next) => {
  const { month, year } = req.query;

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

  next();
};

module.exports = {
  validateDashboardQuery,
};
