# API Design Document

## Authentication (IMPLEMENTED)
- `POST /api/auth/register` - Register a new user
  - **Body:** `{ "name": "...", "email": "...", "password": "..." }`
  - **Success (201):** `{ "success": true, "message": "...", "data": { "user": { "id": "...", "name": "...", "email": "..." } } }`
  - **Error (400):** `{ "success": false, "message": "Email already exists" }`
- `POST /api/auth/login` - Authenticate user & get token
  - **Body:** `{ "email": "...", "password": "..." }`
  - **Success (200):** `{ "success": true, "message": "...", "data": { "token": "...", "user": { "id": "...", "name": "...", "email": "..." } } }`
  - **Error (401):** `{ "success": false, "message": "Invalid email or password" }`
- `GET /api/auth/me` - Get current logged in user details
  - **Headers:** `Authorization: Bearer <token>`
  - **Success (200):** `{ "success": true, "message": "...", "data": { "user": { "id": "...", "name": "...", "email": "..." } } }`
  - **Error (401):** `{ "success": false, "message": "Not authorized, token failed" }`

## Transactions (IMPLEMENTED)
All transaction endpoints require a valid JWT token in the `Authorization` header (`Bearer <token>`).

- `POST /api/transactions` - Add a new transaction
  - **Headers:** `Authorization: Bearer <token>`
  - **Body:**
    ```json
    {
      "type": "expense", // "income" or "expense" (required)
      "amount": 45.5,    // Finite number > 0 (required)
      "category": "Food", // Non-empty string (required)
      "description": "Lunch at bistro", // String, max 500 chars (optional)
      "date": "2026-10-05T12:00:00.000Z" // Valid date string (optional, defaults to now)
    }
    ```
  - **Success (201):**
    ```json
    {
      "success": true,
      "message": "Transaction created successfully",
      "data": {
        "transaction": {
          "_id": "670aa123...",
          "userId": "670aa001...",
          "type": "expense",
          "amount": 45.5,
          "category": "Food",
          "description": "Lunch at bistro",
          "date": "2026-10-05T12:00:00.000Z",
          "createdAt": "2026-10-12T...",
          "updatedAt": "2026-10-12T..."
        }
      }
    }
    ```
  - **Error (400):** `{ "success": false, "message": "Amount is required and must be a finite number greater than 0" }`
  - **Error (401):** `{ "success": false, "message": "Not authorized, token failed" }`

- `GET /api/transactions` - Get all transactions for the logged-in user
  - **Headers:** `Authorization: Bearer <token>`
  - **Query Parameters (optional):**
    - `type`: Filter by type (`income` or `expense`)
    - `category`: Filter by category name (case-insensitive exact match)
    - `search`: Keyword search in transaction description (case-insensitive, regex-safe)
    - `startDate`: Filter transactions on or after this date (`YYYY-MM-DD` or ISO string)
    - `endDate`: Filter transactions on or before this date (`YYYY-MM-DD` or ISO string)
  - **Example Requests:**
    - `GET /api/transactions?type=expense&category=Food`
    - `GET /api/transactions?search=coffee`
    - `GET /api/transactions?startDate=2026-10-01&endDate=2026-10-31`
  - **Success (200):**
    ```json
    {
      "success": true,
      "count": 1,
      "data": {
        "transactions": [
          {
            "_id": "670aa123...",
            "userId": "670aa001...",
            "type": "expense",
            "amount": 45.5,
            "category": "Food",
            "description": "Lunch at bistro",
            "date": "2026-10-05T12:00:00.000Z",
            "createdAt": "2026-10-12T...",
            "updatedAt": "2026-10-12T..."
          }
        ]
      }
    }
    ```
  - **Error (400):** `{ "success": false, "message": "Invalid 'startDate' query parameter format" }`
  - **Error (401):** `{ "success": false, "message": "Not authorized, no token" }`

- `GET /api/transactions/:id` - Get a specific transaction by ID
  - **Headers:** `Authorization: Bearer <token>`
  - **Success (200):**
    ```json
    {
      "success": true,
      "data": {
        "transaction": {
          "_id": "670aa123...",
          "userId": "670aa001...",
          "type": "expense",
          "amount": 45.5,
          "category": "Food",
          "description": "Lunch at bistro",
          "date": "2026-10-05T12:00:00.000Z"
        }
      }
    }
    ```
  - **Error (400):** `{ "success": false, "message": "Invalid transaction ID format" }`
  - **Error (404):** `{ "success": false, "message": "Transaction not found" }`

