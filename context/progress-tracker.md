# Progress Tracker

Update this file after every meaningful implementation change.

## Current Phase

- **Module Implementation**: Building core modules against the ASAC spec.
- **Database Optimization**: Offloading business logic and aggregation to MySQL (Views, Triggers, Procedures).

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
- **Implemented Profile Management**:
  - Backend: 4 REST endpoints on `/api/profile` (GET profile, PUT email, PUT password, DELETE soft-delete).
  - Role-specific org data: Admin (none), Officer (cooperative details), Farmer (farm + memberships).
  - Frontend: Profile page at `/{role-prefix}/profile` with account info, org info, and action dialogs.
  - Sidebar footer upgraded to DropdownMenu with Profile + Sign Out options.
  - Installed shadcn `DropdownMenu` and `Separator` components.
  - Security: Password confirmation for password change and account deactivation.
  - Last-admin protection: Cannot deactivate if only one active admin remains.
  - See `context/feature-specs/07-profile-management.md` for details.
- **Implemented Farmer Registry (CRUD)**:
  - Backend: 7 REST endpoints on `/api/farmers` (Admin list-all, Officer list-own-coop, detail, create, update, delete, bulk-delete).
  - Transactional create: User + Farmer + FarmerCooperative in one atomic operation.
  - Officer scope enforcement: All read/write ops scoped to officer's cooperative via FarmerCooperative join.
  - Frontend: Officer CRUD list with checkbox selection, bulk deactivate, search, and destructive modals.
  - Multi-step registration form (4 steps: Personal, Farm, Cooperative auto-assign, Review).
  - Tabbed detail page (Personal, Farm, Memberships, Account + Products table).
  - Admin read-only list with cooperative column across all coops.
  - Table styling: bold names, abbreviated dates, color-coded status badges, highlighted headers, PHP money format.
  - Installed shadcn `Checkbox` component.
  - Enabled Farmer Registry nav items in sidebar for Admin and Officer.
  - See `context/feature-specs/08-farmer-registry.md` for details.
- **Implemented Order & Transaction Management**:
  - Backend: `order.routes.js` (5 endpoints: list, detail, create, update, cancel) and `assignment.routes.js` (7 endpoints: officer list, detail, create/delete assignment, create/update/delete fulfillment).
  - Automatic status cascading: Order status auto-updates (pending → assigned → inProgress → consolidated) and assignment status auto-updates (pending → matched → ready) based on downstream entity changes.
  - Admin: Order list with search + status filter, create/edit form, order detail page with cooperative assignment management (assign dialog, remove dialog, quantity progress bar).
  - Officer: Assignment list (scoped to own coop), assignment detail with farmer fulfillment management (assign farmer dialog, inline status update via Select, remove fulfillment dialog, quantity progress bar).
  - Installed shadcn `Progress` component. `Select` and `Textarea` already existed.
  - Enabled "Order Management" (Admin) and "Assignments" (Officer) nav items in sidebar.
  - Destructive operations (cancel order, remove assignment, remove fulfillment) use confirmation dialogs per `ui-context.md`.
  - See `context/feature-specs/09-order-management.md` for details.
- **Implemented Delivery Management**:
  - Backend: `/api/deliveries` endpoints (list, detail, create, update, deliver, cancel) with atomic delivery completion → SalesRecords + FeeRecords.
  - Delivery completion validates eligible order status and commission ranges; creates FarmerAccount as needed; updates BuyerOrder to `completed` when all deliveries are delivered.
  - Frontend: Admin delivery list with status filter, create/edit form, and detail view with generated sales records.
  - Mark-as-delivered confirmation includes amount, commission rates, and fulfilling farmer count.
  - Enabled Admin "Deliveries" sidebar item.
  - See `context/feature-specs/10-delivery-management.md` for details.
