# Data Flow Document

## A. User Registration
```text
Frontend
↓
POST /api/auth/register
↓
Auth Route
↓
Auth Controller
↓
Validation
↓
Password hashing
↓
User Service
↓
User Model
↓
MongoDB
↓
Response
```

## B. Login
```text
Frontend
↓
POST /api/auth/login
↓
Controller
↓
Find user
↓
Compare password
↓
Generate JWT
↓
Return authentication response
```

## C. Add Expense
```text
Frontend
↓
POST /api/transactions
↓
JWT Authentication Middleware
↓
Transaction Controller
↓
Validation
↓
Transaction Service
↓
Transaction Model
↓
MongoDB
↓
Response
```

## D. Get Dashboard
```text
Frontend
↓
GET /api/dashboard
↓
JWT Middleware
↓
Dashboard Controller
↓
Dashboard Service
↓
Transaction/Budget Models
↓
Calculate:
- total income
- total expenses
- balance
- budget progress
↓
Response
```
