const { Sequelize } = require('sequelize');
require('dotenv').config();

if (!process.env.MYSQL_URL) {
  throw new Error('MYSQL_URL environment variable is not set');
}

const sequelize = new Sequelize(process.env.MYSQL_URL, {
  dialect: 'mysql',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
  dialectOptions: {
    connectTimeout: 60000,
    enableKeepAlive: true,
    keepAliveInitialDelay: 10000,
  },
});

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('MySQL connected via Sequelize');
    // await sequelize.sync({ alter: false }); 
    console.log('Database connected');
  } catch (error) {
    console.error('Database connection failed:', error.message);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };
