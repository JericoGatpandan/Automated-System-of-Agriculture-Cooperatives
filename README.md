# Automated System of Agriculture Cooperatives (ASAC)

ASAC is a full-stack web application built for the Federation of Agriculture Cooperatives in Camarines Sur (FACCS). It manages cooperative operations end-to-end: farmer registration, order fulfillment, delivery tracking, and financial accounting.

---

## Quick Start (Docker)

Run the entire application with a single command:

```bash
docker compose up --build
```

This starts three containers:

| Service    | URL                     | Description                            |
| ---------- | ----------------------- | -------------------------------------- |
| Frontend   | http://localhost:3000   | React app served via Nginx             |
| Backend    | http://localhost:8801   | Express API (also proxied via Nginx)   |
| Database   | localhost:3307          | MySQL 8 with persistent volume         |

The backend automatically runs migrations and seeds the database on first launch. Once all containers are healthy, open http://localhost:3000 in your browser.

To stop everything:

```bash
docker compose down
```

To stop and remove all data (reset database):

```bash
docker compose down -v
```

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

- Docker Compose (full-stack orchestration)
- Nginx (reverse proxy and static file serving)
- Named volumes for database and upload persistence

---

## Repository Structure

```text
.
├── backend/              # Express API
│   ├── config/           # Database and environment configuration
│   ├── middleware/        # JWT auth middleware
│   ├── migrations/       # Schema and stored procedure migrations
│   ├── models/           # Sequelize model definitions
│   ├── routes/           # API route handlers
│   ├── seeders/          # Demo data seeders
│   ├── uploads/          # Product images and user avatars
│   ├── Dockerfile        # Backend container definition
│   └── index.js          # Express entry point
├── frontend/             # React application
│   ├── src/
│   │   ├── components/   # Reusable UI components (shadcn, layout, etc.)
│   │   ├── context/      # Auth context provider
│   │   ├── lib/          # Utilities (API config, theme, formatting)
│   │   └── pages/        # Route-level page components
│   ├── public/           # Static assets
│   ├── nginx.conf        # Nginx config for SPA + API proxy
│   └── Dockerfile        # Frontend container definition
├── context/              # Project context, architecture, and progress docs
├── docker-compose.yml    # Full-stack orchestration
├── GEMINI.md             # AI agent entry point and operating rules
└── ASAC - Project-Specification.md
```

---

## API Endpoints

| Domain               | Description                                          |
| -------------------- | ---------------------------------------------------- |
| `/api/auth`          | Login and current user session                       |
| `/api/profile`       | User profile, avatar upload, and account management  |
| `/api/cooperatives`  | Cooperative CRUD and partnership requests             |
| `/api/farmers`       | Farmer registry, membership, and cooperative linkage  |
| `/api/products`      | Product inventory and crop management                |
| `/api/orders`        | Buyer order intake and lifecycle                     |
| `/api/assignments`   | Cooperative and farmer assignment workflow            |
| `/api/deliveries`    | Delivery records and atomic delivery completion      |
| `/api/ledger`        | Federation/coop summaries, farmer ledgers, loans, statements, monthly trends |
| `/api/dashboard`     | Dashboard statistics and aggregated views            |
| `/api/notifications` | In-app notification feed (trigger-driven: assignments, deliveries, partnership requests) |
| `/api/requests`      | Partnership and registration request management      |

---

## Prerequisites

### Docker (recommended)

- Docker Desktop or Docker Engine with Compose v2

### Local Development (without Docker)

- Node.js 20 or later
- npm
- MySQL 8 or later

---

## Local Development Setup (without Docker)

### 1. Install dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Configure the database

Create the file `backend/.env.development.local`:

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

Or start a MySQL container:

```bash
docker compose up db -d
```

### 3. Run migrations and seeders

```bash
cd backend
npx sequelize-cli db:migrate
npx sequelize-cli db:seed:all
```

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

| Role    | Email                                   | Password  |
| ------- | --------------------------------------- | --------- |
| Admin   | federation.agricoops.camsur@gmail.com   | password  |
| Officer | cmpc.officer@faccs.ph                   | password  |
| Farmer  | farmer1@faccs.ph                        | password  |

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

### Docker

| Command                         | Description                        |
| ------------------------------- | ---------------------------------- |
| `docker compose up --build`     | Build and start all services       |
| `docker compose up -d`         | Start in background (detached)     |
| `docker compose down`          | Stop all services                  |
| `docker compose down -v`       | Stop and remove volumes (reset DB) |
| `docker compose logs -f`       | Follow logs from all services      |
| `docker compose logs backend`  | View backend logs only             |

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
- Inventory-aware assignment: cooperative and farmer selection dialogs show crop match status and available quantities
- Atomic delivery completion via MySQL stored procedures with proportional sales generation
- In-app notifications via MySQL triggers (partnership requests, coop assignments, delivery confirmations)
- FarmLedger with interactive charts (Recharts): monthly trends, revenue distribution, cooperative comparisons
- Printable farmer balance sheet with print-optimized CSS
- Product inventory with image upload and automatic compression
- Crop type management with referential integrity checks
- Profile picture upload with automatic 256x256 resizing
- Dark mode support
- Responsive sidebar navigation with collapsible layout
- Dockerized deployment with single-command startup
