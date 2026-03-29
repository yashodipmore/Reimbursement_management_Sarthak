const express = require('express');
const router = express.Router();
const {
  submitExpense,
  getMyExpenses,
  getPendingForMe,
  getTeamExpenses,
  getAllExpenses,
  getExpenseById,
} = require('../controllers/expenseController');
const { scanReceipt } = require('../controllers/ocrController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Static paths first (before /:id)
router.get('/all', authMiddleware, roleMiddleware('admin'), getAllExpenses);
router.get('/mine', authMiddleware, getMyExpenses);
router.get('/team', authMiddleware, roleMiddleware('manager', 'admin'), getTeamExpenses);
router.get('/pending', authMiddleware, roleMiddleware('manager', 'admin'), getPendingForMe);

// OCR — scan a receipt image and return pre-filled expense fields
// multipart/form-data, field name: "receipt"
router.post('/ocr', authMiddleware, upload.single('receipt'), scanReceipt);

router.post('/', authMiddleware, submitExpense);
router.get('/:id', authMiddleware, getExpenseById);

module.exports = router;
