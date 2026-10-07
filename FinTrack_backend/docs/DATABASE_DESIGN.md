# Database Design Document

## 1. User Collection
Stores user account and authentication information.
- `_id`: ObjectId
- `name`: String (Required)
- `email`: String (Required, Unique)
- `password`: String (Required, Hashed)
- `createdAt`, `updatedAt`: Timestamps

## 2. Transaction Collection
Stores individual income and expense records.
- `_id`: ObjectId
- `userId`: ObjectId (Ref: User)
- `type`: String (Enum: 'income', 'expense')
- `amount`: Number (Required, Min: 0.01)
- `category`: String (Required)
- `description`: String
- `date`: Date (Required)
- `createdAt`, `updatedAt`: Timestamps

## 3. Budget Collection
Stores monthly budget limits per category.
- `_id`: ObjectId
- `userId`: ObjectId (Ref: User)
- `category`: String (Required)
- `amount`: Number (Required)
- `month`: Number (1-12)
- `year`: Number (YYYY)
- `createdAt`, `updatedAt`: Timestamps

## 4. Relationships
```text
User
 │
 ├──────< Transactions
 │
 └──────< Budgets
```

## 5. User Data Isolation
- One User can have many Transactions.
- One User can have many Budgets.
- Each Transaction belongs to exactly one User.
- Each Budget belongs to exactly one User.
- Queries involving transactions and budgets MUST always include the authenticated user's ID (`userId: req.user._id`) to prevent cross-user data access.

## 6. Validation Rules
- Enforced at the Mongoose schema level.
- Emails must be valid format and unique.
- Transaction amounts must be greater than 0.
- Compound index on `userId, category, month, year` ensures only one budget per category per month for a user.
