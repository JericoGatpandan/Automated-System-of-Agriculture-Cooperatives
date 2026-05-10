# Order & Transaction Management

Read `GEMINI.md` first.

## 09 — Order & Transaction Management

### Design

Follow the design system in `context/feature-specs/01-design-system.md` and `context/ui-context.md`.
Apply the same data table styling rules defined in `context/feature-specs/08-farmer-registry.md` (highlighted headers, bold record names, abbreviated dates, color-coded status badges, PHP money format, accent sort icons, light borders, increased row height, lucide action icons).

### Overview

Implement the Order & Transaction Management module — the third core module of ASAC. This module handles the **referral process** from buyer order intake to cooperative assignment and farmer fulfillment.

The lifecycle flows through four stages:

```
BuyerOrder (Admin creates)
  → CoopAssignment (Admin assigns to cooperatives)
    → FarmerFulfillment (Officer assigns to farmers)
      → DeliveryRecord (Admin manages delivery — separate feature)
```

This feature spec covers **stages 1–3** (orders, assignments, fulfillments). Delivery management is deferred to a later feature.

### Role Permissions

| Operation | Admin | Officer | Farmer |
|-----------|-------|---------|--------|
| Create buyer orders | ✅ | — | — |
| View all orders | ✅ | — | — |
| Update/cancel orders | ✅ | — | — |
| Assign cooperatives to orders | ✅ | — | — |
| View assignments for own coop | — | ✅ | — |
| Assign farmers to fulfillments | — | ✅ | — |
| Update fulfillment status | — | ✅ | — |

---

## Data Model (existing — no migrations needed)

| Table | Key Fields | Purpose |
|-------|------------|---------|
| `BuyerOrder` | orderID, managedBy (FK→User), buyerName, buyerCompany, buyerContact, cropTypeID (FK→CropType), requestedQuantity, urgencyLevel, orderDate, status, notes | Buyer's purchase request |
| `CoopAssignment` | assignmentID, orderID (FK→BuyerOrder), primaryCoopID (FK→PrimaryCooperative), assignedBy (FK→User), assignedDate, quantityRequired, status | Split of an order assigned to a cooperative |
| `FarmerFulfillment` | fulfillmentID, assignmentID (FK→CoopAssignment), farmerID (FK→Farmer), assignedBy (FK→User), quantityCommitted, status, notes | A farmer's commitment to supply for an assignment |
| `CropType` | cropTypeID, cropName, category | Crop reference table |

### Status values

#### BuyerOrder.status
| Value | Meaning |
|-------|---------|
| `pending` | Just created, no cooperatives assigned yet |
| `assigned` | At least one cooperative assigned, but not all matched |
| `inProgress` | All assigned coops have started farmer fulfillment |
| `consolidated` | All fulfillments confirmed, ready for delivery |
| `completed` | Delivery completed (set by future Delivery module) |
| `cancelled` | Order cancelled by Admin |

#### CoopAssignment.status
| Value | Meaning |
|-------|---------|
| `pending` | Assigned to coop, no farmers matched yet |
| `matched` | Farmers assigned but not all confirmed |
| `ready` | All farmers confirmed their commitment |

#### FarmerFulfillment.status
| Value | Meaning |
|-------|---------|
| `assigned` | Farmer assigned by officer, awaiting confirmation |
| `confirmed` | Farmer confirmed and committed quantity |
| `ready` | Harvest ready for pickup |

---

## Admin Pages

### 1. Order List (`/admin/orders`)

A table listing all buyer orders with search and status filtering.

#### Table columns

| Column | Content | Align |
|--------|---------|-------|
| Order # | `ORD-{orderID}` — **bold** | Left |
| Buyer | `{buyerName}` | Left |
| Company | `{buyerCompany}` or "—" | Left |
| Crop | `{cropName}` from CropType | Left |
| Qty | `{requestedQuantity}` | Right |
| Urgency | Color-coded Badge (`high` → red, `normal` → blue) | Center |
| Date | `{orderDate}` in `05 Oct 2024` format | Left |
| Status | Color-coded Badge (see status colors below) | Center |
| Actions | `Eye` (view), `Pencil` (edit), `X` (cancel) | Right |

#### Status badge colors

| Status | Color |
|--------|-------|
| `pending` | `bg-yellow-50 text-yellow-700 border-yellow-500/50` |
| `assigned` | `bg-blue-50 text-blue-700 border-blue-500/50` |
| `inProgress` | `bg-indigo-50 text-indigo-700 border-indigo-500/50` |
| `consolidated` | `bg-green-50 text-green-700 border-green-500/50` |
| `completed` | `bg-emerald-50 text-emerald-700 border-emerald-500/50` |
| `cancelled` | `bg-gray-50 text-gray-500 border-gray-300` |

