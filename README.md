# FinTrack — Expense & Budget Tracker

> A full-stack personal finance management application built as an individual assignment for **Software Engineering Team - 405**.

FinTrack allows users to register, log in, and manage their personal finances — tracking income, expenses, monthly budgets, and generating financial reports — all within a clean, responsive web interface.

---

## 🔗 Links

| Resource | Link |
|---|---|
| **GitHub Repository** | [https://github.com/Imalka-Randev/FinTrack-Expense_Tracker-](https://github.com/Imalka-Randev/FinTrack-Expense_Tracker-) |
| **Demo Video** | *(Google Drive link — see submission document)* |

---

## ✨ Features

### Core Features
- 🔐 **User Authentication** — Register and login with JWT-protected routes and bcrypt password hashing
- 📊 **Financial Dashboard** — Monthly income, expenses, net balance, budget alerts, and month-over-month comparison
- 💸 **Transaction Management** — Add, edit, and delete income and expense records with categories
- 🔍 **Search & Filter** — Filter transactions by keyword, type (income/expense), category, and date range
- 🎯 **Budget Planner** — Set per-category monthly spending limits with real-time progress tracking
- 📈 **Visual Charts** — Expense pie chart (category breakdown) and income vs. expense bar chart (daily timeline)
- ✅ **Form Validation** — Client-side and server-side validation with inline error messages
- 📱 **Responsive UI** — Fully responsive layout from 360px mobile screens up to wide desktop displays

### Optional Features (Implemented)
- 📥 **Export to CSV** — Download transactions as a formatted spreadsheet (RFC 4180 compliant, Excel-compatible)
- 🖨️ **Print / Save PDF** — Print-ready financial statement layout with page-break optimized CSS
- 🔔 **Toast Notifications** — Real-time success/error feedback for all CRUD operations
- 👁️ **Password Visibility Toggle** — Show/hide password on login and registration forms

---

## 🛠️ Technology Stack

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| React.js | v19 | UI framework |
| Vite | v8 | Build tool & dev server |
| Tailwind CSS | v4 | Utility-first styling |
| React Router | v7 | Client-side routing & protected routes |
| Recharts | v3 | Data visualization (pie & bar charts) |
| Axios | v1 | HTTP API client |
| Lucide React | v1 | Icon library |

### Backend
| Technology | Version | Purpose |
|---|---|---|
| Node.js | LTS | Runtime environment |
| Express.js | v5 | REST API framework |
| MongoDB | Atlas / Local | NoSQL database |
| Mongoose | v8 | ODM for MongoDB |
| JSON Web Tokens | — | Authentication tokens |
| bcrypt.js | v3 | Password hashing |

---

## 📁 Project Structure

```text
FinTrack(Expense_Tracker)/
├── FinTrack_frontend/               # React + Vite frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/              # Reusable UI components (Button, Input, Select, Modal...)
│   │   │   ├── dashboard/           # Dashboard-specific widgets (charts, summary cards)
│   │   │   ├── transactions/        # Transaction table, filters, form modal
│   │   │   └── budgets/             # Budget card and form modal
│   │   ├── context/                 # React context (AuthContext, ToastContext)
│   │   ├── hooks/                   # Custom hooks (useAuth, useToast)
│   │   ├── layouts/                 # AppLayout, Sidebar, TopNavbar
│   │   ├── pages/                   # Page-level components
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── TransactionsPage.jsx
│   │   │   ├── BudgetsPage.jsx
│   │   │   └── ReportsPage.jsx
│   │   ├── services/                # API service modules (Axios wrappers)
│   │   └── utils/                   # Formatters, constants, export utilities
│   ├── .env.example
│   └── package.json
│
└── FinTrack_backend/                # Node.js + Express backend
    ├── src/
    │   ├── config/                  # MongoDB connection
    │   ├── controllers/             # Route handlers
    │   ├── middleware/              # JWT auth & error middleware
    │   ├── models/                  # Mongoose schemas (User, Transaction, Budget)
    │   ├── routes/                  # Express routers
    │   ├── services/                # Business logic & DB queries
    │   ├── validators/              # Request validation middleware
    │   └── utils/                   # JWT helpers
    ├── auth.test.js                 # Auth test suite
    ├── transaction.test.js          # Transaction test suite
    ├── dashboard.test.js            # Dashboard test suite
    ├── budget.test.js               # Budget test suite
    ├── .env.example
    └── package.json
```

---

## ⚙️ Setup & Installation

### Prerequisites
- **Node.js** v18 or higher
- **MongoDB** (local installation or [MongoDB Atlas](https://www.mongodb.com/atlas) free tier)
- **npm** (comes with Node.js)

---

### 1. Clone the Repository

```bash
git clone https://github.com/Imalka-Randev/FinTrack-Expense_Tracker-.git
cd "FinTrack(Expense_Tracker)"
```

---

### 2. Setup the Backend

```bash
cd FinTrack_backend
npm install
```

Create a `.env` file in the `FinTrack_backend/` directory:

```env
PORT=5001
MONGO_URI=mongodb://localhost:27017/fintrack
JWT_SECRET=your_strong_secret_key_here
JWT_EXPIRES_IN=30d
```

> **MongoDB Atlas:** Replace `MONGO_URI` with your Atlas connection string (e.g., `mongodb+srv://<user>:<password>@cluster.mongodb.net/fintrack`)

Start the backend development server:

```bash
npm run dev
```

The API will start on **http://localhost:5001**

---

### 3. Setup the Frontend

Open a new terminal window:

```bash
cd FinTrack_frontend
npm install
```

Create a `.env` file in the `FinTrack_frontend/` directory:

```env
VITE_API_BASE_URL=http://localhost:5001/api
```

Start the frontend development server:

```bash
npm run dev
```

The application will open on **http://localhost:5173**

---

## 🗺️ Application Pages

| Page | Route | Description |
|---|---|---|
| Login | `/login` | Email & password authentication |
| Register | `/register` | New user account creation |
| Dashboard | `/dashboard` | Monthly financial overview with charts |
| Transactions | `/transactions` | Full transaction history with search & filters |
| Budget Planner | `/budgets` | Monthly category budget tracking |
| Reports & Export | `/reports` | Date-range reports, CSV export, print PDF |

---

## 🔒 API Endpoints

### Authentication
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login & receive JWT |
| GET | `/api/auth/me` | Get current user profile |

### Transactions *(JWT required)*
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/transactions` | List with search/filter (`type`, `category`, `search`, `startDate`, `endDate`) |
| POST | `/api/transactions` | Create transaction |
| PUT | `/api/transactions/:id` | Update transaction |
| DELETE | `/api/transactions/:id` | Delete transaction |

### Dashboard *(JWT required)*
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/dashboard?month=10&year=2026` | Financial summary, charts data, recent transactions |

### Budgets *(JWT required)*
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/budgets` | List budgets with spending progress |
| POST | `/api/budgets` | Create budget |
| PUT | `/api/budgets/:id` | Update budget |
| DELETE | `/api/budgets/:id` | Delete budget |

---

## 📸 Key Screenshots

> Screenshots below highlight the main features of FinTrack.

### Dashboard
The dashboard displays monthly income, expenses, net balance, month-over-month comparison trends, budget alerts, expense pie chart, and income vs. expense bar chart.

### Transactions
Full transaction history with inline search (keyword), type filter (income/expense), category filter, and date-range picker. Add, edit, and delete records via a modal form with validation.

### Budget Planner
Set per-category monthly budgets. Each budget card shows a progress bar with percentage used, spent amount, remaining amount, and visual warning when a budget is exceeded.

### Reports & Export
Select a date range or use quick presets (This Month, Last Month, Last 30 Days, Year to Date, All Time). View total income, total expenses, net balance, savings rate, and category breakdown. Export data to CSV or print/save as PDF.

---

## 🧪 Running Tests

```bash
cd FinTrack_backend

# Run all test suites
npm test

# Run individual suites
node --test auth.test.js
node --test transaction.test.js
node --test dashboard.test.js
node --test budget.test.js
```

---

## 👤 Author

**Imalka Randev K.T.**
Individual Assignment — Software Engineering Team 405
