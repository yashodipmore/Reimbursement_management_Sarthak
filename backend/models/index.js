const Company = require('./Company');
const User = require('./User');
const Expense = require('./Expense');
const Approval = require('./Approval');
const ApprovalFlow = require('./ApprovalFlow');

// Company -> Users
Company.hasMany(User, { foreignKey: 'company_id', as: 'users' });
User.belongsTo(Company, { foreignKey: 'company_id', as: 'company' });

// User -> Manager self-reference
User.belongsTo(User, { as: 'manager', foreignKey: 'manager_id' });
User.hasMany(User, { as: 'team', foreignKey: 'manager_id' });


// Company -> Expenses
Company.hasMany(Expense, { foreignKey: 'company_id', as: 'expenses' });
Expense.belongsTo(Company, { foreignKey: 'company_id', as: 'company' });

// User -> Expenses
User.hasMany(Expense, { foreignKey: 'user_id', as: 'expenses' });
Expense.belongsTo(User, { foreignKey: 'user_id', as: 'submitter' });

// Expense -> Approvals
Expense.hasMany(Approval, { foreignKey: 'expense_id', as: 'approvals' });
Approval.belongsTo(Expense, { foreignKey: 'expense_id', as: 'expense' });

// User -> Approvals (approver)
User.hasMany(Approval, { foreignKey: 'approver_id', as: 'approvalActions' });
Approval.belongsTo(User, { foreignKey: 'approver_id', as: 'approver' });

// Company -> ApprovalFlows
Company.hasMany(ApprovalFlow, { foreignKey: 'company_id', as: 'flows' });
ApprovalFlow.belongsTo(Company, { foreignKey: 'company_id', as: 'company' });

// ApprovalFlow -> Expenses
ApprovalFlow.hasMany(Expense, { foreignKey: 'flow_id', as: 'expenses' });
Expense.belongsTo(ApprovalFlow, { foreignKey: 'flow_id', as: 'flow' });

module.exports = { Company, User, Expense, Approval, ApprovalFlow };