- **Implemented FarmLedger Accounting**:
  - Backend: `/api/ledger` routes — federation summary (`GET /summary`), cooperative ledger list (`GET /coops/:coopId`, `GET /coops/me`), farmer ledger detail (`GET /farmers/:farmerId`, `GET /farmers/me`), printed statement snapshot (`POST /farmers/:farmerId/statement`), loans (`POST /farmers/:farmerId/loans`), repayment (`PUT /loans/:loanId/repayment`). Totals aggregate persisted `SalesRecord` / `FeeRecord` / `LoanRecord` data; officers scoped to their cooperative; farmers scoped to own account(s).
  - Frontend: Admin federation overview at `/admin/farmledger`, cooperative ledger at `/admin/farmledger/coops/:coopId`, farmer detail at `/admin/farmledger/farmers/:id` (optional `coopId` query when multiple memberships). Officer cooperative ledger at `/coop/farmledger`, farmer detail under `/coop/farmledger/farmers/:id`. Farmer view-only ledger at `/farmer/ledger`, printable balance sheet at `/farmer/ledger/statement` (and parallel officer/admin statement routes). Sidebar nav enabled for Farm Ledger / Farmer Ledger / My Ledger; IBM Plex Mono used for money columns per spec.
  - Officer URLs follow the existing app convention (`/coop/...`) rather than the alternate `/officer/...` naming in the feature doc.
  - See `context/feature-specs/11-farmledger-accounting.md` for details.
- **Implemented Public Landing Page**:
  - Route **`/`** renders an unauthenticated marketing page (`LandingPage`): hero, features, partner marquee; shared **`PublicHeader`** / **`PublicFooter`** with site map (Home, Features, Partners, About, Documentation, Sign in), draft FACCS-style address/email/phone (placeholders), draft social buttons, and About teaser.
  - **`/about`** — draft “About ASAC” copy for FACCS; **`/docs`** — “documentation currently being built” placeholder.
  - App wildcard routes navigate to **`/`** instead of `/login`.
  - See `context/feature-specs/12-landing-page.md` for details.
- **Implemented Table Pagination**:
  - Added a shared `TablePaginationFooter` component with range text, previous/next controls, and numbered pages.
  - Applied 10-row client-side pagination, sticky table headers, and scrollable table containers to the main list/detail tables across admin, cooperative, and ledger screens.
  - Verified with a successful `npm run build` in `frontend/`.
- **Implemented Crop/Product Inventory**:
  - Added `/api/products` backend routes for admin browsing plus cooperative product management, including crop type references and cooperative/farmer scope checks.
  - Added optional `imagePath` support for products so crop images can use `frontend/public/crops` assets or uploaded data URLs with a fallback placeholder.
  - Added the shared inventory page at `/admin/products` and `/coop/products` with search, filters, sorting, detail dialog, and cooperative edit/create/delete actions.
  - Added sidebar navigation entries for Products in both admin and cooperative menus.
- **Implemented PSGC Location Lookup (Frontend)**:
  - Added a reusable PSGC location selector with cached city/municipality and barangay lookups using PSGC codes.
  - Integrated the selector into farmer registration and cooperative registry forms with loading and error states.

- **Implemented Crop Type Management**:
  - Backend: Added Admin-only `POST`, `PUT`, and `DELETE` endpoints for `/api/products/crop-types`. Included duplicate name validation and dependency checks (blocked if referenced by Product/BuyerOrder).
  - Frontend: Developed `CropTypeManagementDialog` component as a clean modal dialog for FACCS Admins, displaying a master reference table with an add/edit form.
  - Integrated into `ProductInventoryPage` via the "Manage Crop Types" button for admins.
- **Added App Shell Preferences**:
  - Collapsible sidebar with header toggle and icon-only minimized state.
  - Settings page with Appearance theme toggle (Light/Dark) and profile dropdown entry.
- **Database Optimization Phase 2**:
  - Added stored procedures for delivery completion, statement generation, loan status refresh, and ledger summaries.
  - Added indexes for ledger and delivery join paths.
  - Updated delivery and ledger endpoints to call new procedures.
  - Updated monthly purge event to target AuditLogs only.

- **Database Seeding Expansion & Alignment**:
  - Updated all 16 existing seeders to align with May 16, 2026 reference date.
  - Ensured mathematical consistency across the Order -> Assignment -> Fulfillment -> Delivery -> Sales -> Fee chain.
  - Expanded Farmer memberships and accounts to support more complex scenarios (multi-coop membership).
  - Added new seeders for `PartnershipRequests` and `Notifications`.
  - Total seed records now cover all 19 primary cooperatives and diverse transaction statuses.

## In Progress

- None.

## Next Up

- Continue semester expansion beyond the three core modules as prioritized with stakeholders (e.g. deeper polish on landing content or registration UX).

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
