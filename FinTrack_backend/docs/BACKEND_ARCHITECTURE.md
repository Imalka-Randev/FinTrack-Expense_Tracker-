# Backend Architecture Document

## Project Purpose
The backend provides a RESTful API for the FinTrack application, handling user authentication, transaction tracking, budget management, and dashboard data aggregation while ensuring strict user data isolation and security.

## Backend Architecture
The application follows a clean layered architecture, primarily utilizing the Controller-Service-Model pattern.

## Folder Responsibilities
- **src/routes/**: Defines API endpoints and connects them to appropriate middleware and controllers.
- **src/middleware/**: Handles request interception, such as JWT authentication, validation checks, and centralized error handling.
- **src/controllers/**: Receives incoming HTTP requests, extracts and validates request data, delegates business logic to the service layer, and formats the HTTP response.
- **src/services/**: Contains core business logic, complex calculations, and interfaces with the models for database operations.
- **src/models/**: Defines Mongoose schemas, data validation rules, and indexes. Maps to MongoDB collections.
- **src/config/**: Contains configuration files (e.g., database connection logic).
- **src/utils/**: Reusable helper functions and generic utilities.
- **src/validators/**: Specific request validation rules (e.g., using Joi or express-validator).

## Request-Response Flow
Client Request -> Route -> Middleware (Auth/Validation) -> Controller -> Service -> Model -> MongoDB -> Model -> Service -> Controller -> Client Response

## Authentication Flow Overview
1. User provides credentials to `/api/auth/login`.
2. Controller delegates to Auth Service to verify credentials.
3. If valid, a JSON Web Token (JWT) is generated.
4. The JWT is returned to the client and must be included in the `Authorization` header (`Bearer <token>`) for subsequent protected requests.

## Database Integration Overview
- MongoDB is the primary database, interfaced via Mongoose ODM.
- Connection is established once at startup (`config/db.js`).

## Error Handling Strategy
- Centralized error handling middleware (`src/middleware/errorMiddleware.js`) catches unhandled errors and formatting consistent JSON responses.
- Standardized Response Format:
  - Success: `{ "success": true, "data": { ... } }`
  - Error: `{ "success": false, "message": "...", "errors": [...] }`

## Environment Variable Strategy
- Configuration values (DB URIs, secrets, ports) are injected via `.env` file (using `dotenv`).
- `.env` is never committed to version control.
- `.env.example` provides a template for required keys.

## Security Considerations
- **Password Hashing:** Passwords are hashed using `bcrypt.js` before saving.
- **Authentication:** Stateless authentication using JWT.
- **Protected Routes:** Middleware enforces authentication for all data-access routes.
- **Data Isolation:** All database queries for transactions/budgets filter by `userId` to ensure users only access their own data.
- **Input Validation:** Required to prevent injection and data corruption.
- **CORS Configuration:** Restricts API access to authorized frontend domains.
