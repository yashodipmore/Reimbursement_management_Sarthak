const express = require('express');
const router = express.Router();
const { getRates, convertAmount } = require('../services/currencyService');
const authMiddleware = require('../middleware/authMiddleware');

// GET /api/currency/rates/:base
router.get('/rates/:base', authMiddleware, async (req, res, next) => {
  try {
    const rates = await getRates(req.params.base);
    res.json({ base: req.params.base.toUpperCase(), rates });
  } catch (error) {
    next(error);
  }
});

// GET /api/currency/convert?from=USD&to=INR&amount=100
router.get('/convert', authMiddleware, async (req, res, next) => {
  try {
    const { from, to, amount } = req.query;
    if (!from || !to || !amount) {
      return res.status(400).json({ message: 'from, to, and amount are required' });
    }
    const converted = await convertAmount(parseFloat(amount), from, to);
    res.json({ from: from.toUpperCase(), to: to.toUpperCase(), amount: parseFloat(amount), converted });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
