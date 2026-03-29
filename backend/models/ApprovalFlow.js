const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ApprovalFlow = sequelize.define('ApprovalFlow', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  company_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  is_manager_approver: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'If true, employee manager is auto-inserted as step 1',
  },
  steps: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: [],
    comment: 'Array of { approver_id, step_order, label }',
  },
  condition_type: {
    type: DataTypes.ENUM('sequential', 'percentage', 'specific_approver', 'hybrid'),
    defaultValue: 'sequential',
  },
  percentage_threshold: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'e.g. 60 means 60% must approve',
  },
  specific_approver_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'If this user approves, expense is auto-approved',
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  tableName: 'approval_flows',
  timestamps: true,
});

module.exports = ApprovalFlow;
