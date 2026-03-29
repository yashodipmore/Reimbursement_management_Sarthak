const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Approval = sequelize.define('Approval', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  expense_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  approver_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  step_order: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('PENDING', 'APPROVED', 'REJECTED'),
    defaultValue: 'PENDING',
  },
  comment: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  acted_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  tableName: 'approvals',
  timestamps: true,
});

module.exports = Approval;
