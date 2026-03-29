const { Op } = require('sequelize');
const { Expense, User, Approval, Company, ApprovalFlow } = require('../models');
const { triggerApprovalFlow } = require('../services/approvalService');
const { convertAmount } = require('../services/currencyService');
const { analyzeExpenseFraud, extractReceiptData } = require('../services/aiService');
const fs = require('fs');
const path = require('path');

// POST /api/expenses
const submitExpense = async (req, res, next) => {
  try {
    const { title, amount, currency, category, description, date, flow_id } = req.body;

    if (!title || !amount || !currency || !category || !date) {
      return res.status(400).json({ message: 'title, amount, currency, category, and date are required' });
    }

    // Get company currency for conversion
    const company = await Company.findByPk(req.user.company_id);
    if (!company) return res.status(404).json({ message: 'Company not found' });

    let amount_in_company_currency = null;
    try {
      amount_in_company_currency = await convertAmount(amount, currency, company.currency || 'USD');
    } catch (e) {
      console.warn('Currency conversion failed:', e.message);
    }

    const expense = await Expense.create({
      user_id: req.user.id,
      company_id: req.user.company_id,
      title,
      amount,
      currency,
      amount_in_company_currency,
      company_currency: company.currency,
      category,
      description: description || null,
      date,
      status: 'PENDING',
      flow_id: flow_id || null,
    });

    // Trigger AI Analysis in background
    analyzeExpenseFraud(expense).catch((err) =>
      console.error('AI analysis error:', err.message)
    );

    triggerApprovalFlow(expense).catch((err) =>
      console.error('Approval flow error:', err.message)
    );

    res.status(201).json({ message: 'Expense submitted successfully', expense });
  } catch (error) {
    next(error);
  }
};

// GET /api/expenses/mine
const getMyExpenses = async (req, res, next) => {
  try {
    const expenses = await Expense.findAll({
      where: { user_id: req.user.id },
      include: [{
        model: Approval,
        as: 'approvals',
        include: [{ model: User, as: 'approver', attributes: ['id', 'name', 'email'] }],
      }],
      order: [['createdAt', 'DESC']],
    });
    res.json({ expenses });
  } catch (error) {
    next(error);
  }
};

// GET /api/expenses/pending  — expenses waiting for the logged-in user's approval
const getPendingForMe = async (req, res, next) => {
  try {
    const pendingApprovals = await Approval.findAll({
      where: { approver_id: req.user.id, status: 'PENDING' },
      attributes: ['expense_id'],
    });

    const expenseIds = pendingApprovals.map((a) => a.expense_id);
    if (expenseIds.length === 0) return res.json({ expenses: [] });

    const expenses = await Expense.findAll({
      where: { id: { [Op.in]: expenseIds }, status: 'PENDING' },
      include: [{ model: User, as: 'submitter', attributes: ['id', 'name', 'email'] }],
      order: [['createdAt', 'ASC']],
    });

    res.json({ expenses });
  } catch (error) {
    next(error);
  }
};

// GET /api/expenses/team — expenses submitted by the logged-in user's team members
const getTeamExpenses = async (req, res, next) => {
  try {
    const team = await User.findAll({
      where: { manager_id: req.user.id },
      attributes: ['id'],
    });

    const teamIds = team.map((u) => u.id);
    if (teamIds.length === 0) return res.json({ expenses: [] });

    const expenses = await Expense.findAll({
      where: { user_id: { [Op.in]: teamIds } },
      include: [
        { model: User, as: 'submitter', attributes: ['id', 'name', 'email', 'role'] },
        {
          model: Approval,
          as: 'approvals',
          include: [{ model: User, as: 'approver', attributes: ['id', 'name', 'email'] }],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    res.json({ expenses });
  } catch (error) {
    next(error);
  }
};


// GET /api/expenses/all  (admin)
const getAllExpenses = async (req, res, next) => {
  try {
    const expenses = await Expense.findAll({
      where: { company_id: req.user.company_id },
      include: [
        { model: User, as: 'submitter', attributes: ['id', 'name', 'email', 'role'] },
        {
          model: Approval,
          as: 'approvals',
          include: [{ model: User, as: 'approver', attributes: ['id', 'name', 'email'] }],
        },
      ],
      order: [['createdAt', 'DESC']],
    });
    res.json({ expenses });
  } catch (error) {
    next(error);
  }
};

// GET /api/expenses/:id
const getExpenseById = async (req, res, next) => {
  try {
    const expense = await Expense.findByPk(req.params.id, {
      include: [
        { model: User, as: 'submitter', attributes: ['id', 'name', 'email', 'role'] },
        {
          model: Approval,
          as: 'approvals',
          include: [{ model: User, as: 'approver', attributes: ['id', 'name', 'email'] }],
          order: [['step_order', 'ASC']],
        },
      ],
    });

    if (!expense) return res.status(404).json({ message: 'Expense not found' });

    if (req.user.role === 'employee' && expense.user_id !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (req.user.role === 'manager') {
      const isSubordinate = await User.findOne({
        where: { id: expense.user_id, manager_id: req.user.id },
      });
      if (!isSubordinate && expense.user_id !== req.user.id && expense.current_approver_id !== req.user.id) {
        return res.status(403).json({ message: 'Access denied: not your team member' });
      }
    }

    res.json({ expense });
  } catch (error) {
    next(error);
  }
};

// POST /api/expenses/scan (Employee)
const scanReceipt = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No receipt file provided.' });
    }

    const receiptData = await extractReceiptData(req.file.path, req.file.mimetype);
    
    if (!receiptData) {
      return res.status(422).json({ message: 'AI could not extract data from this image. Please enter details manually.' });
    }

    // Include the original file path for future submission
    receiptData.temp_receipt_url = req.file.path;

    res.json({ 
      message: 'Receipt scanned successfully!', 
      extracted_data: receiptData 
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  submitExpense,
  getMyExpenses,
  getPendingForMe,
  getTeamExpenses,
  getAllExpenses,
  getExpenseById,
  scanReceipt,
};
