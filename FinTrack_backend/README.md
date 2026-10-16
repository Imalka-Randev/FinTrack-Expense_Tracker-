# FinTrack Backend

FinTrack – Expense & Budget Tracker backend application providing a RESTful API for managing personal finances.

## Current Development Status
- **IMPLEMENTED:** Complete authentication (`/api/auth/register`, `/api/auth/login`, `/api/auth/me`) with JWT and bcrypt.
- **IMPLEMENTED:** Complete transaction management (`POST`, `GET`, `PUT`, `DELETE` at `/api/transactions`) with strict user data isolation, server-side validation, search by description, category matching, and date-range filtering.
- **IMPLEMENTED:** Complete dashboard API & financial calculations (`GET /api/dashboard`) with total income, total expenses, balance calculations, category expense breakdown, daily time-series, and latest transactions.
- **IMPLEMENTED:** Complete budget management (`POST`, `GET`, `PUT`, `DELETE` at `/api/budgets`) with dynamic spending calculations (`spentAmount`, `remainingAmount`, `percentageUsed`, `isExceeded`), monthly budget limit tracking, and compound unique validation.
- **IMPLEMENTED:** Full React + Vite frontend with dashboard, transactions, budgets, and reports pages.

## Technology Stack
- Node.js
- Express.js
- MongoDB & Mongoose
- JSON Web Tokens (JWT)
- bcrypt.js

## Architecture
The application follows a standard layered architectural pattern:
- **Routes:** API endpoint definitions.
- **Controllers:** Request/response handling and status codes.
- **Services:** Business logic, query filtering, aggregations, and database operations.
- **Validators:** Express middleware for request schema and param validation.
- **Models:** Database schemas, indexes, and data access.

For detailed architecture, see [docs/BACKEND_ARCHITECTURE.md](./docs/BACKEND_ARCHITECTURE.md).

## Project Structure
```text
FinTrack_backend/
├── docs/                     # Architecture and design documents
├── src/
│   ├── config/               # Configuration files (DB connection)
│   ├── controllers/          # Request handlers (authController, transactionController, dashboardController, budgetController)
│   ├── middleware/           # Custom Express middlewares (Auth, Error)
│   ├── models/               # Mongoose schemas (User, Transaction, Budget)
│   ├── routes/               # Express routers (authRoutes, transactionRoutes, dashboardRoutes, budgetRoutes)
│   ├── services/             # Business logic (authService, transactionService, dashboardService, budgetService)
│   ├── utils/                # Helper functions (jwt)
│   ├── validators/           # Request validators (authValidator, transactionValidator, dashboardValidator, budgetValidator)
│   ├── app.js                # Express application configuration
│   └── server.js             # Entry point
├── auth.test.js              # Authentication test suite
├── transaction.test.js       # Transaction management test suite
├── dashboard.test.js         # Dashboard API & calculations test suite
├── budget.test.js            # Budget management & progress test suite
├── .env.example              # Environment variables template
├── .gitignore                # Git ignore rules
└── package.json              # Dependencies and scripts
```

## Database
Uses MongoDB with Mongoose ODM. Includes collections for Users, Transactions, and Budgets with strict user isolation.
See [docs/DATABASE_DESIGN.md](./docs/DATABASE_DESIGN.md) for details.

## API Design & Endpoints

### 1. Authentication (`/api/auth`)
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Authenticate user & get JWT token
- `GET /api/auth/me` - Get current logged-in user details (requires `Bearer <token>`)

### 2. Transaction Management (`/api/transactions`)
All transaction endpoints require a valid JWT in the `Authorization` header (`Bearer <token>`). Transactions are strictly isolated to the authenticated user.

- **`POST /api/transactions`** - Create a transaction
  - Body: `{ "type": "income"|"expense", "amount": 45.5, "category": "Food", "description": "Lunch", "date": "2026-10-12" }`
  - Response: `201 Created`
- **`GET /api/transactions`** - List transactions with optional search and filtering
  - Query parameters:
    - `type`: `income` or `expense`
    - `category`: Category name (case-insensitive exact match)
    - `search`: Safe case-insensitive keyword search in description
    - `startDate`: Start date (`YYYY-MM-DD` or ISO)
    - `endDate`: End date (`YYYY-MM-DD` or ISO)
  - Examples:
    - `GET /api/transactions?type=expense&category=Food`
    - `GET /api/transactions?search=coffee`
    - `GET /api/transactions?startDate=2026-10-01&endDate=2026-10-31`
  - Response: `200 OK`
