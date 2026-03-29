# Reimbursement Management System

Comprehensive project analysis and technical README for Team Sarthak.

## Team

- Jaykumar Girase
- Yashodip More
- Tejas Patil
- Komal Kumavat

## Project Summary

This project is a full-stack reimbursement workflow system for companies. It supports employee expense submission, manager or admin approvals, configurable approval flows, OCR-based receipt parsing, currency conversion, and role-based dashboards.

The repository is split into:

- backend: Node.js + Express + Sequelize + MySQL
- frontend: React + Vite + Zustand + React Router

## Core Functional Modules

## 1. Authentication and Access Control

Backend modules:

- JWT token generation and verification
- Login and registration endpoints
- Role-based route guards for admin, manager, employee
- User activity checks (inactive users are blocked)

Frontend modules:

- Login and registration pages
- Protected route component
- Persisted auth state in Zustand
- Axios request interceptor for bearer token
- Axios response interceptor for auto-logout on 401

## 2. Company and User Management

- First registration creates company + admin user
- Admin can create manager and employee users
- Admin can update user role, manager mapping, active status
- Soft-deactivation is used instead of hard-delete for users

## 3. Expense Lifecycle Management

- Employee submits an expense with amount, currency, date, category, and description
- Expense is stored with both submitted currency and converted company currency
- Expense status transitions: PENDING -> APPROVED or REJECTED
- Employees can view their own expenses
- Managers can view pending approvals for themselves and team expenses
- Admin can view all company expenses

## 4. Approval Workflow Engine

Approval flow supports multiple modes:

- sequential: step-by-step ordered approvers
- percentage: approved when threshold percent of configured approvals is met
- specific_approver: approved when a target approver approves
- hybrid: approved if percentage rule OR specific approver rule is met

Additional features:

- Optional manager-first approval insertion
- Admin override to force approve an expense
- Approval trail endpoint for full history

## 5. OCR Receipt Parsing

- Receipt image upload via multipart/form-data
- Multer stores file temporarily in OS temp folder
- OCR service sends image to Anthropic Vision model
- JSON fields are extracted and returned to prefill expense form
- Temp files are removed after processing

## 6. Currency and Country Services

- Currency conversion using ExchangeRate API
- Country and currency list from Rest Countries API
- Conversion is attempted during expense submission to store normalized company amount

## 7. Email Notification Module

Automated emails using Nodemailer:

- Welcome email on user creation
- Approval request email to approver
- Approved email to submitter
- Rejected email to submitter with reason

## Technology Stack

## Backend

Runtime and framework:

- Node.js
- Express 4

Database and ORM:

- MySQL
- Sequelize 6
- mysql2 driver

Auth and security:

- jsonwebtoken
- bcryptjs

File and communication:

- multer
- nodemailer

Utility:

- dotenv
- cors

## Frontend

Core:

- React 19
- Vite 8
- React Router DOM 7

State and forms:

- Zustand
- React Hook Form

HTTP and UX:

- Axios
- React Hot Toast
- React Icons

Styling:

- Tailwind package available via Vite plugin
- Custom CSS theme in index.css

## External APIs Used

- Exchange rates: https://api.exchangerate-api.com
- Countries and currencies: https://restcountries.com
- OCR AI model API: https://api.anthropic.com

## Project Structure

```text
Reimbursement_management_Sarthak/
  backend/
    config/
      database.js
    controllers/
      approvalController.js
      authController.js
      expenseController.js
      ocrController.js
      userController.js
    middleware/
      authMiddleware.js
      errorHandler.js
      roleMiddleware.js
      uploadMiddleware.js
    models/
      Approval.js
      ApprovalFlow.js
      Company.js
      Expense.js
      User.js
      index.js
    routes/
      approvalRoutes.js
      authRoutes.js
      currencyRoutes.js
      expenseRoutes.js
      userRoutes.js
    services/
      approvalService.js
      currencyService.js
    utils/
      emailService.js
      ocrService.js
    server.js

  frontend/
    src/
      api/
        axios.js
      components/
        Layout/
          AppShell.jsx
          ProtectedRoute.jsx
          Sidebar.jsx
        UI/
          StatusBadge.jsx
      pages/
        admin/
          ApprovalRules.jsx
          Dashboard.jsx
          UserManagement.jsx
        auth/
          Login.jsx
          OAuthCallback.jsx
          Register.jsx
        employee/
          Dashboard.jsx
          MyExpenses.jsx
          SubmitExpense.jsx
        manager/
          Dashboard.jsx
          PendingApprovals.jsx
      store/
        authStore.js
      utils/
        roleHomePath.js
      App.jsx
      index.css
      main.jsx
```

## Backend API Analysis

Base URL prefix in server:

- /api/auth
- /api/users
- /api/expenses
- /api/approvals
- /api/currency

Health endpoint:

- GET /health

## Auth APIs

- POST /api/auth/register
- POST /api/auth/login
- GET /api/auth/me
- GET /api/auth/countries

## User APIs

