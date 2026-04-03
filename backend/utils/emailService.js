const nodemailer = require('nodemailer');

const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });
};

const sendWelcomeEmail = async (email, name, managerEmail) => {
  try {
    const transporter = createTransporter();
    
    let managerSection = '';
    if (managerEmail) {
      managerSection = `
        <p>Your account has been assigned to a manager. For your login credentials and initial setup, please contact your manager at:</p>
        <p><strong>Email:</strong> <a href="mailto:${managerEmail}">${managerEmail}</a></p>
      `;
    } else {
      managerSection = `
        <p>Please contact your administrator for your login credentials.</p>
      `;
    }

    await transporter.sendMail({
      from: process.env.MAIL_FROM,
      to: email,
      subject: 'Welcome to Expense Management System',
      html: `
        <h2>Welcome, ${name}!</h2>
        <p>Your account has been created successfully.</p>
        ${managerSection}
        <p>You can now log in to the Expense Management System using the provided credentials.</p>
        <br />
        <p>Best regards,<br/>Expense Management Team</p>
      `,
    });
    console.log(`Welcome email sent to ${email}`);
  } catch (error) {
    console.error('Failed to send welcome email:', error.message);
  }
};

const sendApprovalRequest = async (email, approverName, expense, employeeName) => {
  try {
    const transporter = createTransporter();
    await transporter.sendMail({
      from: process.env.MAIL_FROM,
      to: email,
      subject: `Expense Approval Required: ${expense.title}`,
      html: `
        <h2>Expense Approval Required</h2>
        <p>Hello ${approverName},</p>
        <p><strong>${employeeName}</strong> has submitted an expense that requires your approval.</p>
        <table style="border-collapse: collapse; width: 100%;">
          <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Title</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${expense.title}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Amount</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${expense.amount} ${expense.currency}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Category</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${expense.category}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Date</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${expense.date}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Description</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${expense.description || 'N/A'}</td></tr>
        </table>
        <p>Please log in to review and take action on this expense.</p>
        <br />
        <p>Best regards,<br/>Expense Management System</p>
      `,
    });
    console.log(`Approval request email sent to ${email}`);
  } catch (error) {
    console.error('Failed to send approval request email:', error.message);
  }
};

const sendApprovedEmail = async (email, employeeName, expense) => {
  try {
    const transporter = createTransporter();
    await transporter.sendMail({
      from: process.env.MAIL_FROM,
      to: email,
      subject: `Expense Approved: ${expense.title}`,
      html: `
        <h2>Your Expense Has Been Approved</h2>
        <p>Hello ${employeeName},</p>
        <p>Great news! Your expense claim has been fully approved.</p>
        <table style="border-collapse: collapse; width: 100%;">
          <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Title</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${expense.title}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Amount</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${expense.amount} ${expense.currency}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Status</strong></td><td style="padding: 8px; border: 1px solid #ddd; color: green;"><strong>APPROVED</strong></td></tr>
        </table>
        <p>You will receive your reimbursement shortly.</p>
        <br />
        <p>Best regards,<br/>Expense Management Team</p>
      `,
    });
    console.log(`Approved email sent to ${email}`);
  } catch (error) {
    console.error('Failed to send approved email:', error.message);
  }
};

const sendRejectedEmail = async (email, employeeName, expense, comment) => {
  try {
    const transporter = createTransporter();
    await transporter.sendMail({
      from: process.env.MAIL_FROM,
      to: email,
      subject: `Expense Rejected: ${expense.title}`,
      html: `
        <h2>Your Expense Has Been Rejected</h2>
        <p>Hello ${employeeName},</p>
        <p>Unfortunately, your expense claim has been rejected.</p>
        <table style="border-collapse: collapse; width: 100%;">
          <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Title</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${expense.title}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Amount</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${expense.amount} ${expense.currency}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Status</strong></td><td style="padding: 8px; border: 1px solid #ddd; color: red;"><strong>REJECTED</strong></td></tr>
          <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Reason</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${comment || 'No reason provided'}</td></tr>
        </table>
        <p>Please contact your manager for more information.</p>
        <br />
        <p>Best regards,<br/>Expense Management Team</p>
      `,
    });
    console.log(`Rejection email sent to ${email}`);
  } catch (error) {
    console.error('Failed to send rejection email:', error.message);
  }
};

module.exports = {
  sendWelcomeEmail,
  sendApprovalRequest,
  sendApprovedEmail,
  sendRejectedEmail,
};
