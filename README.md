# Automated System of Agriculture Cooperatives (ASAC)

ASAC is a full-stack web application for the Federation of Agriculture Cooperatives in Camarines Sur (FACCS).  
It supports cooperative operations from farmer registry to order fulfillment and accounting.

## Core Modules

1. Cooperative and Farmer Registry  
2. Order and Transaction Management  
3. FarmLedger Accounting

## Tech Stack

### Frontend
- React 19
- TypeScript
- Vite
- Tailwind CSS v4
- shadcn/ui
- React Router
- Axios

### Backend
- Node.js
- Express
- Sequelize
- MySQL
- JWT Authentication
- Bcrypt/Bcryptjs

## Repository Structure

```text
.
├── backend/      # Express API, Sequelize models, migrations, seeders
├── frontend/     # React application
├── context/      # Project context, architecture, and progress docs
└── ASAC - Project-Specification.md
```

## Backend API Domains

- `/api/auth` - login and current user
- `/api/cooperatives` - cooperative management
- `/api/profile` - profile and account management
- `/api/farmers` - farmer registry and membership
- `/api/orders` - buyer orders
- `/api/assignments` - cooperative/farmer assignment workflow
- `/api/deliveries` - delivery records and delivery completion
- `/api/ledger` - summaries, farmer ledgers, loans, and statements

## Prerequisites

- Node.js 20+
- npm
- MySQL 8+

## Local Setup

### 1) Clone and install dependencies

```bash
# backend
cd backend
npm install

# frontend
cd ../frontend
npm install
```

### 2) Configure backend environment

Create:

- `backend/.env.development.local`

Set values similar to:

```env
PORT=8800
NODE_ENV=development
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_DATABASE=asac_db
JWT_SECRET=your_secret
JWT_EXPIRES_IN=1d
```

### 3) Run database migrations and seeders

```bash
cd backend
npx sequelize-cli db:migrate
npx sequelize-cli db:seed:all
```

### 4) Start backend

```bash
cd backend
npm run dev
```

Backend runs at `http://localhost:8800`.

### 5) Start frontend

```bash
cd frontend
npm run dev
```

Frontend runs at `http://localhost:5173` (default Vite port).

## Available Scripts

### Backend
- `npm run dev` - start API with nodemon
- `npm start` - start API with node

### Frontend
- `npm run dev` - run Vite dev server
- `npm run build` - type-check and build production assets
- `npm run lint` - run ESLint
- `npm run preview` - preview production build

## User Roles

- FACCS Admin: federation-level operations and oversight
- Coop Officer: cooperative-level farmer and assignment management
- Farmer: view-focused access to personal ledger and statement