- GET /api/users/me/team
- GET /api/users
- POST /api/users
- GET /api/users/:id
- PUT /api/users/:id
- DELETE /api/users/:id

## Expense APIs

- GET /api/expenses/all
- GET /api/expenses/mine
- GET /api/expenses/team
- GET /api/expenses/pending
- POST /api/expenses/ocr
- POST /api/expenses
- GET /api/expenses/:id

## Approval APIs

- POST /api/approvals/flows
- GET /api/approvals/flows
- PUT /api/approvals/flows/:id
- DELETE /api/approvals/flows/:id
- POST /api/approvals/override/:id
- POST /api/approvals/:expenseId/action
- GET /api/approvals/:expenseId/trail

## Currency APIs

- GET /api/currency/rates/:base
- GET /api/currency/convert?from=USD&to=INR&amount=100

## Authorization Behavior

- Auth middleware expects Authorization header with Bearer token
- Role middleware enforces allowed role list per route
- Admin-only modules: user CRUD, flow management, all expenses, override
- Manager modules: team scope and pending approvals
- Employee modules: own expenses and submission

## Data Model Analysis

## Company

Purpose:

- Tenant boundary for multi-company separation

Main fields:

- id, name, country, currency

## User

Purpose:

- Identity and role control

Main fields:

- id, company_id, name, email, password, role, manager_id, is_active

Roles:

- admin
- manager
- employee

## Expense

Purpose:

- Reimbursement claim data and processing state

Main fields:

- id, user_id, company_id, title, amount, currency
- amount_in_company_currency, company_currency
- category, description, date, receipt_url
- status, current_approver_id, flow_id, current_step

## Approval

Purpose:

- Per-step approval records and audit trail

Main fields:

- expense_id, approver_id, step_order, status, comment, acted_at

## ApprovalFlow

Purpose:

- Company-level approval rule templates

Main fields:

- company_id, name, is_manager_approver, steps
- condition_type, percentage_threshold, specific_approver_id, is_active

## Entity Relationships

- Company has many users
- Company has many expenses
- Company has many approval flows
- User belongs to company
- User self-reference supports manager-team hierarchy
- User has many expenses as submitter
- Expense belongs to user, company, and optional flow
- Expense has many approvals
- Approval belongs to expense and approver user

## Frontend Module Analysis

## App and Routing

- App.jsx defines all public and protected routes
- AppShell provides common layout and sidebar
- DashboardRedirect routes users by role

## Layout Components

- Sidebar builds navigation based on role
- ProtectedRoute blocks unauthorized navigation
- StatusBadge renders status color indicators

## Page Modules by Role

Employee:

- Dashboard: summary metrics and recent expenses
- SubmitExpense: OCR upload plus manual form submit
- MyExpenses: full personal expense list

Manager:

- Dashboard: pending approvals and team count
- PendingApprovals: approve/reject actions with comments

Admin:

- Dashboard: users, expenses, pending metrics
- UserManagement: create and list users
- ApprovalRules: create and list flow rules

Auth:

- Login
- Register
- OAuthCallback token handoff

## Environment Variables

## Backend required

Create backend/.env with at least:

```env
PORT=5000
MYSQL_URL=mysql://USER:PASSWORD@localhost:3306/DATABASE_NAME
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173

MAIL_USER=your_email
MAIL_PASS=your_app_password
MAIL_FROM="Reimbursement Management <your_email>"

ANTHROPIC_API_KEY=your_anthropic_key
```

## Frontend optional

Create frontend/.env:

```env
VITE_API_URL=http://localhost:5000/api
```

If VITE_API_URL is not set, frontend defaults to /api and uses Vite proxy.

## Setup and Run

## 1) Install dependencies

```bash
cd backend
npm install

cd ../frontend
npm install
```

## 2) Run backend

```bash
cd backend
npm run dev
```

## 3) Run frontend

```bash
cd frontend
npm run dev
```

Frontend default URL: http://localhost:5173

Backend default URL: http://localhost:5000

## Build Commands

Backend:

- npm start
- npm run dev

Frontend:

- npm run dev
- npm run build
- npm run preview
- npm run lint

## Current Implementation Notes

- Backend routes do not currently expose Google OAuth endpoints, while frontend includes Google login navigation.
- Sequelize sync is currently commented in database connection code, so table creation depends on external migration or manual setup.
- Receipt OCR extracts data but does not persist original receipt file URL by default.

## Why This Architecture Works

- Multi-tenant by company_id for clean data isolation
- Approval engine separated into service layer for maintainability
- Role-based routing in both backend and frontend
- Clear controller-service-model split in backend
- Lightweight frontend state management with persisted auth

## Deliverables in Repository

- Full backend implementation
- Full frontend implementation
- Postman collection for API testing
- Team issue tracking document
- Technical documentation PDF

## Team Credit

This project README and technical analysis is prepared for Team Sarthak:

- Jaykumar Girase
- Yashodip More
- Tejas Patil
- Komal Kumavat
