# Farmer Registry

Read `GEMINI.md` first.

## 08 — Farmer Registry Management

### Design

Follow the design system in `context/feature-specs/01-design-system.md` and `context/ui-context.md`.

### Overview

Implement the Farmer Registry module — the second core module of ASAC. This module manages farmer memberships across cooperatives. It spans three roles:

- **Coop Officer**: Full CRUD — register new farmers into their cooperative, update farmer details, view their cooperative's farmers, soft-delete farmer records
- **Admin (FACCS)**: Read-only — view all farmers across all cooperatives with filtering
- **Farmer**: View own profile (already handled by Profile Management in feature 07)

### Data Model (existing — no migrations needed)

The registry operates across four existing tables:

| Table | Purpose |
|-------|---------|
| `User` | Login credentials (email, password_hash, roleID) |
| `Farmer` | Personal + farm details (firstName, lastName, farmName, farmLocation) |
| `FarmerCooperative` | Membership join table (farmerID ↔ primaryCoopID, joinedDate, status) |
| `Product` | Crops a farmer sells (farmerID → cropTypeID, unitPrice, availableQuantity, qualityGrade) |

**Creation flow**: When a Coop Officer registers a farmer, the system creates:
1. A `User` record (role = Farmer, with email + hashed password)
2. A `Farmer` record linked to that User
3. A `FarmerCooperative` record linking the farmer to the officer's cooperative

---

## Data Table Design

The farmer list is the primary view for both Admin and Officer. Follow these table style rules from the user's requirements:

### Table styling rules

| Rule | Implementation |
|------|----------------|
| Header highlighted | `bg-muted font-semibold text-muted-foreground` on `TableHead` cells |
| Sort icons in accent | Sort chevrons use `text-primary` |
| Light borders | `border-border/50` on rows, no heavy dividers |
| Increased row height | `py-4` on `TableCell` (taller than default) |
| Action buttons with lucide icons | `Pencil`, `Trash2`, `Eye` icon buttons, no text labels |
| Money right-aligned in PHP | `text-right font-mono` — display as `PHP 25.00` |
| Color-coded status chips | `active` → green Badge, `inactive` → gray Badge |
| Date format abbreviated | `05 Oct 2024` format — use `toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })` |
| Farmer name bold | `font-semibold` on the name column |
| Search emphasized | Prominent search bar with icon, full-width on mobile |
| Selected rows highlighted | Row highlight on checkbox selection using `bg-primary/5` |
| Bulk actions with color + icons | Colored action bar appears when rows are selected |

### Table columns

#### Officer view (`/coop/farmers`)

| Column | Content | Align |
|--------|---------|-------|
| ☐ | Checkbox for bulk select | Center |
| Farmer Name | `{lastName}, {firstName} {middleName}` — **bold** | Left |
| Farm | `{farmName}` | Left |
| Location | `{farmLocation}` | Left |
| Crops | Comma-separated crop names from Product → CropType | Left |
| Joined | `{joinedDate}` in `05 Oct 2024` format | Left |
| Status | `active` / `inactive` color-coded Badge | Center |
| Actions | `Eye` (view), `Pencil` (edit), `Trash2` (deactivate) | Right |

#### Admin view (`/admin/farmers`)

| Column | Content | Align |
|--------|---------|-------|
| Farmer Name | `{lastName}, {firstName}` — **bold** | Left |
| Farm | `{farmName}` | Left |
| Location | `{farmLocation}` | Left |
| Cooperative | `{coopName}` from FarmerCooperative → PrimaryCooperative | Left |
| Crops | Comma-separated crop names | Left |
| Joined | `{joinedDate}` in `05 Oct 2024` format | Left |
| Status | `active` / `inactive` color-coded Badge | Center |

Admin table is **read-only** (no action column, no checkboxes).

### Bulk actions (Officer only)

When one or more rows are checked, a sticky bar appears above the table:

```
┌─────────────────────────────────────────────────┐
│ ✓ 3 selected     [Deactivate Selected] (red)    │
└─────────────────────────────────────────────────┘
```

- **Deactivate Selected** — opens a confirmation Dialog (destructive), soft-deletes all selected farmer records
- Bar uses `bg-primary/5 border-primary/20` to distinguish it

---

## Registration Form (Multi-Step)

The registration form is a **full page** (not a dialog), at route `/coop/farmers/new`. It uses a multi-step wizard pattern with a stepper indicator at the top.

### Route: `/coop/farmers/new`

### Step layout

