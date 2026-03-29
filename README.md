# 🧾 Reimbursement Management System
### Odoo × VIT Pune Hackathon 26

---

## 👥 Team Sarthak

| Name | Email | Role |
|------|-------|------|
| **Yashodip More** *(Leader)* | yashodipmore2004@gmail.com | Auth, Integration, Repo |
| **Komal Kumavat** | komalkumavat025@gmail.com | Frontend UI, Components |
| **Jaykumar Girase** | jaykumargirase0954@gmail.com | Approval Engine, Emails |
| **Tejas Patil** | tejaspatil1175@gmail.com | Expenses, OCR, Currency |

> **Mentor:** Haja Ram — ramh@odoo.com | GitHub: `ramh-odoo`  
> **Event:** VIT Pune, 29 March 2026 | 9:00 AM – 5:00 PM

---

## 📌 Table of Contents

1. [Project Overview](#1-project-overview)
2. [System Architecture](#2-system-architecture)
3. [Database Design](#3-database-design-mysql)
4. [Authentication & Authorization](#4-authentication--authorization)
5. [API Endpoints](#5-api-endpoints)
6. [Core Business Logic](#6-core-business-logic)
7. [Frontend Pages & UI](#7-frontend-pages--ui)
8. [State Management & API Integration](#8-state-management--api-integration)
9. [Setup & Running Locally](#9-setup--running-locally)
10. [Submission Checklist](#10-submission-checklist)

---

## 1. Project Overview

### 1.1 Problem Statement

Companies struggle with manual expense reimbursement processes that are time-consuming, error-prone, and lack transparency:

- No simple way to define **approval flows based on thresholds**
- No support for **multi-level approvals**
- No **flexible conditional approval rules**

### 1.2 Solution Summary

A full-stack web application with role-based access (Admin, Manager, Employee) that automates the entire expense reimbursement lifecycle — from submission to multi-level conditional approval — with real-time currency conversion and OCR receipt scanning.

### 1.3 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18 + Vite, TailwindCSS, React Router v6, Axios, React Hook Form, Zustand |
| **Backend** | Node.js, Express.js, JWT, Passport.js (Google OAuth), Nodemailer, Multer, Tesseract.js (OCR) |
| **Database** | MySQL 8 with mysql2 driver |
| **Auth** | JWT (access + refresh tokens), Google OAuth 2.0, bcrypt |
| **External APIs** | restcountries.com (country/currency), exchangerate-api.com (conversion) |
| **Dev Tools** | ESLint, Prettier, Git, dotenv, nodemon |

---

## 2. System Architecture

### 2.1 Backend Folder Structure

```
reimbursement-backend/
├── src/
│   ├── config/
│   │   ├── db.js               # MySQL connection pool
│   │   ├── passport.js         # Google OAuth strategy
│   │   └── nodemailer.js       # Mail transporter config
│   ├── middleware/
│   │   ├── auth.js             # verifyToken, requireRole
│   │   └── upload.js           # Multer config for receipts
│   ├── routes/
│   │   ├── auth.routes.js      # /api/auth/*
│   │   ├── user.routes.js      # /api/users/*
│   │   ├── expense.routes.js   # /api/expenses/*
│   │   ├── approval.routes.js  # /api/approvals/*
│   │   └── currency.routes.js  # /api/currency/*
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── user.controller.js
│   │   ├── expense.controller.js
│   │   ├── approval.controller.js
│   │   └── currency.controller.js
│   ├── services/
│   │   ├── approval.service.js    # Core approval logic
│   │   ├── ocr.service.js         # Tesseract OCR
│   │   ├── currency.service.js    # Conversion logic
│   │   └── mail.service.js        # Email notifications
│   └── utils/
│       └── helpers.js
├── uploads/                    # Temp receipt storage
├── .env
├── package.json
└── index.js                    # Entry point
```

### 2.2 Frontend Folder Structure

```
frontend/
├── src/
│   ├── api/
│   │   └── axios.js            # Axios instance + interceptors
│   ├── store/
│   │   └── authStore.js        # Zustand global auth state
│   ├── components/
│   │   ├── Layout/
│   │   │   ├── Navbar.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── UI/
│   │   │   ├── Badge.jsx       # Status badges
│   │   │   ├── Modal.jsx
│   │   │   ├── Table.jsx
│   │   │   └── LoadingSpinner.jsx
│   │   └── Expense/
│   │       ├── ExpenseForm.jsx
│   │       ├── ExpenseList.jsx
│   │       └── ApprovalChain.jsx
│   ├── pages/
│   │   ├── auth/
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   └── OAuthCallback.jsx
│   │   ├── admin/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── UserManagement.jsx
│   │   │   └── ApprovalRules.jsx
│   │   ├── manager/
│   │   │   ├── Dashboard.jsx
│   │   │   └── PendingApprovals.jsx
│   │   └── employee/
│   │       ├── Dashboard.jsx
│   │       ├── SubmitExpense.jsx
│   │       └── MyExpenses.jsx
│   ├── hooks/
│   │   ├── useAuth.js
│   │   └── useExpenses.js
│   ├── utils/
│   │   └── formatCurrency.js
│   ├── App.jsx                 # Router setup
│   └── main.jsx
├── .env
├── vite.config.js
└── package.json
```

---

## 3. Database Design (MySQL)

> ⚠️ **Run migrations in this exact order:**  
> `companies → users → expenses → approval_flows → approval_steps → expense_approvals → refresh_tokens`

### 3.1 `companies`

```sql
CREATE TABLE companies (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  name       VARCHAR(255) NOT NULL,
  country    VARCHAR(100) NOT NULL,
  currency   VARCHAR(10)  NOT NULL,  -- e.g. INR, USD
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 3.2 `users`

```sql
CREATE TABLE users (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  company_id    INT NOT NULL,
  name          VARCHAR(255) NOT NULL,
  email         VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255),           -- NULL if Google OAuth
  role          ENUM('admin','manager','employee') NOT NULL DEFAULT 'employee',
  google_id     VARCHAR(255),           -- NULL if email/pass login
  manager_id    INT,                    -- FK to users.id (direct manager)
  is_active     BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES companies(id),
  FOREIGN KEY (manager_id) REFERENCES users(id)
);
```

### 3.3 `expenses`

```sql
CREATE TABLE expenses (
  id                         INT AUTO_INCREMENT PRIMARY KEY,
  employee_id                INT NOT NULL,
  company_id                 INT NOT NULL,
  title                      VARCHAR(255) NOT NULL,
  amount                     DECIMAL(12,2) NOT NULL,   -- in submitted_currency
  submitted_currency         VARCHAR(10) NOT NULL,
  amount_in_company_currency DECIMAL(12,2),             -- converted on submission
  category  ENUM('travel','food','accommodation','equipment','other') NOT NULL,
  description                TEXT,
  expense_date               DATE NOT NULL,
  receipt_url                VARCHAR(500),
  status    ENUM('pending','approved','rejected') DEFAULT 'pending',
  current_step               INT DEFAULT 1,
  created_at                 TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at                 TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (employee_id) REFERENCES users(id),
  FOREIGN KEY (company_id) REFERENCES companies(id)
);
```

### 3.4 `approval_flows`

```sql
CREATE TABLE approval_flows (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  company_id       INT NOT NULL,
  name             VARCHAR(255) NOT NULL,
  condition_type   ENUM('sequential','percentage','specific_user','hybrid') DEFAULT 'sequential',
  percentage       INT,           -- e.g. 60 (for percentage rule)
  specific_user_id INT,           -- e.g. CFO user id
  is_active        BOOLEAN DEFAULT TRUE,
  FOREIGN KEY (company_id) REFERENCES companies(id),
  FOREIGN KEY (specific_user_id) REFERENCES users(id)
);
```

### 3.5 `approval_steps`

```sql
CREATE TABLE approval_steps (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  flow_id     INT NOT NULL,
  step_number INT NOT NULL,   -- 1, 2, 3...
  approver_id INT NOT NULL,
  label       VARCHAR(100),  -- e.g. "Manager", "Finance", "Director"
  FOREIGN KEY (flow_id) REFERENCES approval_flows(id),
  FOREIGN KEY (approver_id) REFERENCES users(id)
);
```

### 3.6 `expense_approvals`

```sql
CREATE TABLE expense_approvals (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  expense_id  INT NOT NULL,
  approver_id INT NOT NULL,
  step_number INT NOT NULL,
  action      ENUM('pending','approved','rejected') DEFAULT 'pending',
  comment     TEXT,
  acted_at    TIMESTAMP,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (expense_id) REFERENCES expenses(id),
  FOREIGN KEY (approver_id) REFERENCES users(id)
);
```

### 3.7 `refresh_tokens`

```sql
CREATE TABLE refresh_tokens (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  user_id    INT NOT NULL,
  token      VARCHAR(512) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

---

## 4. Authentication & Authorization

### 4.1 Auth Strategy Overview

| Method | How It Works |
|--------|-------------|
| **Email + Password** | bcrypt hash in DB. On login → JWT access token (15 min) + refresh token (7 days) in HttpOnly cookie |
| **Google OAuth 2.0** | Passport.js GoogleStrategy. On success → find or create user → issue JWT + refresh token |
| **Token Refresh** | `POST /api/auth/refresh` — reads HttpOnly cookie, validates from DB, issues new access token |
| **Logout** | `DELETE /api/auth/logout` — deletes refresh token from DB + clears cookie |

### 4.2 `.env` File (Complete)

```env
# Server
PORT=5000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=3306
DB_NAME=reimbursement_db
DB_USER=root
DB_PASS=yourpassword

# JWT
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_SECRET=another_secret_for_refresh
REFRESH_TOKEN_EXPIRES_IN=7d

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

# Nodemailer (Gmail SMTP)
MAIL_USER=yourteamemail@gmail.com
MAIL_PASS=your_gmail_app_password   # Gmail App Password, NOT account password
MAIL_FROM="Reimbursement System <yourteamemail@gmail.com>"

# Frontend URL
CLIENT_URL=http://localhost:5173

# Exchange Rate API
EXCHANGE_RATE_BASE_URL=https://api.exchangerate-api.com/v4/latest
```

> 💡 **Gmail App Password:** Enable 2FA → go to `myaccount.google.com/apppasswords` → generate password

### 4.3 JWT Middleware (`auth.js`)

Every protected route passes through `verifyToken`:
- Reads `Authorization: Bearer <token>` header
- Verifies JWT signature and expiry
- Attaches decoded user `(id, role, company_id)` to `req.user`
- Returns `401` if token missing/invalid, `403` if role insufficient

### 4.4 Role Authorization

```js
// Usage in routes
router.get('/admin-only', verifyToken, requireRole('admin'), controller);
router.get('/managers-and-admins', verifyToken, requireRole('admin', 'manager'), controller);

// middleware/auth.js
const requireRole = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ message: 'Access denied' });
  }
  next();
};
```

### 4.5 First Signup Flow

1. Accept: `name, email, password, companyName, country`
2. Detect country currency via restcountries API
3. Create company record with detected currency
4. Create user with `role = 'admin'` (first user always becomes admin)
5. Send welcome email via Nodemailer
6. Return JWT tokens

> ✅ Google OAuth users who sign up first also become admin. Subsequent users created by admin will have `role = 'employee'` by default.

---

## 5. API Endpoints

> **Base URL:** `http://localhost:5000/api`  
> **Auth Header:** `Authorization: Bearer <token>` (all protected routes)

### 5.1 Auth Routes `/api/auth`

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| `POST` | `/auth/register` | Public | First signup — creates company + admin user |
| `POST` | `/auth/login` | Public | Email + password login → access token + refresh cookie |
| `POST` | `/auth/refresh` | Public | Refresh access token using HttpOnly cookie |
| `DELETE` | `/auth/logout` | Auth | Invalidate refresh token, clear cookie |
| `GET` | `/auth/google` | Public | Initiate Google OAuth flow |
| `GET` | `/auth/google/callback` | Public | Google OAuth callback — create/find user |
| `GET` | `/auth/me` | Auth | Get currently logged in user info |

### 5.2 User Routes `/api/users`

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| `GET` | `/users` | Admin | Get all users in company |
| `POST` | `/users` | Admin | Create employee or manager account |
| `GET` | `/users/:id` | Admin | Get single user details |
| `PUT` | `/users/:id` | Admin | Update user info (name, role, manager_id) |
| `PUT` | `/users/:id/role` | Admin | Change user role |
| `PUT` | `/users/:id/manager` | Admin | Assign manager relationship |
| `DELETE` | `/users/:id` | Admin | Deactivate user (soft delete) |
| `GET` | `/users/me/team` | Manager | Get all employees under this manager |

### 5.3 Expense Routes `/api/expenses`

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| `POST` | `/expenses` | Employee | Submit new expense claim |
| `GET` | `/expenses/mine` | Employee | Get own expense history with status |
| `GET` | `/expenses/:id` | Auth | Get single expense detail + approval trail |
| `GET` | `/expenses` | Admin | Get all expenses in company |
| `GET` | `/expenses/team` | Manager | Get all expenses from team members |
| `GET` | `/expenses/pending` | Manager/Admin | Get expenses waiting for my approval |
| `POST` | `/expenses/:id/ocr` | Employee | Upload receipt → OCR → return extracted fields |
| `DELETE` | `/expenses/:id` | Employee | Cancel expense (only if still pending step 1) |

### 5.4 Approval Routes `/api/approvals`

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| `POST` | `/approvals/:expenseId/action` | Manager/Admin | Approve or reject at current step |
| `GET` | `/approvals/:expenseId/trail` | Auth | Full approval history for expense |
| `POST` | `/approvals/flows` | Admin | Create new approval flow |
| `GET` | `/approvals/flows` | Admin | List all approval flows |
| `PUT` | `/approvals/flows/:id` | Admin | Update approval flow |
| `DELETE` | `/approvals/flows/:id` | Admin | Delete approval flow |
| `POST` | `/approvals/override/:expenseId` | Admin | Force approve/reject any expense |

### 5.5 Currency Routes `/api/currency`

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| `GET` | `/currency/countries` | Public | List all countries with currencies |
| `GET` | `/currency/convert` | Auth | Convert amount between currencies |
| `GET` | `/currency/rates/:base` | Auth | Get latest exchange rates for base currency |

---

## 6. Core Business Logic

### 6.1 Expense Submission Flow

1. Employee fills form: title, amount, currency, category, description, date, optional receipt
2. Frontend calls `GET /api/currency/rates/{currency}` to show converted amount live
3. On submit → `POST /api/expenses`
4. Backend converts amount to company currency and stores both values
5. If employee has a manager → set `current_step = 1` (manager approves first)
6. Create `expense_approvals` row for step 1 approver with `action = 'pending'`
7. Send email notification to step 1 approver

### 6.2 Multi-Step Sequential Approval

```
ON APPROVE (step N):
  1. Mark expense_approvals[step N] = 'approved'
  2. Check if more steps remain:
     → YES: increment expenses.current_step
            create next expense_approvals row
            send email to next approver
     → NO:  mark expenses.status = 'approved'
            send approval email to employee

ON REJECT (any step):
  1. Mark expense_approvals[step N] = 'rejected' + save comment
  2. Mark expenses.status = 'rejected'
  3. Send rejection email to employee with comment
```

### 6.3 Conditional Approval Rules

| Rule Type | Logic |
|-----------|-------|
| `sequential` | Default. Each approver must approve in order |
| `percentage` | If >= X% of all approvers approved → auto-approve |
| `specific_user` | If designated user (e.g. CFO) approves → auto-approve entire expense |
| `hybrid` | Percentage threshold met OR specific user approved → auto-approve |

> ⚠️ For `hybrid` and `percentage` rules, all approvers are notified simultaneously. The service checks after each approval whether the condition is met.

### 6.4 OCR Service Flow

1. Employee uploads receipt (JPG/PNG/PDF)
2. Backend saves file via Multer to `/uploads/`
3. Tesseract.js runs OCR on the image
4. Regex-based parser extracts: amount, date, vendor name, line items
5. Returns extracted fields as JSON to frontend
6. Employee reviews, edits if needed, then submits

### 6.5 Email Notifications (Nodemailer)

| Trigger | Recipient |
|---------|-----------|
| Expense submitted | Step 1 approver — "New expense to review" |
| Step approved | Next step approver — "Expense waiting for approval" |
| All steps approved | Employee — "Your expense has been approved" |
| Any rejection | Employee — "Your expense was rejected" + comment |
| New user created | New user — Welcome email with login credentials |

---

## 7. Frontend Pages & UI

### 7.1 Route Structure

```
/ (root)
├── /login                     # Public
├── /register                  # Public (first company signup)
├── /auth/callback             # OAuth callback handler
└── /app                       # Protected (ProtectedRoute wrapper)
    ├── /app/dashboard         # Role-based dashboard
    ├── /app/expenses
    │   ├── /new               # Submit expense form
    │   ├── /mine              # My expense history
    │   └── /:id               # Expense detail + approval trail
    ├── /app/approvals         # Pending approvals (manager/admin)
    ├── /app/users             # User management (admin only)
    └── /app/settings
        └── /approval-rules    # Approval flow config (admin only)
```

### 7.2 Page Descriptions

#### Login Page
- Email/Password form + "Login with Google" button
- Validation: required, email format, min 6 chars password
- On success: store access token (Zustand), redirect based on role
- Loading spinner during API call, error toast on failure

#### Register Page (First Signup — Admin)
- Fields: Company Name, Your Name, Email, Password, Country (dropdown from restcountries API)
- Country auto-shows detected currency
- On submit: create company + admin → redirect to dashboard

#### Dashboard (Role-Aware)
- **Admin:** Total expenses, pending count, approved this month, top spenders chart
- **Manager:** Team's pending count, quick approve buttons, recent activity
- **Employee:** My total submitted/approved/pending/rejected + quick submit button

#### Submit Expense Form (Employee)
- Fields: Title, Amount, Currency (dropdown), Category, Description, Date, Receipt Upload
- Live currency conversion as user types amount
- "Scan Receipt" OCR button → auto-fills fields from image
- Receipt preview thumbnail if uploaded
- All fields required except description and receipt

#### My Expenses (Employee)
- Table: Title, Amount, Category, Date, Status badge, Action
- Status badges: Pending (yellow), Approved (green), Rejected (red)
- Click row → Expense Detail page
- Filter by status and date range

#### Expense Detail Page
- Top: Expense info card (all fields)
- Middle: Approval Chain visualizer — steps with status icons + timestamps
- Bottom: Timeline of actions with comments
- Rejected: rejection reason shown prominently

#### Pending Approvals (Manager/Admin)
- Table: Employee, Title, Amount (in company currency), Category, Date, Days waiting
- Approve and Reject buttons per row
- Reject opens modal with required comment
- Admin sees all company-wide; Manager sees only assigned ones

#### User Management (Admin)
- Table: Name, Email, Role, Manager, Status
- Create User modal: name, email, temp password, role
- Edit user: change role, assign manager (only manager-role users in dropdown)
- Toggle active/inactive

#### Approval Rules (Admin)
- List of flows with step count and condition type
- Create Flow: name → add steps (drag to reorder) → set approver per step
- Condition type: Sequential / Percentage / Specific User / Hybrid
- Mark one flow as Active per company

---

## 8. State Management & API Integration

### 8.1 Zustand Auth Store

```js
// store/authStore.js
import { create } from 'zustand';

const useAuthStore = create((set) => ({
  user: null,             // { id, name, email, role, company_id, currency }
  accessToken: null,
  isAuthenticated: false,

  setAuth: (user, token) => set({ user, accessToken: token, isAuthenticated: true }),
  logout: () => set({ user: null, accessToken: null, isAuthenticated: false }),
  updateToken: (token) => set({ accessToken: token }),
}));

export default useAuthStore;
```

### 8.2 Axios Instance with Auto Token Refresh

```js
// api/axios.js
import axios from 'axios';
import useAuthStore from '../store/authStore';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

// Attach access token to every request
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-refresh on 401
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response?.status === 401 && !error.config._retry) {
      error.config._retry = true;
      const res = await axios.post('/api/auth/refresh', {}, { withCredentials: true });
      useAuthStore.getState().updateToken(res.data.accessToken);
      return api(error.config);
    }
    return Promise.reject(error);
  }
);

export default api;
```

### 8.3 Protected Route Component

```jsx
// components/Layout/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';

export default function ProtectedRoute({ children, roles }) {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/app/dashboard" replace />;

  return children;
}

// Usage in App.jsx:
// <Route path="/app/users" element={
//   <ProtectedRoute roles={['admin']}>
//     <UserManagement />
//   </ProtectedRoute>
// } />
```

---

## 9. Setup & Running Locally

### 9.1 Backend Setup

```bash
# 1. Clone repo and go to backend
cd reimbursement-backend

# 2. Install dependencies
npm install

# 3. Create MySQL database
mysql -u root -p
> CREATE DATABASE reimbursement_db;
> exit

# 4. Run schema migrations
mysql -u root -p reimbursement_db < src/config/schema.sql

# 5. Setup env
cp .env.example .env
# Fill all values in .env

# 6. Start server
npm run dev
# Runs at http://localhost:5000
```

### 9.2 Frontend Setup

```bash
cd frontend
npm install

# Create .env
echo "VITE_API_URL=http://localhost:5000/api" > .env

npm run dev
# Runs at http://localhost:5173
```

### 9.3 Google OAuth Setup

1. Go to [console.cloud.google.com](https://console.cloud.google.com) → Create project
2. APIs & Services → Credentials → Create OAuth 2.0 Client ID
3. Authorized redirect URI: `http://localhost:5000/api/auth/google/callback`
4. Copy Client ID and Secret into `.env`

### 9.4 Git Workflow

> ⚠️ **All 4 members MUST commit code. Evaluators check `git log`. Each member should push 3–4+ meaningful commits.**

```bash
# Always work on branches
git checkout -b feature/your-feature-name
git add .
git commit -m "feat: describe what you did"
git push origin feature/your-feature-name
# Create PR → team leader reviews → merge to main
```

#### Team Git Ownership

| Member | Feature Branch Ownership |
|--------|-------------------------|
| **Yashodip** | `feature/auth`, `feature/setup`, integration |
| **Komal** | `feature/frontend-ui`, `feature/components` |
| **Jaykumar** | `feature/approval-engine`, `feature/emails` |
| **Tejas** | `feature/expense-submission`, `feature/ocr`, `feature/currency` |

---

## 10. Submission Checklist

### ⏰ Timeline (29 March 2026)

| Time | Action |
|------|--------|
| **9:00 AM** | Coding starts. Init repos. Push first commit. Submit GitHub repo link on portal. |
| **9:30 AM** | DB schema up. Express server running with `/health` route. |
| **10:00 AM** | ⚠️ Add `ramh-odoo` as collaborator on GitHub repo |
| **10:00–2:00 PM** | Core sprint: Auth + Expense submission + Approval engine |
| **2:00–4:00 PM** | Frontend pages + API integration |
| **4:00–5:00 PM** | Bug fixes, README, final commits from all members |
| **5:00 PM** | ⛔ Coding ends. Final push. |
| **5:30 PM** | Submit video demo link on portal |

### ✅ Must-Have Features

- [ ] Auth — email/password + Google OAuth working
- [ ] First signup creates company + admin automatically
- [ ] Admin creates employees and managers
- [ ] Admin assigns manager relationships
- [ ] Employee submits expense with any currency
- [ ] Amount auto-converted to company currency on submission
- [ ] 2-step sequential approval working
- [ ] Manager approves/rejects with comment
- [ ] Employee views expense history with status
- [ ] Responsive UI with consistent color scheme
- [ ] Input validation on all forms
- [ ] All 4 team members have commits in `git log`
- [ ] Mentor `ramh-odoo` added as GitHub collaborator

### 🎯 Nice-to-Have (Do if time allows)

- [ ] Conditional approval rules (percentage / specific user / hybrid)
- [ ] OCR receipt scanning with Tesseract.js
- [ ] Email notifications via Nodemailer
- [ ] Admin override approval
- [ ] Dashboard charts
- [ ] Expense filtering and search

---

*Team Sarthak — Odoo × VIT Pune Hackathon 26 — 29 March 2026*  
*Ship it. 🚀*
