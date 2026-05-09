read `GEMINI.md` first

# Objective
Implement a cooperative registry system for the ASAC platform. The FACCS Admin can perform full CRUD operations on Primary Cooperatives.

# Design 
Follow the design system in `context/feature-specs/01-design-system.md` and `context/ui-context.md`.

# Implementation Details

## Backend

### Auth (replaces mock endpoints)
- `POST /api/auth/login` — Validates email + password (bcryptjs) against the `Users` table, returns JWT with mapped role name
- `GET /api/auth/me` — Returns current user from JWT token
- Role mapping: `FACCS Admin` → `Admin`, `Coop Officer` → `Officer`, `Farmer` → `Farmer`
- Middleware: `authenticate` (JWT verify) + `authorize(...roles)` (RBAC)

### Cooperative CRUD (Admin-only)
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/cooperatives` | List all non-deleted cooperatives with officer email |
| `GET` | `/api/cooperatives/:id` | Get single cooperative |
| `POST` | `/api/cooperatives` | Create cooperative + Coop Officer user (transactional) |
| `PUT` | `/api/cooperatives/:id` | Update cooperative details |
| `DELETE` | `/api/cooperatives/:id` | Soft-delete (isDeleted=true) for both coop and officer |

### Key files
- `backend/middleware/auth.middleware.js` — JWT + RBAC middleware
- `backend/routes/auth.routes.js` — Real auth endpoints
- `backend/routes/cooperative.routes.js` — Cooperative CRUD
- `backend/index.js` — Entry point (routes mounted, mock code removed)

## Frontend

### Route: `/admin/cooperatives`
- Protected by `ProtectedRoute` with `allowedRoles={["Admin"]}`
- Full-page data table with search, create/edit/delete dialogs
- Uses shadcn/ui: Table, Dialog, Card, Badge, Button, Input, Label
- Uses lucide-react icons: Plus, Pencil, Trash2, Building2, Search, AlertTriangle, etc.
- Destructive delete shows confirmation modal with warning icon
- Loading spinner + error states with retry button

### Key files
- `frontend/src/pages/admin/CooperativeRegistry.tsx` — Registry page
- `frontend/src/pages/admin/AdminDashboard.tsx` — Module navigation grid
- `frontend/src/App.tsx` — Route added

## Behavior notes
- Creating a cooperative also creates its Coop Officer user (1:1 relationship per spec)
- Delete is soft-delete: sets `isDeleted = true` on both cooperative and officer user
- Registration number must be unique (409 on duplicate)
- Officer email must be unique (409 on duplicate)

# Check when done
- [ ] Login with `faccs.admin@faccs.ph` / `P@ssw0rd2024` redirects to Admin Dashboard
- [ ] Admin Dashboard shows 4 module cards (Cooperative Registry is clickable, others grayed)
- [ ] Cooperative Registry page shows table with 5 seeded cooperatives
- [ ] Search filters cooperatives by name, municipality, or CDA number
- [ ] "Add Cooperative" dialog creates new coop + officer user
- [ ] Edit dialog updates cooperative details
- [ ] Delete dialog shows destructive confirmation, soft-deletes both coop and officer
- [ ] Non-admin users cannot access `/api/cooperatives` (403) or `/admin/cooperatives` (redirect)
