# 10-Delivery Management

Read `GEMINI.md` first.

## 10 — Delivery Management

### Design

Follow the design system in `context/feature-specs/01-design-system.md` and `context/ui-context.md`. Apply the same data table styling rules defined in `context/feature-specs/08-farmer-registry.md` (highlighted headers, bold record names, abbreviated dates, color-coded status badges, PHP money format, accent sort icons, light borders, increased row height, lucide action icons).

### Overview

Implement the Delivery Management module — the bridge between **Order & Transaction Management** (feature 09) and **FarmLedger Accounting** (future feature). This module handles consolidation, delivery tracking, and — critically — **triggers the automatic generation of SalesRecords and FeeRecords** when a delivery is marked as `delivered`.

The delivery lifecycle:

```
Consolidated Order
  → Admin creates DeliveryRecord (status: pending)
    → Admin marks as "delivered" (sets deliveryDate)
      → System auto-generates SalesRecords + FeeRecords (atomic transaction)
        → BuyerOrder status updates to "completed" if all deliveries done
```

This module is **Admin-only**. Officers and Farmers do not interact with deliveries directly.

### Role Permissions

| Operation | Admin | Officer | Farmer |
|-----------|-------|---------|--------|
| Create delivery records | ✅ | — | — |
| View all deliveries | ✅ | — | — |
| Update delivery (mark delivered) | ✅ | — | — |
| Cancel deliveries | ✅ | — | — |

---

## Data Model (existing — no migrations needed)

### Tables involved

| Table | Key Fields | Purpose |
|-------|------------|---------|
| `DeliveryRecord` | deliveryID, orderID (FK→BuyerOrder), managedBy (FK→User), consolidationDate, deliveryDate, totalTransactionAmount, commissionRateFederation, commissionRateCoop, status, notes | Tracks each delivery for an order |
| `BuyerOrder` | status | Updated to `completed` when all deliveries done |
| `SalesRecord` | salesRecordID, farmerAccountID (FK→FarmerAccount), deliveryID (FK→DeliveryRecord), grossAmount, commissionAmount, netAmount, transactionDate, remarks | **Auto-generated** when delivery is marked `delivered` |
| `FeeRecord` | feeRecordID, farmerAccountID (FK→FarmerAccount), salesRecordID (FK→SalesRecord), feeType, rate, amount, status | **Auto-generated** per SalesRecord (4 fee types) |
| `FarmerAccount` | farmerAccountID, farmerID (FK→Farmer), primaryCoopID (FK→PrimaryCooperative), createdDate, status | Farmer's ledger account per cooperative |

### Key relationships

- One `BuyerOrder` produces one or more `DeliveryRecords` (partial/staged deliveries)
- One `DeliveryRecord` generates many `SalesRecords` (one per fulfilling farmer)
- Each `SalesRecord` generates 4 `FeeRecords` (federationFee, coopFee, capitalContribution, capitalRetention)

### Statuses

#### `DeliveryRecord.status`

| Value | Meaning | Badge Color |
|-------|---------|-------------|
| `pending` | Delivery created, consolidation scheduled | Yellow (`bg-yellow-50 text-yellow-700 border-yellow-500/50`) |
| `delivered` | Delivered to buyer — SalesRecords/FeeRecords generated | Green (`bg-green-50 text-green-700 border-green-500/50`) |
| `cancelled` | Delivery cancelled | Gray (`bg-gray-50 text-gray-500 border-gray-300`) |

> **Note**: The original model uses `pending` / `delivered` / `cancelled` — not the `planned` / `pickedUp` / `completed` from your draft. Keeping aligned with the actual Sequelize model and seeded data.

#### `BuyerOrder.status` auto-update

When a delivery status changes to `delivered`:
1. Check ALL `DeliveryRecords` for that order
2. If ALL have `status === 'delivered'` → set order to `completed`
3. Otherwise, order remains at its current status

---

## Accounting Logic (the critical piece)

### Trigger: delivery status changes to `delivered`

When Admin marks a delivery as `delivered`, the backend **atomically** (single Sequelize transaction):

#### Step 1 — Identify fulfilling farmers

Query: From the delivery's `BuyerOrder` → `CoopAssignments` → `FarmerFulfillments` where `status IN ('confirmed', 'ready')`.

Collect each farmer's `farmerID`, `quantityCommitted`, and the cooperative (`primaryCoopID`) from their assignment.

#### Step 2 — Calculate proportional gross amounts

Per the project spec formula:

```
GrossAmount_i = (Qi / QT) × T
```

Where:
- `Qi` = quantity committed by farmer i
- `QT` = total fulfilled quantity across all farmers
- `T` = `totalTransactionAmount` from the DeliveryRecord

#### Step 3 — Calculate commissions per farmer

Using the delivery's `commissionRateFederation` (RF) and `commissionRateCoop` (RC):

```
FederationFee = GrossAmount × RF
CooperativeFee = GrossAmount × RC
CommissionAmount = FederationFee + CooperativeFee
NetAmount = GrossAmount - CommissionAmount
```

#### Step 4 — Create/find FarmerAccount

