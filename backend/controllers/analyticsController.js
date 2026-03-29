const { Expense, User } = require('../models');
const { Op, fn, col } = require('sequelize');
const { generateSpendingForecast } = require('../services/aiService');

// Helper to aggregate data
const getAggregateData = async (whereClause) => {
  const stats = await Expense.findAll({
    where: whereClause,
    attributes: [
      [fn('COUNT', col('id')), 'total_count'],
      [fn('SUM', col('amount_in_company_currency')), 'total_amount'],
      [fn('AVG', col('amount_in_company_currency')), 'avg_amount'],
    ],
    raw: true,
  });

  const byStatus = await Expense.findAll({
    where: whereClause,
    attributes: [
      'status',
      [fn('COUNT', col('id')), 'count'],
      [fn('SUM', col('amount_in_company_currency')), 'amount'],
    ],
    group: ['status'],
    raw: true,
  });

  const byCategory = await Expense.findAll({
    where: whereClause,
    attributes: [
      'category',
      [fn('COUNT', col('id')), 'count'],
      [fn('SUM', col('amount_in_company_currency')), 'amount'],
    ],
    group: ['category'],
    raw: true,
  });

  const summary = stats[0] || {};
  return {
    summary: {
      total_count: Number(summary.total_count) || 0,
      total_amount: Number(summary.total_amount) || 0,
      avg_amount: Number(summary.avg_amount) || 0,
    },
    by_status: byStatus.map(s => ({ ...s, count: Number(s.count) || 0, amount: Number(s.amount) || 0 })),
    by_category: byCategory.map(c => ({ ...c, count: Number(c.count) || 0, amount: Number(c.amount) || 0 })),
  };
};

// GET /api/analytics/company (Admin)
const getCompanyAnalytics = async (req, res, next) => {
  try {
    const data = await getAggregateData({ company_id: req.user.company_id });
    
    // Add AI Forecast for Admin
    const forecast = await generateSpendingForecast(req.user.company_id);
    data.ai_forecast = forecast;

    // ADDED: Fetch last 6 months history for graphs
    const history = await Expense.findAll({
      where: { company_id: req.user.company_id, status: 'APPROVED' },
      attributes: [
        [fn('DATE_FORMAT', col('date'), '%Y-%m'), 'month'],
        [fn('SUM', col('amount_in_company_currency')), 'total']
      ],
      group: ['month'],
      order: [[col('month'), 'ASC']],
      limit: 6,
      raw: true
    });
    data.history = history;

    res.json(data);
  } catch (error) {
    next(error);
  }
};

// GET /api/analytics/manager/:managerId (Admin)
const getManagerTeamAnalytics = async (req, res, next) => {
  try {
    const managerId = req.params.managerId;
    
    // Find all employees under this manager
    const team = await User.findAll({
      where: { manager_id: managerId },
      attributes: ['id'],
    });
    
    const teamIds = team.map(u => u.id);
    if (teamIds.length === 0) {
      return res.json({ message: 'No team members found for this manager', summary: { total_count: 0, total_amount: 0 } });
    }

    const data = await getAggregateData({ user_id: { [Op.in]: teamIds } });
    res.json(data);
  } catch (error) {
    next(error);
  }
};

// GET /api/analytics/employee/:employeeId (Admin)
const getEmployeeAnalytics = async (req, res, next) => {
  try {
    const data = await getAggregateData({ 
        user_id: req.params.employeeId,
        company_id: req.user.company_id 
    });
    res.json(data);
  } catch (error) {
    next(error);
  }
};

// GET /api/analytics/my-team (Manager)
const getMyTeamAnalytics = async (req, res, next) => {
  try {
    const team = await User.findAll({
      where: { manager_id: req.user.id },
      attributes: ['id'],
    });

    const teamIds = team.map(u => u.id);
    if (teamIds.length === 0) {
      return res.json({ message: 'No team members assigned and no stats.', summary: { total_count: 0, total_amount: 0 } });
    }

    const data = await getAggregateData({ user_id: { [Op.in]: teamIds } });
    res.json(data);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCompanyAnalytics,
  getManagerTeamAnalytics,
  getEmployeeAnalytics,
  getMyTeamAnalytics,
};