- **`GET /api/transactions/:id`** - Get single transaction by ID
  - Response: `200 OK` (or `404 Not Found` if nonexistent or owned by another user)
- **`PUT /api/transactions/:id`** - Update an existing transaction
  - Modifiable fields: `type`, `amount`, `category`, `description`, `date`.
  - Transaction ownership (`userId`) and `_id` cannot be modified.
  - Response: `200 OK`
- **`DELETE /api/transactions/:id`** - Delete a transaction
  - Response: `200 OK`

### 3. Dashboard API & Financial Calculations (`/api/dashboard`)
Requires a valid JWT in the `Authorization` header (`Bearer <token>`). Aggregates data strictly for the authenticated user.

- **`GET /api/dashboard`** - Get financial summary, expense category breakdown, time-series, and recent transactions
  - Query parameters (optional):
    - `month`: Integer `1` to `12` (defaults to current month)
    - `year`: 4-digit integer (defaults to current year)
  - Example: `GET /api/dashboard?month=10&year=2026`
  - Calculations:
    - `summary.totalIncome`: Sum of all income transactions in the selected month
    - `summary.totalExpenses`: Sum of all expense transactions in the selected month
    - `summary.balance`: `totalIncome - totalExpenses`
    - `expenseBreakdown`: Category totals & percentage shares for expenses only, sorted descending
    - `incomeVsExpenses`: Chronologically ordered daily totals (`{ date, income, expense }`)
    - `recentTransactions`: Latest 5 transactions for the authenticated user (`date: -1`, `createdAt: -1`)
  - Response: `200 OK`

### 4. Budget Management (`/api/budgets`)
Requires a valid JWT in the `Authorization` header (`Bearer <token>`). Budgets are scoped to the authenticated user with a unique compound index on `userId + category + month + year`.

- **`POST /api/budgets`** - Set monthly spending limit for a category
  - Body: `{ "category": "Food", "amount": 15000, "month": 10, "year": 2026 }`
  - Response: `201 Created`
- **`GET /api/budgets`** - Get user budgets with spending progress calculations
  - Query parameters (optional):
    - `month`: Integer `1` to `12` (defaults to current month)
    - `year`: 4-digit integer (defaults to current year)
    - `category`: Category name filter
  - Example: `GET /api/budgets?month=10&year=2026`
  - Response: `200 OK`
- **`GET /api/budgets/:id`** - Get single budget with spending progress
  - Response: `200 OK`
- **`PUT /api/budgets/:id`** - Update budget limit or category
  - Modifiable fields: `category`, `amount`, `month`, `year`
  - Response: `200 OK`
- **`DELETE /api/budgets/:id`** - Delete a budget
  - Response: `200 OK`

#### Spending Progress Metrics (calculated from matching `expense` transactions):
- `budgetAmount`: Configured budget limit
- `spentAmount`: Total matching expense transactions in the month
- `remainingAmount`: `budgetAmount - spentAmount` (negative when exceeded)
- `percentageUsed`: `(spentAmount / budgetAmount) * 100` (accurate even when > 100%)
- `isExceeded`: Boolean indicating whether `spentAmount > budgetAmount`

See [docs/API_DESIGN.md](./docs/API_DESIGN.md) for detailed payload schemas and error specifications.

## Environment Variables
Create a `.env` file in the root directory based on `.env.example`:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/fintrack
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=30d
```

## How to run the backend
1. Install dependencies: `npm install`
2. Create your `.env` file (see Environment Variables section)
3. Start development server: `npm run dev`

## How to run automated tests
Automated tests use Node.js's native test runner (`node:test`) and supertest:
```bash
# Run all tests (Authentication + Transactions + Dashboard + Budgets)
npm test

# Run only authentication tests
node --test auth.test.js

# Run only transaction tests
node --test transaction.test.js

# Run only dashboard tests
node --test dashboard.test.js

# Run only budget tests
node --test budget.test.js
```
*(Tests connect to local MongoDB or automatically fall back to an isolated in-memory Mongo instance for test runs).*