```
┌──────────────────────────────────────────────────┐
│  Step 1       Step 2       Step 3       Step 4   │
│  ● ──────── ○ ──────── ○ ──────── ○              │
│  Personal    Farm        Coop         Review     │
│                                                  │
│  ┌────────────────────────────────────────────┐  │
│  │                                            │  │
│  │            Step Content                    │  │
│  │                                            │  │
│  └────────────────────────────────────────────┘  │
│                                                  │
│                    [Back]  [Next]                 │
└──────────────────────────────────────────────────┘
```

### Step 1 — Personal Information

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| First Name | text | ✅ | Min 2 chars |
| Middle Name | text | — | — |
| Last Name | text | ✅ | Min 2 chars |
| Suffix | text | — | e.g. "Jr.", "Sr.", "III" |
| Email | email | ✅ | Valid email, unique |
| Password | password | ✅ | Min 8 chars |

### Step 2 — Farm Details

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| Farm Name | text | — | — |
| Farm Location | text | ✅ | — |

### Step 3 — Cooperative Membership

This step is **pre-filled and read-only** — the farmer is automatically assigned to the Officer's cooperative. Display:

- Cooperative name
- Joined date (today's date, auto-set)
- Status: `active` (auto-set)

This step exists to confirm the assignment, not to allow editing.

### Step 4 — Review & Submit

Summary of all entered data in a read-only card layout:
- Personal info block
- Farm details block
- Cooperative assignment block
- **Submit** button (creates User + Farmer + FarmerCooperative in one transaction)

### Edit form

The edit form reuses the same multi-step layout at route `/coop/farmers/:id/edit`, but:
- Step 1 shows existing data (email + password fields hidden — cannot change login credentials from here)
- Step 3 is read-only (cooperative assignment already exists)
- Step 4 "Review & Submit" becomes "Review & Save"

---

## Farmer Detail Page (Tabbed)

A read-only detail view at `/coop/farmers/:id` (Officer) and `/admin/farmers/:id` (Admin). Uses `Tabs` component.

### Tabs

#### Tab 1 — Personal Information
- Full name (with suffix)
- Email
- Role badge

#### Tab 2 — Farm Details
- Farm name
- Farm location

#### Tab 3 — Cooperative Memberships
- List of cooperative memberships from `FarmerCooperative`
- Columns: Cooperative Name, Joined Date, Status (Badge)

#### Tab 4 — Account Information
- Account creation date
- Account status (active/inactive)
- Products table (crops the farmer sells):
  - Crop Name, Unit Price (PHP), Available Qty, Quality Grade, Last Updated

---

## API Endpoints

All endpoints in `backend/routes/farmer.routes.js`, mounted at `/api/farmers`.

### Farmer listing

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/farmers` | Admin | List ALL farmers across cooperatives (with joins) |
| `GET` | `/api/farmers/my-coop` | Officer | List farmers in the officer's cooperative only |
| `GET` | `/api/farmers/:id` | Admin, Officer | Get single farmer detail (Officer scoped to own coop) |

### Farmer CRUD (Officer only)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/farmers` | Officer | Create farmer (User + Farmer + FarmerCooperative, transactional) |
| `PUT` | `/api/farmers/:id` | Officer | Update farmer details (scoped to own coop) |
| `DELETE` | `/api/farmers/:id` | Officer | Soft-delete farmer (sets isDeleted on User + Farmer) |
| `DELETE` | `/api/farmers/bulk` | Officer | Bulk soft-delete by IDs |

### Supporting

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/crop-types` | Any authenticated | List all crop types (for display/reference) |

### `GET /api/farmers/my-coop` response

```json
{
  "farmers": [
    {
      "farmerID": 1,
      "firstName": "Juan",
      "middleName": "Reyes",
      "lastName": "Dela Cruz",
      "suffixName": null,
      "farmName": "Dela Cruz Farm",
      "farmLocation": "Bula, CamSur",
      "isDeleted": false,
      "createdAt": "2024-02-01T00:00:00.000Z",
      "User": { "email": "juan.dela.cruz@farmer.ph" },
      "FarmerCooperatives": [
        {
          "joinedDate": "2022-06-01T00:00:00.000Z",
          "status": "active",
          "PrimaryCooperative": { "coopName": "SARFC" }
        }
      ],
      "Products": [
        {
          "CropType": { "cropName": "Rice" },
          "unitPrice": 25,
          "availableQuantity": 500,
          "qualityGrade": "Grade A"
        }
      ]
    }
  ]
}
```

### `POST /api/farmers` request

```json
{
  "firstName": "Ana",
  "middleName": "Mariz",
  "lastName": "Reyes",
  "suffixName": null,
  "email": "ana.reyes@farmer.ph",
  "password": "P@ssw0rd2024",
  "farmName": "Reyes Farm",
  "farmLocation": "Bula, CamSur"
}
```

The backend automatically:
1. Creates a User with `roleID = 3` (Farmer)
2. Creates a Farmer linked to the User
3. Creates a FarmerCooperative linking to the officer's cooperative (`status: 'active'`, `joinedDate: today`)

All three operations in a single Sequelize transaction.

### Scoping logic for Officer

The Officer's cooperative is determined from their user:
```js
const coop = await db.PrimaryCooperative.findOne({
  where: { userID: req.user.userID, isDeleted: false }
});
```
All read/write operations for an Officer are scoped to farmers who have a `FarmerCooperative` record with `primaryCoopID = coop.primaryCoopID`.

---

## Component Structure

```
frontend/src/pages/
├── admin/
│   └── AdminFarmerRegistry.tsx       # Admin read-only farmer list
├── coop/
│   ├── CoopFarmerRegistry.tsx        # Officer farmer list (CRUD)
│   ├── FarmerForm.tsx                # Multi-step create/edit form
│   └── FarmerDetail.tsx              # Tabbed detail view
```

### shadcn Components Needed

| Component | Status | Usage |
|-----------|--------|-------|
| `Tabs` | ✅ Exists | Farmer detail page |
| `Table` | ✅ Exists | Farmer list |
| `Card` | ✅ Exists | Form steps + review |
| `Dialog` | ✅ Exists | Delete confirmation |
| `Badge` | ✅ Exists | Status chips |
| `Input` | ✅ Exists | Form fields |
| `Label` | ✅ Exists | Form labels |
| `Button` | ✅ Exists | Actions |
| `Checkbox` | **Install** | Row selection |

### Icons (lucide-react)

- `Users` — page header
- `Plus` — "Register Farmer" button
- `Eye` — view detail action
- `Pencil` — edit action
- `Trash2` — delete action
- `Search` — search bar
- `ChevronLeft`, `ChevronRight` — stepper navigation
- `Check` — completed step indicator
- `Sprout` — farm details
- `UserCircle` — personal info

---

## App.tsx Route Changes

```tsx
// Admin routes — add:
<Route path="farmers" element={<AdminFarmerRegistry />} />
<Route path="farmers/:id" element={<FarmerDetail />} />

// Coop routes — add:
<Route path="farmers" element={<CoopFarmerRegistry />} />
<Route path="farmers/new" element={<FarmerForm />} />
<Route path="farmers/:id" element={<FarmerDetail />} />
<Route path="farmers/:id/edit" element={<FarmerForm />} />
```

### Sidebar update

Enable the "Farmer Registry" nav items in `Sidebar.tsx` — remove `disabled: true` for:
- Admin: `{ label: "Farmer Registry", icon: Users, route: "/admin/farmers" }`
- Officer: `{ label: "Farmer Registry", icon: Users, route: "/coop/farmers" }`

---

## Destructive Operations

All destructive operations follow `ui-context.md` modal rules:

### Single delete
- Confirmation Dialog with `AlertTriangle` icon
- Shows farmer name: "Are you sure you want to deactivate **Juan Dela Cruz**?"
- Warning text: "This will deactivate the farmer account and their login credentials."
- `Cancel` + `Deactivate` (destructive variant) buttons

### Bulk delete
- Confirmation Dialog: "Are you sure you want to deactivate **3 farmers**?"
- Lists the farmer names being deactivated
- Same destructive pattern

---

## Check when done

- [ ] `GET /api/farmers` returns all farmers (Admin) with cooperative and crop data
- [ ] `GET /api/farmers/my-coop` returns only the officer's cooperative farmers
- [ ] `GET /api/farmers/:id` returns full farmer detail with products, memberships
- [ ] `POST /api/farmers` creates User + Farmer + FarmerCooperative in a transaction
- [ ] `PUT /api/farmers/:id` updates farmer (Officer, scoped to own coop)
- [ ] `DELETE /api/farmers/:id` soft-deletes farmer + user
- [ ] `DELETE /api/farmers/bulk` bulk soft-deletes
- [ ] Admin farmer table is read-only, shows cooperative column
- [ ] Officer farmer table has CRUD actions, checkboxes, bulk delete
- [ ] Registration form is a multi-step wizard (4 steps), on its own page
- [ ] Step 3 auto-assigns to officer's cooperative
- [ ] Farmer detail page has 4 tabs (Personal, Farm, Memberships, Account)
- [ ] Account tab shows products table
- [ ] Table follows all design rules (bold names, PHP money, abbreviated dates, color-coded status, highlighted header)
- [ ] Search filters farmers by name, farm, or location
- [ ] Selected rows are highlighted
- [ ] Bulk action bar appears on selection
- [ ] Destructive delete dialogs follow `ui-context.md` modal pattern
- [ ] Sidebar "Farmer Registry" items enabled for Admin and Officer
- [ ] No existing routes, components, or models are overridden
