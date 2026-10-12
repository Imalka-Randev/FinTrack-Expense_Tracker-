const express = require('express');
const router = express.Router();
const { getDashboard } = require('../controllers/dashboardController');
const { protect } = require('../middleware/authMiddleware');
const { validateDashboardQuery } = require('../validators/dashboardValidator');

// Protect all dashboard routes with JWT authentication
router.use(protect);

router.get('/', validateDashboardQuery, getDashboard);

module.exports = router;
