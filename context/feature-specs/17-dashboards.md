# Feature 17: Dashboard Overhaul

## Goal
Transform the empty module menus in the Admin and Cooperative dashboards into rich, fast, and actionable control centers. By offloading complex aggregations to MySQL Views, the frontend will load instantly while providing a high-level overview of system metrics and recent activities without taxing the Node.js server.

## UI Expectations
1. **Top Metrics Row (KPIs)**: A row of 4 `shadcn/ui` Cards displaying key performance indicators. 
   - *Admin Dashboard*: Total Cooperatives, Total Farmers, Pending Orders, Total Sales Volume.
   - *Coop Dashboard*: Total Members, Pending Assignments, Active Loans, Total Coop Sales.
2. **Quick Actions Panel**: Prominent buttons using the primary semantic color for common tasks (e.g., "Create New Order", "Register Farmer", "Generate Ledger").
3. **Recent Activity Table**: A minimal data table at the bottom showing the 5 most recent activities (e.g., recently placed orders for Admin, recent farmer registrations or assignments for Coop) to provide immediate context on system state.
4. **Design Aesthetics**: Modern, clean, and highly readable, strictly following the `ui-context.md` typography (Poppins) and color tokens.

## Backend Implementation
1. **Database Views**: Create a new Sequelize migration to add two specific views:
   - `vw_admin_dashboard_stats`: Calculates federation-wide aggregates.
   - `vw_coop_dashboard_stats`: Calculates aggregates grouped by `primaryCoopID`.
2. **API Routes**: Create new endpoints at `/api/dashboard/admin` and `/api/dashboard/coop` that simply execute a `SELECT *` from these views for lightning-fast retrieval.
