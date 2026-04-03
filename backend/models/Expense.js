const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Expense = sequelize.define('Expense', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  company_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  amount: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    comment: 'Amount in submitted currency',
  },
  currency: {
    type: DataTypes.STRING(10),
    allowNull: false,
    comment: 'Currency submitted by employee',
  },
  amount_in_company_currency: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: true,
    comment: 'Amount converted to company default currency',
  },
  company_currency: {
    type: DataTypes.STRING(10),
    allowNull: true,
    comment: 'Company default currency at time of submission',
  },
  category: {
    type: DataTypes.ENUM('travel', 'food', 'accommodation', 'equipment', 'other'),
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  receipt_url: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('PENDING', 'APPROVED', 'REJECTED'),
    defaultValue: 'PENDING',
  },
  current_approver_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  flow_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  current_step: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
  },
  is_flagged: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Flagged by AI for potential fraud or anomaly',
  },
  ai_analysis: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Results from AI analysis (fraud score, duplicate checks, etc.)',
  },
}, {
  tableName: 'expenses',
  timestamps: true,
});

module.exports = Expense;
