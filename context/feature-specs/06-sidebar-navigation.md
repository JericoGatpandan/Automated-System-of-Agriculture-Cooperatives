# Sidebar Navigation

Read `GEMINI.md` first.

## 06 — Sidebar Navigation (Role-Based)

### Design

Follow the design system in `context/feature-specs/01-design-system.md` and `context/ui-context.md`.

### Overview

Implement a persistent sidebar that serves as the primary navigation for all authenticated users. The sidebar replaces the current top-bar-only layout and provides role-scoped module access. It must follow the **App Shell** pattern defined in `ui-context.md`: side navigation for module switching (Orders, Ledger, Coops, Farmers).

The sidebar is **not shown** on the `/login` page. It appears on every page after login.

### Layout Structure

```
┌──────────┬────────────────────────────────────┐
│          │                                    │
│ Sidebar  │         Main Content               │
│ (fixed)  │         (scrollable)               │
│          │                                    │
│  Logo    │                                    │
│  ─────── │                                    │
│  Nav     │                                    │
│  Items   │                                    │
│          │                                    │
│  ─────── │                                    │
│  User    │                                    │
│  Footer  │                                    │
└──────────┴────────────────────────────────────┘
```

- **Sidebar width**: `w-64` (256px) on desktop, collapsible to icon-only (`w-16`) on tablet, slide-over drawer on mobile
- **Position**: Fixed left, full viewport height
- **Background**: `bg-sidebar` / `text-sidebar-foreground` (uses existing sidebar CSS variables from `App.css`)
- **Border**: Right border using `border-sidebar-border`

### Sidebar Sections

#### 1. Header / Logo (top)
- ASAC logo/text + system name
- the logo is in assets/logo.png
- Role label badge below (e.g., "FACCS Admin", "Cooperative Officer", "Farmer")

#### 2. Navigation Items (middle, scrollable)
Role-scoped menu items. Only show items the user's role has access to.

#### 3. User Footer (bottom, pinned)
- Current user email (truncated if long)
- Sign Out button

### Navigation Items Per Role

#### FACCS Admin (`role === "Admin"`)

| Label | Icon | Route | Description |
|-------|------|-------|-------------|
| Dashboard | `LayoutDashboard` | `/admin` | Module overview grid |
| Cooperative Registry | `Building2` | `/admin/cooperatives` | CRUD cooperatives |
| Farmer Registry | `Users` | `/admin/farmers` | View farmer memberships (read-only, future) |
| Order Management | `ShoppingCart` | `/admin/orders` | Buyer order intake + assignment (future) |
| Deliveries | `Truck` | `/admin/deliveries` | Delivery coordination (future) |
| Federation Overview | `BarChart3` | `/admin/overview` | Read-only federation summary (future) |

#### Cooperative Officer (`role === "Officer"`)

| Label | Icon | Route | Description |
|-------|------|-------|-------------|
| Dashboard | `LayoutDashboard` | `/coop` | Cooperative dashboard |
| Farmer Registry | `Users` | `/coop/farmers` | Manage farmer memberships (future) |
| Assignments | `ClipboardList` | `/coop/assignments` | View/match order assignments (future) |
| Loan Management | `Wallet` | `/coop/loans` | Record farmer loans (future) |
| Farmer Ledger | `BookOpen` | `/coop/ledger` | FarmLedger per farmer (future) |
| Statements | `FileText` | `/coop/statements` | Generate printed balance sheets (future) |

#### Farmer (`role === "Farmer"`)

| Label | Icon | Route | Description |
|-------|------|-------|-------------|
| My Ledger | `BookOpen` | `/farmer` | View-only personal FarmLedger |
| Sales History | `Receipt` | `/farmer/sales` | View sales records (future) |
| Share Capital | `PiggyBank` | `/farmer/capital` | View share capital balance (future) |
| Loan Status | `Wallet` | `/farmer/loans` | View loan records (future) |

### Implementation Details

#### Component structure

```
frontend/src/components/
├── layout/
│   ├── AppShell.tsx          # Sidebar + main content wrapper
│   ├── Sidebar.tsx           # Sidebar component (role-aware)
│   ├── SidebarNavItem.tsx    # Individual nav item with active state
│   └── MobileSidebar.tsx     # Drawer-based sidebar for mobile (optional)
```

#### AppShell pattern

The `AppShell` component wraps all authenticated pages. It renders the Sidebar alongside the page content:

```tsx
// Usage in App.tsx routes:
<Route path="/admin/*" element={
  <ProtectedRoute allowedRoles={["Admin"]}>
    <AppShell>
      <Routes>
        <Route index element={<AdminDashboard />} />
        <Route path="cooperatives" element={<CooperativeRegistry />} />
        {/* future routes */}
      </Routes>
    </AppShell>
  </ProtectedRoute>
} />
```

#### Active state

- The current route should be visually highlighted using `bg-sidebar-accent text-sidebar-accent-foreground`
- Use `useLocation()` from react-router-dom to match the current path
- Exact match for dashboard routes, prefix match for sub-pages

#### Disabled/future items

- Navigation items for modules not yet implemented should be rendered but visually muted (`opacity-50`, no click handler or `cursor-not-allowed`)
- Optionally add a small "Coming soon" tooltip on hover

#### Key behaviors

- Sidebar reads `user.role` from `AuthContext` to determine which nav items to render
- Sign Out button in footer calls `logout()` from `AuthContext` and navigates to `/login`
- The existing per-page Sign Out buttons and back-to-dashboard buttons should be removed once the sidebar is in place (sidebar handles all navigation)
- On mobile (`< 768px`), sidebar collapses into a hamburger menu or slide-over `Sheet`

### shadcn Components to Use

- **`ScrollArea`** — for the nav item list if it overflows
- **`Button`** — for sign out and nav items (variant: `ghost`)
- **`Badge`** — for the role label in the header
- **`Sheet`** (may need to install) — for mobile drawer sidebar
- **`Tooltip`** (may need to install) — for "Coming soon" labels on disabled items

### Icons (lucide-react)

All icons at `h-5 w-5` in sidebar nav items per `ui-context.md` button-leading size:

- `LayoutDashboard`, `Building2`, `Users`, `ShoppingCart`, `Truck`, `BarChart3`
- `ClipboardList`, `Wallet`, `BookOpen`, `FileText`, `Receipt`, `PiggyBank`
- `LogOut` for the sign out button
- `Menu` for mobile hamburger toggle

### Check when done

- [ ] Sidebar is displayed on all pages after login
- [ ] Sidebar content changes based on user role (Admin sees 6 items, Officer sees 6, Farmer sees 4)
- [ ] Only authorized users can access each menu item's route
- [ ] Active menu item is highlighted correctly based on current route
- [ ] Sidebar is responsive (full on desktop, collapsed/drawer on mobile)
- [ ] All existing routes (`/admin`, `/admin/cooperatives`, `/coop`, `/farmer`) are accessible through the sidebar
- [ ] No duplicate navigation elements (remove per-page Sign Out buttons and back buttons after sidebar is in place)
- [ ] Sidebar uses `bg-sidebar` / `text-sidebar-foreground` CSS variables from `App.css`
- [ ] Sign Out in sidebar footer works correctly (clears token, redirects to `/login`)
- [ ] Future/unimplemented items are visually disabled but present in the nav
