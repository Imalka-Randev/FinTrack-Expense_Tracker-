# FinTrack — Expense & Budget Tracker

> A modern full-stack personal finance and expense management web application designed to help individuals track spending, manage monthly budgets, and gain financial clarity.

FinTrack allows users to register, log in, and manage their personal finances — tracking income, expenses, monthly budgets, and generating financial reports — all within a clean, responsive web interface.

---

## ✨ Key Features

- 🔐 **User Authentication** — Secure registration and login with JWT-protected routes and bcrypt password hashing
- 📊 **Financial Dashboard** — Real-time monthly income, expenses, net balance, budget alerts, and month-over-month comparison
- 💸 **Transaction Management** — Full CRUD support for income and expense records with category classification
- 🔍 **Search & Multi-Filter** — Instant keyword search and multi-filtering by type (income/expense), category, and date range
- 🎯 **Budget Planner** — Set monthly spending limits per category with live progress indicators and overspending alerts
- 📈 **Visual Analytics** — Interactive expense breakdown (Pie chart) and daily timeline comparison (Bar chart) powered by Recharts
- 📥 **Export to CSV** — Download transactions as a formatted spreadsheet (RFC 4180 compliant, Excel-compatible)
- 🖨️ **Print & PDF Statements** — Formatted, print-ready financial statement layout optimized with CSS print styling
- 🔔 **Toast Feedback** — Real-time toast notifications for clear feedback on user actions
- 👁️ **Password Visibility** — Convenient show/hide password toggle on authentication forms
- 📱 **Responsive Design** — Mobile-first UI optimized across 360px mobile screens up to desktop displays

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

> **MongoDB Atlas:** Replace `MONGO_URI` with your Atlas connection string (e.g., `mongodb+srv://<user>:<password>@cluster.mongodb.net/<dbname>`)

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
- GitHub: [@Imalka-Randev](https://github.com/Imalka-Randev)

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
