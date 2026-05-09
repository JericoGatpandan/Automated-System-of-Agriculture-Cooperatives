# Progress Tracker

Update this file after every meaningful implementation change.

## Current Phase

- **Research & Strategy**: Project setup and initial context refinement.

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

## In Progress

- Refining `context/` folder to ensure consistency with the Project Specification.

## Next Up

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
