const { Expense, Approval, User, ApprovalFlow } = require('../models');
const { processApprovalAction } = require('../services/approvalService');

// POST /api/approvals/:expenseId/action  (admin)
const approveOrReject = async (req, res, next) => {
  try {
    const { action, comment } = req.body;
    const { expenseId } = req.params;

    if (!action || !['APPROVE', 'REJECT'].includes(action.toUpperCase())) {
      return res.status(400).json({ message: 'action must be APPROVE or REJECT' });
    }

    const expense = await Expense.findByPk(expenseId);
    if (!expense) return res.status(404).json({ message: 'Expense not found' });

    if (expense.status !== 'PENDING') {
      return res.status(400).json({ message: `Expense is already ${expense.status}` });
    }

    const requestedAction = action.toUpperCase();
    const normalizedAction = requestedAction === 'APPROVE' ? 'APPROVED' : 'REJECTED';

    await processApprovalAction(expense, req.user.id, normalizedAction, comment);

    const updated = await Expense.findByPk(expenseId);
    res.json({
      message: `Expense ${normalizedAction.toLowerCase()} successfully`,
      expense: updated,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/approvals/:expenseId/trail
const getApprovalTrail = async (req, res, next) => {
  try {
    const { expenseId } = req.params;

    const expense = await Expense.findByPk(expenseId);
    if (!expense) return res.status(404).json({ message: 'Expense not found' });

    const trail = await Approval.findAll({
      where: { expense_id: expenseId },
      include: [{ model: User, as: 'approver', attributes: ['id', 'name', 'email'] }],
      order: [['step_order', 'ASC']],
    });

    res.json({ trail });
  } catch (error) {
    next(error);
  }
};

// POST /api/approvals/flows  (admin)
// Supports: sequential, percentage, specific_approver, hybrid + is_manager_approver flag
const createFlow = async (req, res, next) => {
  try {
    const {
      name,
      steps,
      condition_type,
      is_manager_approver,
      percentage_threshold,
      specific_approver_id,
    } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'name is required' });
    }

    const stepsArray = steps || [];
    for (const step of stepsArray) {
      if (!step.approver_id || step.step_order === undefined) {
        return res.status(400).json({ message: 'Each step requires approver_id and step_order' });
      }
    }

    const validTypes = ['sequential', 'percentage', 'specific_approver', 'hybrid'];
    const flowType = condition_type && validTypes.includes(condition_type)
      ? condition_type
      : 'sequential';

    if (['percentage', 'hybrid'].includes(flowType) && !percentage_threshold) {
      return res.status(400).json({ message: 'percentage_threshold is required for percentage/hybrid flows' });
    }

    if (['specific_approver', 'hybrid'].includes(flowType) && !specific_approver_id) {
      return res.status(400).json({ message: 'specific_approver_id is required for specific_approver/hybrid flows' });
    }

    const flow = await ApprovalFlow.create({
      company_id: req.user.company_id,
      name,
      steps: stepsArray,
      condition_type: flowType,
      is_manager_approver: is_manager_approver || false,
      percentage_threshold: percentage_threshold || null,
      specific_approver_id: specific_approver_id || null,
      is_active: true,
    });

    res.status(201).json({ message: 'Approval flow created', flow });
  } catch (error) {
    next(error);
  }
};

// GET /api/approvals/flows  (admin)
const getFlows = async (req, res, next) => {
  try {
    const flows = await ApprovalFlow.findAll({
      where: { company_id: req.user.company_id },
      order: [['createdAt', 'DESC']],
    });
    res.json({ flows });
  } catch (error) {
    next(error);
  }
};

// PUT /api/approvals/flows/:id  (admin — update a flow)
const updateFlow = async (req, res, next) => {
  try {
    const flow = await ApprovalFlow.findOne({
      where: { id: req.params.id, company_id: req.user.company_id },
    });
    if (!flow) return res.status(404).json({ message: 'Flow not found' });

    const {
      name,
      steps,
      condition_type,
      is_manager_approver,
      percentage_threshold,
      specific_approver_id,
      is_active,
    } = req.body;

    await flow.update({
      name: name || flow.name,
      steps: steps || flow.steps,
      condition_type: condition_type || flow.condition_type,
      is_manager_approver: is_manager_approver !== undefined ? is_manager_approver : flow.is_manager_approver,
      percentage_threshold: percentage_threshold !== undefined ? percentage_threshold : flow.percentage_threshold,
      specific_approver_id: specific_approver_id !== undefined ? specific_approver_id : flow.specific_approver_id,
      is_active: is_active !== undefined ? is_active : flow.is_active,
    });

    res.json({ message: 'Flow updated', flow });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/approvals/flows/:id  (admin — soft delete / deactivate)
const deleteFlow = async (req, res, next) => {
  try {
    const flow = await ApprovalFlow.findOne({
      where: { id: req.params.id, company_id: req.user.company_id },
    });
    if (!flow) return res.status(404).json({ message: 'Flow not found' });

    // Check if any PENDING expenses are still using this flow
    const activeExpenses = await Expense.count({
      where: { flow_id: flow.id, status: 'PENDING' },
    });

    if (activeExpenses > 0) {
      return res.status(400).json({
        message: `Cannot delete flow — ${activeExpenses} pending expense(s) are still using it. Deactivate it instead (set is_active: false).`,
      });
    }

    await flow.destroy();
    res.json({ message: 'Approval flow deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// POST /api/approvals/override/:id  (admin — force approve)
const overrideApproval = async (req, res, next) => {
  try {
    const expense = await Expense.findOne({
      where: { id: req.params.id, company_id: req.user.company_id },
    });
    if (!expense) return res.status(404).json({ message: 'Expense not found' });

    await expense.update({ status: 'APPROVED', current_approver_id: null });

    await Approval.create({
      expense_id: expense.id,
      approver_id: req.user.id,
      step_order: 0,
      status: 'APPROVED',
      comment: 'Admin override — force approved',
      acted_at: new Date(),
    });

    res.json({ message: 'Expense force-approved by admin', expense });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  approveOrReject,
  getApprovalTrail,
  createFlow,
  getFlows,
  updateFlow,
  deleteFlow,
  overrideApproval,
};
