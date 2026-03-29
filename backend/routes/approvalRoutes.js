const express = require('express');
const router = express.Router();
const {
  approveOrReject,
  getApprovalTrail,
  createFlow,
  getFlows,
  updateFlow,
  deleteFlow,
  overrideApproval,
} = require('../controllers/approvalController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// Flows (admin only) — static routes before param routes
router.post('/flows', authMiddleware, roleMiddleware('admin'), createFlow);
router.get('/flows', authMiddleware, roleMiddleware('admin'), getFlows);
router.put('/flows/:id', authMiddleware, roleMiddleware('admin'), updateFlow);
router.delete('/flows/:id', authMiddleware, roleMiddleware('admin'), deleteFlow);

// Admin override
router.post('/override/:id', authMiddleware, roleMiddleware('admin'), overrideApproval);

// Approval action and trail
router.post('/:expenseId/action', authMiddleware, roleMiddleware('manager', 'admin'), approveOrReject);
router.get('/:expenseId/trail', authMiddleware, getApprovalTrail);

module.exports = router;