- `PUT /api/transactions/:id` - Update an existing transaction
  - **Headers:** `Authorization: Bearer <token>`
  - **Body (at least one field required):**
    ```json
    {
      "amount": 55.0,
      "description": "Updated lunch description"
    }
    ```
  - **Success (200):**
    ```json
    {
      "success": true,
      "message": "Transaction updated successfully",
      "data": {
        "transaction": {
          "_id": "670aa123...",
          "userId": "670aa001...",
          "type": "expense",
          "amount": 55.0,
          "category": "Food",
          "description": "Updated lunch description",
          "date": "2026-10-05T12:00:00.000Z"
        }
      }
    }
    ```
  - **Error (400):** `{ "success": false, "message": "Cannot modify transaction ownership" }`
  - **Error (404):** `{ "success": false, "message": "Transaction not found" }`

- `DELETE /api/transactions/:id` - Delete a transaction
  - **Headers:** `Authorization: Bearer <token>`
  - **Success (200):**
    ```json
    {
      "success": true,
      "message": "Transaction deleted successfully"
    }
    ```
  - **Error (400):** `{ "success": false, "message": "Invalid transaction ID format" }`
  - **Error (404):** `{ "success": false, "message": "Transaction not found" }`

## Dashboard (IMPLEMENTED)
- `GET /api/dashboard` - Get financial summary, expense category breakdown, income vs. expense time-series, and latest 5 transactions.
  - **Headers:** `Authorization: Bearer <token>`
  - **Query Parameters (optional):**
    - `month`: Integer from `1` to `12` (defaults to current month)
    - `year`: Valid 4-digit integer (defaults to current year)
  - **Example Request:**
    - `GET /api/dashboard?month=10&year=2026`
  - **Calculation Rules:**
    - `summary.totalIncome`: Sum of all `income` transactions within the selected month.
    - `summary.totalExpenses`: Sum of all `expense` transactions within the selected month.
    - `summary.balance`: Calculated as `totalIncome - totalExpenses`.
    - `expenseBreakdown`: Expenses grouped by category, calculating total amount and percentage of total monthly expenses, sorted descending. Income transactions are excluded.
    - `incomeVsExpenses`: Daily time-series breakdown within the month (`{ date: "YYYY-MM-DD", income, expense }`), ordered chronologically.
    - `recentTransactions`: Latest 5 transactions for the authenticated user, sorted by date (`date: -1`) and creation time (`createdAt: -1`).
    - When no transactions exist in the selected month, returns zero totals (`totalIncome: 0, totalExpenses: 0, balance: 0`) and empty arrays (`[]`).
  - **Success (200):**
    ```json
    {
      "success": true,
      "data": {
        "month": 10,
        "year": 2026,
        "summary": {
          "totalIncome": 3500,
          "totalExpenses": 500,
          "balance": 3000
        },
        "expenseBreakdown": [
          {
            "category": "Food",
            "amount": 200,
            "percentage": 40
          },
          {
            "category": "Utilities",
            "amount": 200,
            "percentage": 40
          },
          {
            "category": "Entertainment",
            "amount": 100,
            "percentage": 20
          }
        ],
        "incomeVsExpenses": [
          {
            "date": "2026-10-01",
            "income": 3000,
            "expense": 0
          },
          {
            "date": "2026-10-02",
            "income": 0,
            "expense": 150
          }
        ],
        "recentTransactions": [
          {
            "_id": "670aa123...",
            "type": "expense",
            "amount": 100,
            "category": "Entertainment",
            "description": "Concert tickets",
            "date": "2026-10-20T20:00:00.000Z",
            "createdAt": "2026-10-12T..."
          }
        ]
      }
    }
    ```
  - **Error (400):** `{ "success": false, "message": "Month must be an integer between 1 and 12" }`
  - **Error (400):** `{ "success": false, "message": "Year must be a valid 4-digit year" }`
  - **Error (401):** `{ "success": false, "message": "Not authorized, token failed" }`

## Budgets (IMPLEMENTED)
All budget endpoints require a valid JWT token in the `Authorization` header (`Bearer <token>`). Each user can have only one budget per category, month, and year (enforced by unique compound index).

### Spending Progress Calculations
Progress metrics are calculated dynamically from actual matching `expense` transactions:
- `budgetAmount`: The configured spending limit (`amount`).
- `spentAmount`: Total sum of matching `expense` transactions for that user, category, month, and year.
- `remainingAmount`: `budgetAmount - spentAmount` (negative when budget is exceeded).
- `percentageUsed`: `(spentAmount / budgetAmount) * 100` (accurate even when > 100%).
- `isExceeded`: Boolean indicating whether `spentAmount > budgetAmount`.