#### Urgency badge colors

| Level | Color |
|-------|-------|
| `high` | `bg-red-50 text-red-700 border-red-500/50` |
| `normal` | `bg-blue-50 text-blue-700 border-blue-500/50` |

#### Toolbar

- Search bar (buyer name, company)
- Status filter dropdown (All, Pending, Assigned, In Progress, Consolidated, Completed, Cancelled)
- "New Order" button

### 2. Order Form (`/admin/orders/new` and `/admin/orders/:id/edit`)

A single-page form (not a dialog, not multi-step — orders are simpler than farmer registration).

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| Buyer Name | text | ✅ | Min 2 chars |
| Buyer Company | text | — | — |
| Buyer Contact | text | ✅ | — |
| Crop Type | select dropdown | ✅ | Must pick from CropType list |
| Requested Quantity | number | ✅ | Must be > 0 |
| Urgency Level | select | ✅ | `normal` or `high` |
| Order Date | date picker | ✅ | Defaults to today |
| Notes | textarea | — | — |

On create: `managedBy` is automatically set to the logged-in Admin's userID. `status` defaults to `pending`.

### 3. Order Detail (`/admin/orders/:id`)

A comprehensive view showing the order and its downstream assignments. Uses a two-section layout:

#### Section A — Order Information (Card)

Read-only display of all order fields (buyer name, company, contact, crop, quantity, urgency, date, status, notes).

Edit button → navigates to `/admin/orders/:id/edit`
Cancel button → opens destructive confirmation dialog

#### Section B — Cooperative Assignments (Card below Section A)

A table of CoopAssignments linked to this order, plus an "Assign Cooperative" action.

| Column | Content | Align |
|--------|---------|-------|
| Cooperative | `{coopName}` — **bold** | Left |
| Qty Required | `{quantityRequired}` | Right |
| Assigned | `{assignedDate}` in `05 Oct 2024` format | Left |
| Status | Color-coded Badge | Center |
| Actions | `Trash2` (remove assignment) | Right |

**"Assign Cooperative" Dialog** (below the table, triggered by a button):
- Cooperative: select dropdown of active cooperatives
- Quantity Required: number input
- Validation: Total assigned across all cooperatives should not exceed `requestedQuantity`. Show a warning (not block) if it does.

**Remove Assignment**: Destructive confirmation dialog. Only allowed if the assignment has no FarmerFulfillments.

#### Quantity summary bar (above assignments table)

```
Requested: 2,000 kg  |  Assigned: 2,000 kg  |  Remaining: 0 kg
```

With a progress bar showing the assigned/requested ratio.

---

## Officer Pages

### 4. My Assignments (`/coop/assignments`)

A table listing CoopAssignments for the officer's cooperative.

#### Table columns

| Column | Content | Align |
|--------|---------|-------|
| Order # | `ORD-{orderID}` — **bold** | Left |
| Buyer | `{buyerName}` from BuyerOrder | Left |
| Crop | `{cropName}` from BuyerOrder → CropType | Left |
| Qty Required | `{quantityRequired}` | Right |
| Assigned | `{assignedDate}` in `05 Oct 2024` format | Left |
| Status | Color-coded Badge | Center |
| Actions | `Eye` (view assignment detail) | Right |

### 5. Assignment Detail (`/coop/assignments/:id`)

Shows the assignment info and its downstream farmer fulfillments. Two-section layout (mirrors the admin order detail pattern):

#### Section A — Assignment Information (Card)

Read-only: Order # (with buyer name), Crop, Quantity Required, Assigned Date, Status.

#### Section B — Farmer Fulfillments (Card)

A table of FarmerFulfillments linked to this assignment, plus an "Assign Farmer" action.

| Column | Content | Align |
|--------|---------|-------|
| Farmer | `{lastName}, {firstName}` — **bold** | Left |
| Farm | `{farmName}` | Left |
| Qty Committed | `{quantityCommitted}` | Right |
| Status | Color-coded Badge (`assigned` → yellow, `confirmed` → blue, `ready` → green) | Center |
| Notes | `{notes}` truncated | Left |
| Actions | Status update buttons, `Trash2` (remove) | Right |

**"Assign Farmer" Dialog** (triggered by button):
- Farmer: select dropdown of active farmers in this coop who grow the required crop type
- Quantity Committed: number input
- Notes: textarea (optional)
- Validation: Total committed should not exceed assignment's `quantityRequired`

**Status update buttons**: Inline dropdown or button group to move a fulfillment through `assigned` → `confirmed` → `ready`.

**Remove Fulfillment**: Destructive dialog. Only if status is `assigned` (not yet confirmed).

