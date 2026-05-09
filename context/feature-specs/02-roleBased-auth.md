Read `GEMINI.md` first.

# Feature Specification: Role-Based Authentication

## Objective
Implement a secure, role-based authentication system using JWT and bcrypt for the backend, and React Router for the frontend. The system must support three distinct roles: FACCS Admin, Cooperative Officer, and Farmer.

## Design Requirements
The UI design must adhere strictly to the ASAC high-contrast, data-heavy operations aesthetic defined in `ui-context.md`. The design must be extremely clean, simple, and functional.

**Global Auth Layout Rules:**
- **Layout Structure:** Simple two-column split screen.
  - **Left Column:** ASAC Logo/Branding.
  - **Right Column:** Authentication Form (Sign In / Register).
- **Prohibited UI Elements:**
  - No gradients.
  - No oversized hero sections or illustrations.
  - No feature cards, marketing copy, or decorative "stuff".
  - No animations.
  - No scroll-heavy layouts (must fit cleanly on a single viewport).
  - No floating card-based layouts in the center of the screen.
  - No sidebars, headers, or footers on the auth screens.

**Pages:**
1. **Login Page (`/login`)**
   - The entry point for all users.
   - Form fields: Email, Password.
   - Roles supported for login: FACCS Admin, Coop Officer, Farmer.

2. **Register Page (`/register`)**
   - Identical two-column layout to the Login page.
   - **Access Control:** This page is strictly protected and only accessible/visible to authenticated FACCS Admins.

## Implementation Details

### Frontend (React + Vite + React Router + shadcn/ui)
- Create `/login` and `/register` routes using the specified two-column layout.
- Use `shadcn/ui` form primitives (Input, Label, Button, Form).
- Ensure all styling relies entirely on semantic CSS variables from `App.css` (no hardcoded colors).
- **Route Protection & Redirection Logic:**
  - Unauthenticated users attempting to access protected routes must be redirected to `/login`.
  - Upon successful authentication, users must be routed to their respective dashboards:
    - FACCS Admin → `/admin`
    - Cooperative Officer → `/coop`
    - Farmer → `/farmer`
- For the initial implementation phase, simply render placeholder text on the protected routes (e.g., "FACCS Admin Dashboard", "Coop Officer Dashboard", "Farmer Dashboard") to verify routing success.

### Backend (Node.js + Express + Sequelize)
- **Authentication Strategy:** JWT (JSON Web Tokens) for session management and `bcrypt` for password hashing.
- **Endpoints Needed:**
  - `POST /api/auth/login`: Authenticates user, issues JWT containing role claims.
  - `POST /api/auth/register`: Creates a new user (restricted to Admin token usage only).
  - `GET /api/auth/me`: Validates current token and returns user context.

## Acceptance Criteria
- [ ] The authentication layout strictly follows the minimal two-column requirement.
- [ ] All `shadcn/ui` components import without errors.
- [ ] The `cn()` utility works properly across the auth pages.
- [ ] Auth pages use CSS variables with absolutely no hardcoded colors.
- [ ] JWT tokens are correctly issued and validated by the backend.
- [ ] React Router properly protects `/admin`, `/coop`, `/farmer`, and `/register` routes.
- [ ] Role-based redirection functions correctly upon login.
