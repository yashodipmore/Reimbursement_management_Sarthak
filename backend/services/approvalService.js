const { Approval, Expense, User, ApprovalFlow, Company } = require('../models');
const {
  sendApprovalRequest,
  sendApprovedEmail,
  sendRejectedEmail,
} = require('../utils/emailService');

// Build the ordered step list for an expense:
// If is_manager_approver is true and employee has a manager, prepend manager as step 0
const buildStepList = async (flow, employee) => {
  const steps = [...(flow.steps || [])].sort((a, b) => a.step_order - b.step_order);
  
  if (flow.is_manager_approver && employee.manager_id) {
    // Prepend manager as step 0
    steps.unshift({
      approver_id: employee.manager_id,
      step_order: 0,
      label: 'Manager Approval',
    });
  }
  return steps;
};

// Notify the approver at a given step
const notifyApprover = async (approver_id, expense, employeeName) => {
  const approver = await User.findByPk(approver_id);
  if (approver) {
    await sendApprovalRequest(approver.email, approver.name, expense, employeeName);
  }
};

const triggerApprovalFlow = async (expense) => {
  const employee = await User.findByPk(expense.user_id);

  // Use specific flow if employee chose one, else pick the first active flow for the company
  let flow;
  if (expense.flow_id) {
    flow = await ApprovalFlow.findOne({
      where: { id: expense.flow_id, company_id: expense.company_id, is_active: true },
    });
  } else {
    flow = await ApprovalFlow.findOne({
      where: { company_id: expense.company_id, is_active: true },
    });
  }

  if (!flow) {
    // If no flow is set for the company, stay PENDING (Admin can override)
    return;
  }

  const steps = await buildStepList(flow, employee);

  if (steps.length === 0) {
    // No steps in flow, stay PENDING
    return;
  }

  const firstStep = steps[0];

  await expense.update({
    flow_id: flow.id,
    current_step: firstStep.step_order,
    current_approver_id: firstStep.approver_id,
  });

  await Approval.create({
    expense_id: expense.id,
    approver_id: firstStep.approver_id,
    step_order: firstStep.step_order,
    status: 'PENDING',
  });

  await notifyApprover(firstStep.approver_id, expense, employee.name);
};

// Check conditional rules after each approval
const checkConditionalApproval = async (flow, expense, allApprovals) => {
  const type = flow.condition_type;

  if (type === 'sequential') return false; // handled by step progression

  const approved = allApprovals.filter((a) => a.status === 'APPROVED').length;
  const total = allApprovals.length;

  if (type === 'percentage') {
    const pct = flow.percentage_threshold || 100;
    return total > 0 && (approved / total) * 100 >= pct;
  }

  if (type === 'specific_approver') {
    return allApprovals.some(
      (a) => a.approver_id === flow.specific_approver_id && a.status === 'APPROVED'
    );
  }

  if (type === 'hybrid') {
    const pct = flow.percentage_threshold || 100;
    const pctMet = total > 0 && (approved / total) * 100 >= pct;
    const specificMet = allApprovals.some(
      (a) => a.approver_id === flow.specific_approver_id && a.status === 'APPROVED'
    );
    return pctMet || specificMet;
  }

  return false;
};

const processApprovalAction = async (expense, approverId, action, comment) => {
  const currentApproval = await Approval.findOne({
    where: {
      expense_id: expense.id,
      approver_id: approverId,
      step_order: expense.current_step,
      status: 'PENDING',
    },
  });

  if (!currentApproval) {
    const err = new Error('No pending approval step found for you on this expense');
    err.statusCode = 403;
    throw err;
  }

  await currentApproval.update({
    status: action,
    comment: comment || null,
    acted_at: new Date(),
  });

  const employee = await User.findByPk(expense.user_id);

  if (action === 'REJECTED') {
    await expense.update({ status: 'REJECTED' });
    if (employee) await sendRejectedEmail(employee.email, employee.name, expense, comment);
    return;
  }

  // action = APPROVED
  const flow = await ApprovalFlow.findByPk(expense.flow_id);

  // Non-sequential: check conditional rules across all approvals
  if (flow && flow.condition_type !== 'sequential') {
    const allApprovals = await Approval.findAll({ where: { expense_id: expense.id } });
    const conditionMet = await checkConditionalApproval(flow, expense, allApprovals);
    if (conditionMet) {
      await expense.update({ status: 'APPROVED', current_approver_id: null });
      if (employee) await sendApprovedEmail(employee.email, employee.name, expense);
      return;
    }
    // Condition not yet met — no action, wait for other approvers
    return;
  }

  // Sequential: advance to next step
  if (!flow) {
    await expense.update({ status: 'APPROVED' });
    if (employee) await sendApprovedEmail(employee.email, employee.name, expense);
    return;
  }

  const steps = await buildStepList(flow, employee);
  const currentIndex = steps.findIndex((s) => s.step_order === expense.current_step);
  const nextStep = steps[currentIndex + 1];

  if (nextStep) {
    await expense.update({
      current_step: nextStep.step_order,
      current_approver_id: nextStep.approver_id,
    });

    await Approval.create({
      expense_id: expense.id,
      approver_id: nextStep.approver_id,
      step_order: nextStep.step_order,
      status: 'PENDING',
    });

    await notifyApprover(nextStep.approver_id, expense, employee.name);
  } else {
    await expense.update({ status: 'APPROVED', current_approver_id: null });
    if (employee) await sendApprovedEmail(employee.email, employee.name, expense);
  }
};

module.exports = { triggerApprovalFlow, processApprovalAction };
