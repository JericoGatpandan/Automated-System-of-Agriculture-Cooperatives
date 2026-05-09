# Architecture Context

## Stack

| Layer | Technology | Role |
| --- | --- | --- |
| Frontend app | React 19 + TypeScript + Vite | Operator UI for ASAC modules |
| UI styling | Tailwind CSS + shadcn/ui | Shared styling foundation and reusable UI primitives |
| Backend API | Node.js + Express (CommonJS) | REST endpoints for auth, order workflows, and ledger operations |
| ORM | Sequelize 6 | Data access and relational model mapping |
| Database | MySQL | Persistent source of truth for ASAC entities |
| Auth | JWT & Bcrypt | Token-based authentication and secure password hashing |

## System Boundaries

- `backend/` - Domain models, controllers, and database connectivity.
- `frontend/` - Operator-facing web application.
- `context/` - Documentation for scope, architecture, and progress.
- `ASAC - Project-Specification.md` - Canonical domain/business specification.

## Storage Model

- **MySQL**: Users, Roles, Cooperatives, Farmers, CropTypes, Products, Orders, Assignments, Fulfillments, DeliveryRecords, Accounts, Sales, Fees, Loans.
- **Schema**: See `context/feature-specs/04-database.md` for formal definitions.

## Auth and Access Model

- **Identity**: Managed via `Users` table with roles (Admin, Officer, Farmer).
- **Authentication**: JWT tokens issued upon successful login (Bcrypt for hashing).
- **Authorization**: Role-based access control (RBAC).
  - **FACCS Admin**: Federation-level oversight, order intake, delivery coordination.
  - **Coop Officer**: Cooperative-level management, farmer matching, loan management.
  - **Farmer**: View-only access to personal ledger.
- **Scoping**: Coop Officers are restricted to data within their own cooperative.

## Invariants

1. **Deterministic Accounting**: Delivery completion is the *only* trigger for ledger record generation.
2. **Role Isolation**: No cross-cooperative write access for officers.
3. **Officer-Led Operations**: Data entry is performed by officers on behalf of farmers/buyers.
4. **Auditability**: All status transitions (Orders, Assignments) must be logged and auditable.