#### Quantity summary bar (above fulfillments table)

```
Required: 800 kg  |  Committed: 800 kg  |  Remaining: 0 kg
```

---

## API Endpoints

### Order routes (`backend/routes/order.routes.js`, mounted at `/api/orders`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/orders` | Admin | List all buyer orders with CropType |
| `GET` | `/api/orders/:id` | Admin | Order detail with CoopAssignments and nested FarmerFulfillments |
| `POST` | `/api/orders` | Admin | Create a new buyer order |
| `PUT` | `/api/orders/:id` | Admin | Update order fields |
| `PUT` | `/api/orders/:id/cancel` | Admin | Set status to `cancelled` |

### Assignment routes (`backend/routes/assignment.routes.js`, mounted at `/api/assignments`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/assignments/my-coop` | Officer | List assignments for officer's cooperative |
| `GET` | `/api/assignments/:id` | Officer | Assignment detail with FarmerFulfillments |
| `POST` | `/api/assignments` | Admin | Create a CoopAssignment for an order |
| `DELETE` | `/api/assignments/:id` | Admin | Remove an assignment (only if no fulfillments) |

### Fulfillment routes (also in `assignment.routes.js`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/assignments/:id/fulfillments` | Officer | Assign a farmer to this assignment |
| `PUT` | `/api/assignments/:assignmentId/fulfillments/:fulfillmentId` | Officer | Update fulfillment status/notes |
| `DELETE` | `/api/assignments/:assignmentId/fulfillments/:fulfillmentId` | Officer | Remove fulfillment (only if `assigned` status) |

### Supporting

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/farmers/crop-types` | Any | List crop types (already exists from farmer routes) |

### `GET /api/orders/:id` response shape

```json
{
  "order": {
    "orderID": 1,
    "buyerName": "NFA Regional Office",
    "buyerCompany": "National Food Authority",
    "buyerContact": "9171110001",
    "requestedQuantity": 2000,
    "urgencyLevel": "high",
    "orderDate": "2024-09-01T00:00:00.000Z",
    "status": "inProgress",
    "notes": "Urgent rice procurement",
    "CropType": { "cropTypeID": 1, "cropName": "Rice", "category": "Grain" },
    "CoopAssignments": [
      {
        "assignmentID": 1,
        "primaryCoopID": 3,
        "quantityRequired": 800,
        "assignedDate": "2024-09-02T00:00:00.000Z",
        "status": "matched",
        "PrimaryCooperative": { "coopName": "SARFC" },
        "FarmerFulfillments": [
          {
            "fulfillmentID": 1,
            "farmerID": 1,
            "quantityCommitted": 400,
            "status": "confirmed",
            "notes": "Ready for pickup",
            "Farmer": { "firstName": "Juan", "lastName": "Dela Cruz", "farmName": "Dela Cruz Farm" }
          }
        ]
      }
    ]
  }
}
```

### `POST /api/orders` request

```json
{
  "buyerName": "NFA Regional Office",
  "buyerCompany": "National Food Authority",
  "buyerContact": "9171110001",
  "cropTypeID": 1,
  "requestedQuantity": 2000,
  "urgencyLevel": "high",
  "orderDate": "2024-09-01",
  "notes": "Urgent rice procurement"
}
```

### `POST /api/assignments` request

```json
{
  "orderID": 1,
  "primaryCoopID": 3,
  "quantityRequired": 800
}
```

Backend auto-sets `assignedBy` to the Admin's userID, `assignedDate` to now, and `status` to `pending`.

### `POST /api/assignments/:id/fulfillments` request

```json
{
  "farmerID": 1,
  "quantityCommitted": 400,
  "notes": "Ready for pickup"
}
```

Backend auto-sets `assignedBy` to the Officer's userID, `status` to `assigned`.

---

## Component Structure

```
frontend/src/pages/
├── admin/
│   ├── OrderList.tsx                  # Admin order table
│   ├── OrderForm.tsx                  # Create/edit order form
│   └── OrderDetail.tsx                # Order detail + assignment management
├── coop/
│   ├── CoopAssignments.tsx            # Officer's assignment list
│   └── AssignmentDetail.tsx           # Assignment detail + fulfillment management
```

### shadcn Components Needed

| Component | Status | Usage |
|-----------|--------|-------|
| `Select` | **Install** | Crop type, urgency, cooperative, and farmer dropdowns |
| `Textarea` | **Install** | Notes field |
| `Progress` | **Install** | Quantity assigned progress bar |
| `Table` | ✅ Exists | All list views |
| `Card` | ✅ Exists | Detail sections |
| `Dialog` | ✅ Exists | Assignment/fulfillment dialogs, cancel confirmation |
| `Badge` | ✅ Exists | Status, urgency |
| `Input` | ✅ Exists | Form fields |
| `Label` | ✅ Exists | Form labels |
| `Button` | ✅ Exists | Actions |
| `Tabs` | ✅ Exists | Could be used in detail views |

### Icons (lucide-react)

- `ShoppingCart` — page header (orders)
- `ClipboardList` — page header (assignments)
- `Plus` — "New Order" / "Assign" buttons
- `Eye` — view detail
- `Pencil` — edit action
- `X` — cancel order
- `Trash2` — remove assignment/fulfillment
- `ArrowRight` — status progression
- `Package` — quantity/crop display
- `AlertTriangle` — destructive dialogs

---

## App.tsx Route Changes

```tsx
// Admin routes — add:
<Route path="orders" element={<OrderList />} />
<Route path="orders/new" element={<OrderForm />} />
<Route path="orders/:id" element={<OrderDetail />} />
<Route path="orders/:id/edit" element={<OrderForm />} />