- `POST /api/budgets` - Create a new budget limit for a category
  - **Headers:** `Authorization: Bearer <token>`
  - **Body:**
    ```json
    {
      "category": "Food", // Non-empty string, max 100 chars (required)
      "amount": 15000,    // Finite number > 0 (required)
      "month": 10,        // Integer 1 to 12 (required)
      "year": 2026        // 4-digit integer (required)
    }
    ```
  - **Success (201):**
    ```json
    {
      "success": true,
      "message": "Budget created successfully",
      "data": {
        "budget": {
          "_id": "670ab890...",
          "userId": "670aa001...",
          "category": "Food",
          "amount": 15000,
          "budgetAmount": 15000,
          "spentAmount": 0,
          "remainingAmount": 15000,
          "percentageUsed": 0,
          "isExceeded": false,
          "month": 10,
          "year": 2026,
          "createdAt": "2026-10-12T...",
          "updatedAt": "2026-10-12T..."
        }
      }
    }
    ```
  - **Error (400):** `{ "success": false, "message": "A budget for this category, month, and year already exists" }`
  - **Error (400):** `{ "success": false, "message": "Budget amount is required and must be a finite number greater than 0" }`
  - **Error (401):** `{ "success": false, "message": "Not authorized, token failed" }`

- `GET /api/budgets` - Get all budgets for the logged-in user with spending progress
  - **Headers:** `Authorization: Bearer <token>`
  - **Query Parameters (optional):**
    - `month`: Filter by month (`1` to `12`, defaults to current month)
    - `year`: Filter by year (`YYYY`, defaults to current year)
    - `category`: Filter by category name (case-insensitive exact match)
  - **Example Request:**
    - `GET /api/budgets?month=10&year=2026`
    - `GET /api/budgets?category=Food`
  - **Success (200):**
    ```json
    {
      "success": true,
      "count": 1,
      "data": {
        "budgets": [
          {
            "_id": "670ab890...",
            "userId": "670aa001...",
            "category": "Food",
            "amount": 15000,
            "budgetAmount": 15000,
            "spentAmount": 8500,
            "remainingAmount": 6500,
            "percentageUsed": 56.67,
            "isExceeded": false,
            "month": 10,
            "year": 2026,
            "createdAt": "2026-10-12T...",
            "updatedAt": "2026-10-12T..."
          }
        ]
      }
    }
    ```
  - **Error (400):** `{ "success": false, "message": "Month must be an integer between 1 and 12" }`
  - **Error (401):** `{ "success": false, "message": "Not authorized, no token" }`

- `GET /api/budgets/:id` - Get a specific budget by ID with spending progress
  - **Headers:** `Authorization: Bearer <token>`
  - **Success (200):**
    ```json
    {
      "success": true,
      "message": "Budget retrieved successfully",
      "data": {
        "budget": {
          "_id": "670ab890...",
          "userId": "670aa001...",
          "category": "Food",
          "amount": 15000,
          "budgetAmount": 15000,
          "spentAmount": 8500,
          "remainingAmount": 6500,
          "percentageUsed": 56.67,
          "isExceeded": false,
          "month": 10,
          "year": 2026,
          "createdAt": "2026-10-12T...",
          "updatedAt": "2026-10-12T..."
        }
      }
    }
    ```
  - **Error (400):** `{ "success": false, "message": "Invalid budget ID format" }`
  - **Error (404):** `{ "success": false, "message": "Budget not found" }`

- `PUT /api/budgets/:id` - Update a budget's spending limit or category
  - **Headers:** `Authorization: Bearer <token>`
  - **Body (at least one valid field):**
    ```json
    {
      "amount": 20000
    }
    ```
  - **Success (200):**
    ```json
    {
      "success": true,
      "message": "Budget updated successfully",
      "data": {
        "budget": {
          "_id": "670ab890...",
          "userId": "670aa001...",
          "category": "Food",
          "amount": 20000,
          "budgetAmount": 20000,
          "spentAmount": 8500,
          "remainingAmount": 11500,
          "percentageUsed": 42.5,
          "isExceeded": false,
          "month": 10,
          "year": 2026,
          "createdAt": "2026-10-12T...",
          "updatedAt": "2026-10-12T..."
        }
      }
    }
    ```
  - **Error (400):** `{ "success": false, "message": "A budget for this category, month, and year already exists" }`
  - **Error (400):** `{ "success": false, "message": "Cannot modify budget ownership" }`
  - **Error (404):** `{ "success": false, "message": "Budget not found" }`

- `DELETE /api/budgets/:id` - Delete a budget
  - **Headers:** `Authorization: Bearer <token>`
  - **Success (200):**
    ```json
    {
      "success": true,
      "message": "Budget deleted successfully"
    }
    ```
  - **Error (400):** `{ "success": false, "message": "Invalid budget ID format" }`
  - **Error (404):** `{ "success": false, "message": "Budget not found" }`



