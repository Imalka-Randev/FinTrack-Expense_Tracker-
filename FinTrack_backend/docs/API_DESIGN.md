# API Design Document

## Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Authenticate user & get token
- `GET /api/auth/me` - Get current logged in user details

## Transactions
- `GET /api/transactions` - Get all transactions for the logged-in user
  - Query parameters supported:
    - `type`: `income` or `expense`
    - `category`: e.g. `Food`, `Rent`
    - `search`: Keyword search in description or category
    - `startDate`, `endDate`: Date range filtering (`YYYY-MM-DD`)
- `GET /api/transactions/:id` - Get a specific transaction by ID
- `POST /api/transactions` - Add a new transaction
- `PUT /api/transactions/:id` - Update an existing transaction
- `DELETE /api/transactions/:id` - Delete a transaction

## Budgets
- `GET /api/budgets` - Get all budgets for the logged-in user
- `GET /api/budgets/:id` - Get a specific budget by ID
- `POST /api/budgets` - Create a new budget limit for a category
- `PUT /api/budgets/:id` - Update an existing budget
- `DELETE /api/budgets/:id` - Delete a budget

## Dashboard
- `GET /api/dashboard` - Get dashboard summary data (total income, total expenses, balance, budget progress)