// Coop routes — add:
<Route path="assignments" element={<CoopAssignments />} />
<Route path="assignments/:id" element={<AssignmentDetail />} />
```

### Sidebar update

Enable the nav items in `Sidebar.tsx` — remove `disabled: true` for:
- Admin: `{ label: "Order Management", icon: ShoppingCart, route: "/admin/orders" }`
- Officer: `{ label: "Assignments", icon: ClipboardList, route: "/coop/assignments" }`

---

## Destructive Operations

### Cancel order
- Confirmation Dialog: "Are you sure you want to cancel order **ORD-1**?"
- Warning: "This will mark the order as cancelled. Existing assignments will remain but cannot progress."
- `Cancel` + `Confirm Cancel` (destructive)

### Remove assignment
- Only allowed if assignment has **zero** FarmerFulfillments
- Dialog: "Remove **SARFC** from order **ORD-1**?"
- Shows the cooperative name and quantity

### Remove fulfillment
- Only allowed if status is `assigned` (not confirmed or ready)
- Dialog: "Remove **Juan Dela Cruz** from this assignment?"

---

## Business Logic

### Order status auto-update

When assignments or fulfillments change, the order status should be updated:

1. **pending** → **assigned**: When the first CoopAssignment is created for the order
2. **assigned** → **inProgress**: When the first FarmerFulfillment is created for any assignment of the order
3. **inProgress** → **consolidated**: When ALL fulfillments across ALL assignments have status `ready`

These transitions are triggered server-side after assignment/fulfillment mutations.

### Assignment status auto-update

1. **pending** → **matched**: When the first FarmerFulfillment is created for this assignment
2. **matched** → **ready**: When ALL fulfillments for this assignment have status `ready` or `confirmed`

---

## Check when done

- [ ] `GET /api/orders` returns all buyer orders with crop type data
- [ ] `GET /api/orders/:id` returns order with nested assignments and fulfillments
- [ ] `POST /api/orders` creates order with status `pending`, `managedBy` auto-set
- [ ] `PUT /api/orders/:id` updates order fields
- [ ] `PUT /api/orders/:id/cancel` sets status to `cancelled`
- [ ] `POST /api/assignments` creates assignment, order status updates to `assigned`
- [ ] `DELETE /api/assignments/:id` blocked if fulfillments exist
- [ ] `GET /api/assignments/my-coop` returns only the officer's cooperative assignments
- [ ] `GET /api/assignments/:id` returns assignment with fulfillments and farmer details
- [ ] `POST /api/assignments/:id/fulfillments` creates fulfillment, assignment status updates
- [ ] `PUT /api/assignments/:assignmentId/fulfillments/:fulfillmentId` updates status/notes
- [ ] `DELETE /api/assignments/:assignmentId/fulfillments/:fulfillmentId` blocked if not `assigned`
- [ ] Admin order list shows search and status filter
- [ ] Admin order form works for create and edit
- [ ] Admin order detail shows assignments table with quantity progress bar
- [ ] Admin can add/remove cooperative assignments via dialog
- [ ] Officer assignments list shows their cooperative's assignments only
- [ ] Officer assignment detail shows fulfillments table with quantity progress bar
- [ ] Officer can assign farmers (scoped to own coop, matching crop type) via dialog
- [ ] Officer can update fulfillment status via inline controls
- [ ] All destructive actions use confirmation dialogs per `ui-context.md`
- [ ] Status badges use the specified color scheme
- [ ] Table follows all design rules (bold names, abbreviated dates, color-coded status, highlighted headers)
- [ ] Sidebar "Order Management" and "Assignments" nav items enabled
- [ ] No existing routes, components, or models are overridden