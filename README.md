# Automated System of Agriculture Cooperatives (ASAC)

ASAC is a full-stack web application built for the Federation of Agriculture Cooperatives in Camarines Sur (FACCS). It manages cooperative operations end-to-end: farmer registration, order fulfillment, delivery tracking, and financial accounting.

---

## Core Modules

1. **Cooperative and Farmer Registry** -- Managing federation cooperatives and farmer memberships with role-based access.
2. **Order and Transaction Management** -- Handling the referral process from buyer intake, cooperative assignment, farmer fulfillment, to delivery completion.
3. **FarmLedger Accounting** -- Automated sales, fee, share capital, and loan tracking with printable farmer balance sheets and visual analytics.

---

## Tech Stack

### Frontend

- React 19 with TypeScript
- Vite (dev server and build tool)
- Tailwind CSS v4
- shadcn/ui component library
- Recharts (data visualization)
- React Router v6 (client-side routing)
- Axios (HTTP client)

### Backend

- Node.js with Express
- Sequelize ORM
- MySQL 8
- JWT authentication with Bcrypt
- Stored procedures for transactional accounting logic

### Infrastructure

- Docker Compose for local MySQL provisioning

---

## Repository Structure

```text
.
├── backend/          # Express API, Sequelize models, migrations, seeders
│   ├── config/       # Database configuration
│   ├── migrations/   # Schema and stored procedure migrations
│   ├── models/       # Sequelize model definitions
│   ├── routes/       # API route handlers
│   ├── seeders/      # Demo data seeders
│   └── uploads/      # Product image uploads
├── frontend/         # React application
│   ├── src/
│   │   ├── components/   # Reusable UI components (shadcn, layout, etc.)
│   │   ├── context/      # Auth context provider
│   │   ├── lib/          # Utilities (theme, money formatting)
│   │   └── pages/        # Route-level page components
│   └── public/
├── context/          # Project context, architecture, and progress docs
├── docker-compose.yml
├── GEMINI.md         # AI agent entry point and operating rules
└── ASAC - Project-Specification.md
```

---

## API Endpoints

| Domain               | Description                                          |
| -------------------- | ---------------------------------------------------- |
| `/api/auth`          | Login and current user session                       |
| `/api/profile`       | User profile and account management                  |
| `/api/cooperatives`  | Cooperative CRUD and partnership requests             |
| `/api/farmers`       | Farmer registry, membership, and cooperative linkage  |
| `/api/products`      | Product inventory and crop management                |
| `/api/orders`        | Buyer order intake and lifecycle                     |
| `/api/assignments`   | Cooperative and farmer assignment workflow            |
| `/api/deliveries`    | Delivery records and atomic delivery completion      |
| `/api/ledger`        | Federation/coop summaries, farmer ledgers, loans, statements, monthly trends |
| `/api/dashboard`     | Dashboard statistics and aggregated views            |
| `/api/notifications` | In-app notification feed                             |
| `/api/requests`      | Partnership and registration request management      |

---

## Prerequisites

- Node.js 20 or later
- npm
- MySQL 8 or later (or use the included Docker Compose file)

---

## Local Setup

### 1. Clone and install dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Provision the database

Option A -- Use Docker Compose (recommended):

```bash
docker compose up -d
```

This starts a MySQL 8 container on port 3306 with database `asac_db`.

Option B -- Use an existing MySQL instance and configure credentials in `backend/config/config.json`.

### 3. Run database migrations and seeders

```bash
cd backend
npx sequelize-cli db:migrate
npx sequelize-cli db:seed:all
```

This creates all tables, stored procedures, indexes, and populates demo data (37 sales records, 148 fee records, 17 loans across 15 cooperatives).

### 4. Start the backend

```bash
cd backend
npm run dev
```

The API runs at `http://localhost:8800`.

### 5. Start the frontend

```bash
cd frontend
npm run dev
```

The application runs at `http://localhost:5173`.

---

## Default Seeded Accounts

| Role    | Email                | Password  |
| ------- | -------------------- | --------- |
| Admin   | admin@faccs.org      | password  |
| Officer | officer1@faccs.org   | password  |
| Farmer  | farmer1@faccs.org    | password  |

---

## Available Scripts

### Backend

| Command         | Description                        |
| --------------- | ---------------------------------- |
| `npm run dev`   | Start API with nodemon (auto-reload) |
| `npm start`     | Start API with node                |

### Frontend

| Command             | Description                        |
| ------------------- | ---------------------------------- |
| `npm run dev`       | Run Vite dev server                |
| `npm run build`     | Type-check and build for production |
| `npm run lint`      | Run ESLint                         |
| `npm run preview`   | Preview production build           |

### Database

| Command                                    | Description                  |
| ------------------------------------------ | ---------------------------- |
| `npx sequelize-cli db:migrate`             | Run pending migrations       |
| `npx sequelize-cli db:migrate:undo:all`    | Revert all migrations        |
| `npx sequelize-cli db:seed:all`            | Run all seeders              |
| `npx sequelize-cli db:seed:undo:all`       | Revert all seeders           |

---

## User Roles

**FACCS Admin** -- Full federation-level access. Manages cooperatives, views all farmer registries, creates buyer orders, manages deliveries, and monitors financial summaries across all cooperatives.

**Cooperative Officer** -- Cooperative-level access. Manages farmer memberships within their cooperative, handles assignment fulfillment, and views cooperative-specific ledger and accounting data.

**Farmer** -- View-only access to personal ledger, loan records, and printable balance sheet statements.

---

## Key Features

- Role-based authentication and protected route system
- Two-tier organizational structure (Federation and Cooperative levels)
- Full order lifecycle: intake, cooperative assignment, farmer fulfillment, delivery, and accounting
- Atomic delivery completion via MySQL stored procedures with proportional sales generation
- FarmLedger with interactive charts (Recharts): monthly trends, revenue distribution, cooperative comparisons
- Printable farmer balance sheet with print-optimized CSS
- Product inventory with image upload and automatic compression
- Dark mode support
- Responsive sidebar navigation with collapsible layout
