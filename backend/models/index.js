const Company = require('./Company');
const User = require('./User');

// Company -> Users
Company.hasMany(User, { foreignKey: 'company_id', as: 'users' });
User.belongsTo(Company, { foreignKey: 'company_id', as: 'company' });

// User self-ref: manager
User.hasMany(User, { foreignKey: 'manager_id', as: 'subordinates' });
User.belongsTo(User, { foreignKey: 'manager_id', as: 'manager' });

module.exports = { Company, User };
