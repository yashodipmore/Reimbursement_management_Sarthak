const express = require('express');
const router = express.Router();
const {
  getCompanyAnalytics,
  getManagerTeamAnalytics,
  getEmployeeAnalytics,
  getMyTeamAnalytics,
} = require('../controllers/analyticsController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// Group Admin-only routes
router.get('/company', authMiddleware, roleMiddleware('admin'), getCompanyAnalytics);
router.get('/manager/:managerId', authMiddleware, roleMiddleware('admin'), getManagerTeamAnalytics);
router.get('/employee/:employeeId', authMiddleware, roleMiddleware('admin'), getEmployeeAnalytics);

// Manager route (also Admin can access)
router.get('/my-team', authMiddleware, roleMiddleware('manager', 'admin'), getMyTeamAnalytics);

module.exports = router;
