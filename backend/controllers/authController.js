const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, Company } = require('../models');

const COUNTRY_CURRENCY_OPTIONS = [
  { country: 'India', currency: 'INR' },
  { country: 'United States', currency: 'USD' },
  { country: 'United Kingdom', currency: 'GBP' },
  { country: 'Germany', currency: 'EUR' },
  { country: 'Canada', currency: 'CAD' },
  { country: 'Australia', currency: 'AUD' },
  { country: 'Japan', currency: 'JPY' },
  { country: 'United Arab Emirates', currency: 'AED' },
];

const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, role: user.role, email: user.email, company_id: user.company_id },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

const formatUser = (user, company) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  company_id: user.company_id,
  manager_id: user.manager_id,
  company_name: company ? company.name : null,
  company_currency: company ? company.currency : null,
  country: company ? company.country : null,
});

// POST /api/auth/register
// First signup: auto-creates Company + Admin user
const register = async (req, res, next) => {
  try {
    const { companyName, name, email, password, country, currency } = req.body;

    if (!companyName || !name || !email || !password || !country || !currency) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    const company = await Company.create({ name: companyName, country, currency });
    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      company_id: company.id,
      name,
      email,
      password: hashedPassword,
      role: 'admin',
    });

    const token = generateToken(user);
    res.status(201).json({
      message: 'Company and admin account created successfully',
      token,
      user: formatUser(user, company),
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({
      where: { email },
      include: [{ model: Company, as: 'company' }],
    });

    if (!user || !user.is_active) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user);
    res.json({ message: 'Login successful', token, user: formatUser(user, user.company) });
  } catch (error) {
    next(error);
  }
};

// GET /api/auth/me
const getMe = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id, {
      include: [{ model: Company, as: 'company' }],
      attributes: { exclude: ['password'] },
    });
    res.json({ user: formatUser(user, user.company) });
  } catch (error) {
    next(error);
  }
};

// GET /api/auth/countries
const listCountries = async (req, res, next) => {
  try {
    res.json({ countries: COUNTRY_CURRENCY_OPTIONS });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, getMe, listCountries };