For each farmer, find or create a `FarmerAccount` with `farmerID` + `primaryCoopID` from their assignment.

#### Step 5 — Create SalesRecord

```json
{
  "farmerAccountID": <resolved>,
  "deliveryID": <this delivery>,
  "grossAmount": <calculated>,
  "commissionAmount": <calculated>,
  "netAmount": <calculated>,
  "transactionDate": <deliveryDate>,
  "remarks": "Auto-generated from delivery DEL-{deliveryID}"
}
```

#### Step 6 — Create 4 FeeRecords per SalesRecord

| feeType | rate | amount |
|---------|------|--------|
| `federationFee` | `commissionRateFederation` | `GrossAmount × RF` |
| `coopFee` | `commissionRateCoop` | `GrossAmount × RC` |
| `capitalContribution` | TBC (default `0.00`) | `0.00` |
| `capitalRetention` | TBC (default `0.00`) | `0.00` |

> Capital contribution/retention rates are TBC per spec. Default to `0.00` for now — they can be updated when FACCS confirms the rates.

All steps happen inside a single `db.sequelize.transaction()`. If any step fails, the entire operation rolls back.

---

## Admin Pages

### 1. Delivery List (`/admin/deliveries`)

A table listing all delivery records with status filtering.

#### Table columns

| Column | Content | Align |
|--------|---------|-------|
| Delivery # | `DEL-{deliveryID}` — **bold** | Left |
| Order # | `ORD-{orderID}` (link to order detail) | Left |
| Buyer | `{buyerName}` from BuyerOrder | Left |
| Consolidation | `{consolidationDate}` in `05 Oct 2024` format | Left |
| Delivery Date | `{deliveryDate}` or "—" if pending | Left |
| Amount | `PHP {totalTransactionAmount}` right-aligned, mono | Right |
| Fed Rate | `{commissionRateFederation × 100}%` | Right |
| Coop Rate | `{commissionRateCoop × 100}%` | Right |
| Status | Color-coded Badge | Center |
| Actions | `Eye` (view), `Pencil` (edit) | Right |

#### Toolbar

- Status filter dropdown (All, Pending, Delivered, Cancelled)
- "New Delivery" button

### 2. Delivery Form (`/admin/deliveries/new` and `/admin/deliveries/:id/edit`)

A single-page form for creating/editing deliveries.

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| Order | select dropdown (orders with status `consolidated` or `inProgress`) | ✅ | Must pick from eligible orders |
| Consolidation Date | date | ✅ | — |
| Delivery Date | date | — | Set when marking as delivered |
| Total Transaction Amount | number (PHP) | ✅ | Must be > 0 |
| Federation Commission Rate | number (decimal) | ✅ | 0.00–1.00 (default: 0.03) |
| Cooperative Commission Rate | number (decimal) | ✅ | 0.00–1.00 (default: 0.05) |
| Notes | textarea | — | — |

On create: `managedBy` auto-set to Admin's userID, `status` defaults to `pending`.

### 3. Delivery Detail (`/admin/deliveries/:id`)

Two-section layout:

#### Section A — Delivery Information (Card)

Read-only fields: Delivery #, Order # (with buyer name), Consolidation Date, Delivery Date, Amount (PHP), Commission Rates, Status, Notes.

Action buttons:
- **Edit** → navigate to edit form
- **Mark as Delivered** → opens confirmation dialog (only if status is `pending`)
- **Cancel Delivery** → opens destructive confirmation dialog (only if status is `pending`)

#### Section B — Generated Sales Records (Card below Section A)

A read-only table showing SalesRecords generated for this delivery. **Only visible when status is `delivered`**.

| Column | Content | Align |
|--------|---------|-------|
| Farmer | `{lastName}, {firstName}` — **bold** | Left |
| Cooperative | `{coopName}` | Left |
| Gross | `PHP {grossAmount}` | Right |
| Commission | `PHP {commissionAmount}` | Right |
| Net | `PHP {netAmount}` | Right |
| Date | `{transactionDate}` abbreviated | Left |

---

## Destructive Operations

### Mark as Delivered

- Confirmation Dialog with `Truck` icon (not destructive — uses primary color)
- Message: "Mark **DEL-{id}** as delivered? This will generate sales and fee records for all fulfilling farmers. This action cannot be undone."
- Shows: Total amount, commission rates, number of farmers that will receive records
- `Cancel` + `Confirm Delivery` (primary variant) buttons

### Cancel Delivery

- Only if status is `pending`
- Destructive Dialog with `AlertTriangle`
- Message: "Cancel **DEL-{id}**? No accounting records have been generated for this delivery."
- `Cancel` + `Confirm Cancel` (destructive variant) buttons

---

## API Endpoints

### Delivery routes (`backend/routes/delivery.routes.js`, mounted at `/api/deliveries`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/deliveries` | Admin | List all deliveries with BuyerOrder |
| `GET` | `/api/deliveries/:id` | Admin | Detail with BuyerOrder + generated SalesRecords |
| `POST` | `/api/deliveries` | Admin | Create delivery record |
| `PUT` | `/api/deliveries/:id` | Admin | Update delivery fields (not status) |
| `PUT` | `/api/deliveries/:id/deliver` | Admin | Mark as delivered → triggers accounting |
| `PUT` | `/api/deliveries/:id/cancel` | Admin | Cancel delivery |

