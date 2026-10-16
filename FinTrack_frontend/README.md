# FinTrack Frontend

React + Vite frontend for the FinTrack personal finance management application.

Built with **React v19**, **Vite v8**, **Tailwind CSS v4**, and **React Router v7**.

## Getting Started

### Install dependencies

```bash
npm install
```

### Configure environment

Create a `.env` file in this directory:

```env
VITE_API_BASE_URL=http://localhost:5001/api
```

### Start development server

```bash
npm run dev
```

The app will run at **http://localhost:5173**

## Build for production

```bash
npm run build
npm run preview
```

## Project Structure

```text
src/
├── components/
│   ├── common/         # Reusable UI (Button, Input, Select, Modal, Badge...)
│   ├── dashboard/      # Charts and summary cards
│   ├── transactions/   # Transaction table, filters, form modal
│   └── budgets/        # Budget card and form modal
├── context/            # AuthContext, ToastContext
├── hooks/              # useAuth, useToast
├── layouts/            # AppLayout, Sidebar, TopNavbar
├── pages/              # LoginPage, RegisterPage, DashboardPage, TransactionsPage, BudgetsPage, ReportsPage
├── services/           # Axios API wrappers
└── utils/              # Formatters, constants, exportUtils
```

## Technologies

- [React 19](https://react.dev/)
- [Vite 8](https://vite.dev/)
- [Tailwind CSS 4](https://tailwindcss.com/)
- [React Router 7](https://reactrouter.com/)
- [Recharts](https://recharts.org/) — data visualization
- [Axios](https://axios-http.com/) — API requests
- [Lucide React](https://lucide.dev/) — icons
