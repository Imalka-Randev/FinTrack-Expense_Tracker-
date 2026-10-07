# FinTrack Backend

FinTrack – Expense & Budget Tracker backend application providing a RESTful API for managing personal finances.

## Current Development Status
**NOTE:** This project is currently in the backend foundation/design phase. Complete authentication, CRUD operations, dashboard calculations, and the frontend are NOT yet implemented. They are planned for future development phases.

## Technology Stack
- Node.js
- Express.js
- MongoDB & Mongoose
- JSON Web Tokens (JWT)
- bcrypt.js

## Architecture
The application follows a standard layered architectural pattern:
- **Routes:** API endpoint definitions.
- **Controllers:** Request/response handling.
- **Services:** Business logic.
- **Models:** Database schemas and data access.

For detailed architecture, see [docs/BACKEND_ARCHITECTURE.md](./docs/BACKEND_ARCHITECTURE.md).

## Project Structure
```text
FinTrack_backend/
├── docs/             # Architecture and design documents
├── src/
│   ├── config/       # Configuration files (DB connection)
│   ├── controllers/  # Request handlers
│   ├── middleware/   # Custom Express middlewares (Auth, Error)
│   ├── models/       # Mongoose schemas
│   ├── routes/       # Express routers
│   ├── services/     # Business logic
│   ├── utils/        # Helper functions
│   ├── validators/   # Request validators
│   ├── app.js        # Express application configuration
│   └── server.js     # Entry point
├── .env.example      # Environment variables template
├── .gitignore        # Git ignore rules
└── package.json      # Dependencies and scripts
```

## Database
Uses MongoDB with Mongoose ODM. Includes collections for Users, Transactions, and Budgets with strict user isolation.
See [docs/DATABASE_DESIGN.md](./docs/DATABASE_DESIGN.md) for details.

## API Design
RESTful endpoints for Authentication, Transactions, Budgets, and Dashboard summary.
See [docs/API_DESIGN.md](./docs/API_DESIGN.md) for details.

## Environment Variables
Create a `.env` file in the root directory based on `.env.example`:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/fintrack
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=30d
```

## Local Development
1. Install dependencies: `npm install`
2. Start development server: `npm run dev`
