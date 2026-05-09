# Progress Tracker

Update this file after every meaningful implementation change.

## Current Phase

- **Module Implementation**: Building core modules against the ASAC spec.

## Current Goal

- Deliver a functional prototype featuring the three mandatory modules:
    1. **Cooperative & Farmer Registry**
    2. **Order & Transaction Management**
    3. **FarmLedger Accounting**
- Align implementation with `ASAC - Project-Specification.md` and prepare for long-term project expansion.

## Completed

- Initialized project structure (`backend/` and `frontend/`).
- Defined canonical domain schema in `context/feature-specs/04-database.md`.
- Synchronized `GEMINI.md` as the system entry point.
- Integrated `shadcn` skill for UI development.
- **Implemented Design System**:
  - Installed Tailwind CSS v4 and Lucide React.
  - Configured shadcn/ui with the `maia` preset and custom theme from `ui-context.md`.
  - Added core components: Button, Card, Dialog, Input, Tabs, Textarea, ScrollArea, Table, Badge, Select, Label.
  - Updated typography to use Poppins (UI) and IBM Plex Mono (Code/Mono).
  - Verified build with successful `npm run build`.
  - Integrated specific ASAC variables inside `App.css`.
- **Implemented Role-Based Authentication**:
  - Created two-column UI layout for `/login` and `/register` using `shadcn/ui`.
  - Setup React Router with `ProtectedRoute` for Role-based access control.
  - Created placeholder dashboards for Admin, Coop Officer, and Farmer.
  - Setup `AuthContext` to persist tokens using `localStorage`.
  - Created temporary mock Express backend to facilitate frontend testing while DB migrations are pending.
- **Updated Sequelize schema alignment**:
  - Added model associations per cardinalities.
  - Updated migrations to use domain `*ID` primary keys and added foreign key constraints.
  - Removed duplicate `createdAt` definitions in affected migrations.
- **Database Seeding**:
  - Created 16 seeders with 98 total records across all tables.
  - Expanded Users from 5 → 11 to satisfy FK references.
  - Derived FarmerAccount, SalesRecord, FeeRecord, LoanRecord, PrintedStatement data from spec rules.
  - Created `config/config.json` and CJS override package.json files for sequelize-cli compatibility.
- **Replaced Mock Auth with Real DB Auth**:
  - `POST /api/auth/login` — bcryptjs validation against Users table, JWT with mapped role names.
  - `GET /api/auth/me` — JWT-protected user fetch.
  - Auth middleware: `authenticate` (JWT verify) + `authorize(...roles)` (RBAC).
  - Removed all mock endpoints from `index.js`.
- **Implemented Cooperative Registry (CRUD)**:
  - Backend: 5 REST endpoints on `/api/cooperatives` (Admin-only, transactional create, soft-delete).
  - Frontend: Full registry page at `/admin/cooperatives` with shadcn Table, Dialog forms, destructive delete confirmation modal.
  - Redesigned Admin Dashboard as a module navigation grid.
  - See `context/feature-specs/05-cooperative-registry.md` for details.
- **Implemented Sidebar Navigation (Role-Based)**:
  - Created AppShell layout wrapper with persistent sidebar for all authenticated pages.
  - Role-scoped navigation: Admin (6 items), Officer (6 items), Farmer (4 items).
  - Future/unimplemented modules rendered as disabled with "Coming soon" tooltips.
  - Mobile-responsive: Sheet-based drawer on small screens.
  - Installed shadcn `Sheet` and `Tooltip` components.
  - Removed all per-page Sign Out buttons and back buttons (sidebar handles navigation).
  - Restructured App.tsx to use nested routes per role group.
  - See `context/feature-specs/06-sidebar-navigation.md` for details.

## In Progress

- Farmer Registry module (next feature unit).

## Next Up

- Implement Farmer Registry (Coop Officer manages farmer memberships).
- Implement Buyer Order intake (FACCS Admin).
- Implement Cooperative Assignment and Farmer Fulfillment.

## Open Questions

- Confirm exact external commission split rates: federation vs cooperative (Spec says TBC).
- Confirm cooperative share split into capital contribution vs capital retention rates (Spec says TBC).
- Confirm if farmers will have direct login or view-only ledger access (Spec says Farmer is view-only).

## Architecture Decisions

- **Two-Tier Structure**: Federation (FACCS) and Cooperative (Primary) roles.
- **Officer-Operated Model**: System used by officers on behalf of farmers.
- **Atomic Accounting**: Delivery completion triggers ledger records.
- **Auth**: Standard JWT and Bcrypt (Custom logic, no external providers like Clerk).
- **Frontend**: React + TypeScript + Vite + Tailwind CSS + shadcn/ui.
- **Backend**: Node.js + Express + Sequelize + MySQL.