### `GET /api/deliveries` response

```json
{
  "deliveries": [
    {
      "deliveryID": 1,
      "orderID": 1,
      "consolidationDate": "2024-09-20T00:00:00.000Z",
      "deliveryDate": "2024-09-22T00:00:00.000Z",
      "totalTransactionAmount": "45000",
      "commissionRateFederation": "0.03",
      "commissionRateCoop": "0.05",
      "status": "delivered",
      "notes": "Full delivery for Order 1",
      "BuyerOrder": {
        "orderID": 1,
        "buyerName": "NFA Regional Office",
        "buyerCompany": "National Food Authority"
      }
    }
  ]
}
```

### `POST /api/deliveries` request

```json
{
  "orderID": 1,
  "consolidationDate": "2024-09-20",
  "totalTransactionAmount": 45000,
  "commissionRateFederation": 0.03,
  "commissionRateCoop": 0.05,
  "notes": "Full delivery for Order 1"
}
```

### `PUT /api/deliveries/:id/deliver` — the key endpoint

Request body:
```json
{
  "deliveryDate": "2024-09-22"
}
```

Backend logic (inside transaction):
1. Validate delivery exists and status is `pending`
2. Set `status = 'delivered'`, `deliveryDate = body.deliveryDate`
3. Resolve all fulfilling farmers from the order chain
4. Calculate proportional amounts per farmer
5. Create/find `FarmerAccount` per farmer+coop
6. Create `SalesRecord` per farmer
7. Create 4 `FeeRecords` per SalesRecord
8. Sync BuyerOrder status (check if all deliveries for this order are now `delivered`)
9. Commit transaction

Response:
```json
{
  "message": "Delivery completed. Generated 3 sales records and 12 fee records.",
  "salesRecordsCreated": 3,
  "feeRecordsCreated": 12
}
```

---

## Component Structure

```
frontend/src/pages/
├── admin/
│   ├── DeliveryList.tsx               # Delivery table with status filter
│   ├── DeliveryForm.tsx               # Create/edit delivery
│   └── DeliveryDetail.tsx             # Delivery info + sales records table
```

### shadcn Components Needed

All components already exist from previous features:
- `Table`, `Card`, `Dialog`, `Badge`, `Input`, `Label`, `Button`, `Select`, `Textarea`, `Progress`

### Icons (lucide-react)

- `Truck` — page header, mark-delivered dialog
- `Plus` — "New Delivery" button
- `Eye` — view detail
- `Pencil` — edit action
- `AlertTriangle` — cancel dialog
- `Search` — search bar (if added)
- `Package` — amount display
- `Check` — delivered confirmation

---

## App.tsx Route Changes

```tsx
// Admin routes — add:
<Route path="deliveries" element={<DeliveryList />} />
<Route path="deliveries/new" element={<DeliveryForm />} />
<Route path="deliveries/:id" element={<DeliveryDetail />} />
<Route path="deliveries/:id/edit" element={<DeliveryForm />} />
```

### Sidebar update

Enable the nav item in `Sidebar.tsx` — remove `disabled: true` for:
- Admin: `{ label: "Deliveries", icon: Truck, route: "/admin/deliveries" }`

---

## Check when done

- [ ] `GET /api/deliveries` returns all delivery records with order data
- [ ] `GET /api/deliveries/:id` returns delivery with BuyerOrder and SalesRecords
- [ ] `POST /api/deliveries` creates delivery with status `pending`
- [ ] `PUT /api/deliveries/:id` updates delivery fields
- [ ] `PUT /api/deliveries/:id/deliver` atomically: sets delivered + generates SalesRecords + FeeRecords
- [ ] Proportional distribution: each farmer gets `(Qi/QT) × T` as grossAmount
- [ ] Commission formula: `FedFee = Gross × RF`, `CoopFee = Gross × RC`, `Net = Gross - Fed - Coop`
- [ ] 4 FeeRecords per SalesRecord (federationFee, coopFee, capitalContribution, capitalRetention)
- [ ] FarmerAccount is created if it doesn't exist for the farmer+coop pair
- [ ] BuyerOrder status updates to `completed` when all deliveries are `delivered`
- [ ] `PUT /api/deliveries/:id/cancel` sets status to `cancelled`
- [ ] Delivery list with status filter, PHP-formatted amounts, commission rate percentages
- [ ] Delivery form loads eligible orders (consolidated/inProgress)
- [ ] Delivery detail shows generated sales records when status is `delivered`
- [ ] "Mark as Delivered" confirmation shows count of farmers to be paid
- [ ] Cancel dialog follows destructive pattern from `ui-context.md`
- [ ] Sidebar "Deliveries" nav item enabled for Admin
- [ ] All accounting operations are atomic (single transaction, rollback on error)
- [ ] No existing routes, components, or models are overridden