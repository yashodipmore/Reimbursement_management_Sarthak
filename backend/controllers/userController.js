const bcrypt = require('bcryptjs');
const { User, Company } = require('../models');
const { sendWelcomeEmail } = require('../utils/emailService');

// GET /api/users  (admin — all users in company)
const listUsers = async (req, res, next) => {
  try {
    const users = await User.findAll({
      where: { company_id: req.user.company_id },
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'ASC']],
    });
    res.json({ users });
  } catch (error) {
    next(error);
  }
};

// POST /api/users  (admin — create employee or manager)
const createUser = async (req, res, next) => {
  try {
    const { name, email, password, role, manager_id } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'name, email, and password are required' });
    }

    const allowedRoles = ['manager', 'employee'];
    const assignedRole = (role && allowedRoles.includes(role)) ? role : 'employee';

    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      company_id: req.user.company_id,
      name,
      email,
      password: hashedPassword,
      role: assignedRole,
      manager_id: manager_id || null,
    });

    // Fetch manager email if assigned
    let managerEmail = null;
    if (manager_id) {
      const manager = await User.findByPk(manager_id);
      if (manager) managerEmail = manager.email;
    }

    sendWelcomeEmail(email, name, managerEmail).catch(() => { });

    const { password: _p, ...safeUser } = user.dataValues;
    res.status(201).json({ message: 'User created successfully', user: safeUser });
  } catch (error) {
    next(error);
  }
};

// GET /api/users/:id  (admin)
const getUserById = async (req, res, next) => {
  try {
    const user = await User.findOne({
      where: { id: req.params.id, company_id: req.user.company_id },
      attributes: { exclude: ['password'] },
    });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ user });
  } catch (error) {
    next(error);
  }
};

// PUT /api/users/:id  (admin — update name, role, manager_id, is_active)
const updateUser = async (req, res, next) => {
  try {
    const user = await User.findOne({
      where: { id: req.params.id, company_id: req.user.company_id },
    });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const { name, role, manager_id, is_active } = req.body;

    const allowedRoles = ['manager', 'employee'];
    if (role && !allowedRoles.includes(role)) {
      return res.status(400).json({ message: 'Role must be manager or employee' });
    }

    await user.update({
      name: name || user.name,
      role: role || user.role,
      manager_id: manager_id !== undefined ? manager_id : user.manager_id,
      is_active: is_active !== undefined ? is_active : user.is_active,
    });

    const { password: _p, ...safeUser } = user.dataValues;
    res.json({ message: 'User updated', user: safeUser });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/users/:id  (admin — soft delete: sets is_active = false)
const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findOne({
      where: { id: req.params.id, company_id: req.user.company_id },
    });
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Prevent admin from deactivating themselves
    if (user.id === req.user.id) {
      return res.status(400).json({ message: 'You cannot deactivate your own account' });
    }

    // Prevent deleting another admin
    if (user.role === 'admin') {
      return res.status(400).json({ message: 'Admin accounts cannot be deleted' });
    }

    await user.update({ is_active: false });
    res.json({ message: 'User deactivated successfully', userId: user.id });
  } catch (error) {
    next(error);
  }
};

// GET /api/users/me/team  (manager or admin)
const getMyTeam = async (req, res, next) => {
  try {
    const team = await User.findAll({
      where: {
        manager_id: req.user.id,
        is_active: true,
      },
      attributes: { exclude: ['password'] },
      order: [['name', 'ASC']],
    });
    res.json({ team });
  } catch (error) {
    next(error);
  }
};

module.exports = { listUsers, createUser, getUserById, updateUser, deleteUser, getMyTeam };
