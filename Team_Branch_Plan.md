# Team Sarthak — Branch Plan
### 6 branches, kaam khatam ✅

---

## Git Setup (Sabse Pehle — Yashodip karega)

```bash
git clone <repo-link>
npm install
```
Baaki sab sirf clone karenge aur apni branch pe kaam karenge.

---

## 6 Branches — Kaun Kya Karega

| Branch | Kaun | Kya |
|--------|------|-----|
| `feature/auth` | Yashodip | Login, Register, JWT, Google OAuth |
| `feature/expense` | Tejas | Expense submit, OCR, currency convert |
| `feature/approval` | Jay | Approval engine, approve/reject logic |
| `feature/email` | Jay | Nodemailer — email notifications |
| `feature/frontend-auth-pages` | Komal | Login page UI, Register page UI |
| `feature/frontend-main-pages` | Komal | Dashboard, Expense list, Approve page UI |

---

---

# KOMAL — Frontend (2 Branches)

---

## Branch 1: `feature/frontend-auth-pages`

**Kya banana hai:** Login + Register ka UI

```bash
git checkout main && git pull
git checkout -b feature/frontend-auth-pages
```

### Login Page (`src/pages/auth/Login.jsx`)
- Email + Password input
- Login button
- "Google se Login" button
- Error message dikhao

### Register Page (`src/pages/auth/Register.jsx`)
- Company Name, Name, Email, Password inputs
- Country dropdown (fetch from restcountries API)
- Jab country select ho, currency auto-dikhao
- Register button

### Jab kaam ho:
```bash
git add .
git commit -m "feat: login and register pages UI"
git push origin feature/frontend-auth-pages
```
> Yashodip ko bolo PR merge karne ko

---

## Branch 2: `feature/frontend-main-pages`

```bash
git checkout main && git pull
git checkout -b feature/frontend-main-pages
```

### Kya banana hai (4 pages + Sidebar):

**1. Sidebar** (`src/components/Layout/Sidebar.jsx`)
- Employee ko dikhao: Dashboard, Submit Expense, My Expenses
- Manager: Dashboard, Pending Approvals
- Admin: Dashboard, Users, Approval Rules

**2. Employee Dashboard** (`src/pages/employee/Dashboard.jsx`)
- 4 cards: Total, Approved, Pending, Rejected (count)
- Data `GET /api/expenses/mine` se aayega

**3. My Expenses** (`src/pages/employee/MyExpenses.jsx`)
- Table: Title | Amount | Category | Date | Status
- Status badge: 🟡 Pending | 🟢 Approved | 🔴 Rejected

**4. Pending Approvals** (`src/pages/manager/PendingApprovals.jsx`)
- Table: Employee Name | Amount | Date | Approve ✅ | Reject ❌ buttons
- Reject pe click → comment daalne ka popup aaye

**5. Submit Expense Form** (`src/pages/employee/SubmitExpense.jsx`)
- Fields: Title, Amount, Currency dropdown, Category, Description, Date
- Tejas ke saath coordinate karna — wo API banayega

### Jab kaam ho:
```bash
git add .
git commit -m "feat: dashboard, expense list, approval pages UI"
git push origin feature/frontend-main-pages
```

---

---

# JAY — Backend (2 Branches)

---

## Branch 1: `feature/approval`

**Kya banana hai:** Approval logic — approve/reject kaise hoga

```bash
git checkout main && git pull
git checkout -b feature/approval
```

### Files banani hain:

**`src/services/approval.service.js`** — Main logic yahan

```
APPROVE kiya:
  → Current step mark karo approved
  → Agle step ka approver hai? → usse pending request bhejo
  → Koi step nahi bacha? → expense = APPROVED

REJECT kiya:
  → Step mark karo rejected + comment save karo
  → expense = REJECTED
```

**`src/controllers/approval.controller.js`** — Routes ke liye

**`src/routes/approval.routes.js`** — Endpoints:
```
POST /api/approvals/:expenseId/action   ← approve/reject
GET  /api/approvals/:expenseId/trail    ← history dekhna
POST /api/approvals/flows               ← flow banana (admin)
GET  /api/approvals/flows               ← flows list (admin)
POST /api/approvals/override/:id        ← admin force approve
```

### Jab kaam ho:
```bash
git add .
git commit -m "feat: approval engine with sequential flow logic"
git push origin feature/approval
```

---

## Branch 2: `feature/email`

```bash
git checkout main && git pull
git checkout -b feature/email
```

### File banani hai: `src/services/mail.service.js`

**4 email functions banao:**

```
1. sendApprovalRequest(approverEmail, expenseDetails)
   → "Ek expense review ke liye aaya hai"

2. sendApprovedEmail(employeeEmail, expenseDetails)
   → "Tera expense approve ho gaya!"

3. sendRejectedEmail(employeeEmail, comment)
   → "Tera expense reject hua — reason: ..."

4. sendWelcomeEmail(newUserEmail, password)
   → "Account ban gaya, ye lo credentials"
```

**Config:** `src/config/nodemailer.js`
```js
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: process.env.MAIL_USER, pass: process.env.MAIL_PASS }
});
```

> Jay — ye `approval.service.js` ke andar call hoga, coordinate karna Yashodip se

### Jab kaam ho:
```bash
git add .
git commit -m "feat: nodemailer email notifications for all triggers"
git push origin feature/email
```

---

---

# DAILY FLOW — Har Baar Ye Karo

```bash
# Kaam shuru karne se pehle
git checkout main
git pull origin main
git checkout feature/apni-branch

# Kaam ke beech beech mein commit karte raho
git add .
git commit -m "feat: kya kiya short mein likho"

# Din ke end mein push
git push origin feature/apni-branch
```

---

## Timeline (29 March)

```
9:00 AM  → Sab apni branch banao, kaam shuru
10:00 AM → ramh-odoo ko GitHub collaborator add karo
2:00 PM  → Jay aur Yashodip ka backend ready hona chahiye
3:00 PM  → Komal frontend APIs se connect karo
5:00 PM  → Final push sabka
5:30 PM  → Video submit
```

---

**All the best Team Sarthak! 🚀**
