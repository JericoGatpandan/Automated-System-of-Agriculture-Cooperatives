# Inventory-Aware Assignment & Notification Fix

Read `GEMINI.md` first.

## Design

Follow the design system in [01-design-system.md](01-design-system.md) and [ui-context.md](../ui-context.md).

---

## Overview

This spec addresses three related gaps in the Order & Transaction Management flow (see [09-order-management.md](09-order-management.md)):

1. **Admin → Coop Assignment**: When assigning a buyer order to a cooperative, the Admin has no visibility into whether that cooperative's farmers actually grow the requested crop type or how much inventory they hold.
2. **Officer → Farmer Fulfillment**: When assigning a coop assignment to a farmer, the Officer has no visibility into whether the farmer has the matching crop type or available quantity.
3. **Assignment Notifications**: MySQL triggers exist for coop assignment notifications, but Officers are not receiving them due to a `recipientID` lookup bug.

---

## Problem Statement

### No inventory context during assignment

Currently, both the "Assign Cooperative" dialog (Admin, on `OrderDetail`) and the "Assign Farmer" dialog (Officer, on `AssignmentDetail`) are blind dropdowns — they list all cooperatives or all farmers without filtering by crop type or showing available quantities.

This leads to:
- Orders assigned to cooperatives that don't carry the required crop
- Fulfillments assigned to farmers with zero inventory of the requested product
- Manual guesswork and trial-and-error assignment

### Broken assignment notifications

The `after_coop_assignment_insert` trigger (migration `20260516003421`) inserts a notification row with `recipientRole = 'Officer'` and `recipientID = NEW.primaryCoopID`. However, the notification fetch route (`GET /api/notifications`) tries to match `recipientID` against `user.primaryCoopID` on the User model — but the User model does not have a `primaryCoopID` column. Officers are linked to cooperatives through the `PrimaryCooperatives` table (`PrimaryCooperatives.userID`), not via a column on `Users`.

---

## Scope

### In scope

- Redesign the Assign Cooperative dialog to show crop availability per cooperative
- Redesign the Assign Farmer dialog to show crop availability per farmer
- Fix the notification route to correctly resolve an Officer's `primaryCoopID`
- Add a missing trigger for farmer fulfillment notifications (Officer → Farmer assignment)

### Out of scope

- Changes to order creation or the order list page
- Changes to delivery management
- Real-time push notifications (polling or manual refresh is acceptable)

---

## Feature 1: Inventory-Aware Cooperative Assignment

### Context

When an Admin views an order detail (`/admin/orders/:id`) and clicks "Assign Cooperative", the dialog should surface which cooperatives have the required crop type and their aggregate available inventory.

### Proposed UX — Multi-Step Assignment Dialog

#### Step 1: Select Cooperative (with inventory context)

Replace the plain cooperative dropdown with a table/list showing:

| Column | Content | Notes |
|--------|---------|-------|
| Cooperative | `{coopName}` | Bold, left-aligned |
| Crop Match | ✅ or ❌ | Whether any farmer in the coop has a Product matching the order's `cropTypeID` |
| Available Qty | `{totalAvailable} kg` | Sum of `Product.availableQuantity` for matching `cropTypeID` across all farmers in the coop |
| Active Farmers | `{count}` | Number of farmers in the coop who have the matching product |

- Cooperatives **with** the matching crop should appear first (sorted by available quantity descending)
- Cooperatives **without** the crop should still be visible but visually muted (grayed out) — not hidden, since the Admin may still assign for future fulfillment
- The Admin selects a cooperative from this list

#### Step 2: Set Quantity & Confirm

After selecting a cooperative:

- Show the selected cooperative name and its available quantity
- Show the order's remaining unassigned quantity
- Quantity Required input (pre-filled with remaining quantity, capped at available)
- A warning badge if the entered quantity exceeds the cooperative's available stock
- Confirm / Cancel buttons

### API Changes

#### New endpoint: `GET /api/orders/:id/available-coops`

Returns cooperatives with inventory context for the order's crop type.

**Auth**: Admin

**Response**:
```json
{
  "cropType": { "cropTypeID": 1, "cropName": "Rice", "category": "Grain" },
  "cooperatives": [
    {
      "primaryCoopID": 3,
      "coopName": "SARFC",
      "hasCrop": true,
      "totalAvailableQuantity": 1200,
      "farmerCount": 4
    },
    {
      "primaryCoopID": 5,
      "coopName": "BMPC",
      "hasCrop": false,
      "totalAvailableQuantity": 0,
      "farmerCount": 0
    }
  ]
}
```

**Backend logic**:
1. Get the order's `cropTypeID`
2. For each active (non-deleted) cooperative, join through `FarmerCooperative` → `Farmer` → `Product` where `Product.cropTypeID` matches and `Product.isDeleted = false`
3. Aggregate `SUM(Product.availableQuantity)` and `COUNT(DISTINCT Farmer.farmerID)`

---

## Feature 2: Inventory-Aware Farmer Fulfillment

### Context

When an Officer views an assignment detail (`/coop/assignments/:id`) and clicks "Assign Farmer", the dialog should show which farmers in their cooperative have the required crop and how much they have available.

### Proposed UX — Multi-Step Fulfillment Dialog

#### Step 1: Select Farmer (with inventory context)

Replace the plain farmer dropdown with a table/list showing:

| Column | Content | Notes |
|--------|---------|-------|
| Farmer | `{lastName}, {firstName}` | Bold, left-aligned |
| Farm | `{farmName}` | Left-aligned |
| Crop Match | ✅ or ❌ | Whether the farmer has a Product matching the assignment's crop type |
| Available Qty | `{availableQuantity} kg` | From the matching Product record |
| Quality Grade | `{qualityGrade}` | From the matching Product record |

- Farmers **with** the matching crop appear first (sorted by available quantity descending)
- Farmers **without** the crop are visible but muted
- The Officer selects a farmer

#### Step 2: Set Quantity & Confirm

After selecting a farmer:

- Show the farmer's name and their available quantity for this crop
- Show the assignment's remaining uncommitted quantity
- Quantity Committed input (pre-filled with the lesser of remaining quantity and farmer's available)
- A warning badge if the quantity exceeds the farmer's available stock
- Notes textarea (optional)
- Confirm / Cancel buttons

### API Changes

#### New endpoint: `GET /api/assignments/:id/available-farmers`

Returns farmers in the officer's coop with inventory context for the assignment's crop type.

**Auth**: Officer

**Response**:
```json
{
  "cropType": { "cropTypeID": 1, "cropName": "Rice" },
  "farmers": [
    {
      "farmerID": 1,
      "firstName": "Juan",
      "lastName": "Dela Cruz",
      "farmName": "Dela Cruz Farm",
      "hasCrop": true,
      "availableQuantity": 500,
      "qualityGrade": "Premium",
      "productID": 12
    },
    {
      "farmerID": 4,
      "firstName": "Maria",
      "lastName": "Santos",
      "farmName": "Santos Farm",
      "hasCrop": false,
      "availableQuantity": 0,
      "qualityGrade": null,
      "productID": null
    }
  ]
}
```

**Backend logic**:
1. Resolve the officer's `primaryCoopID`
2. Get the assignment's `cropTypeID` (through `CoopAssignment` → `BuyerOrder`)
3. List all active farmers in the coop via `FarmerCooperative`
4. Left-join `Product` where `Product.cropTypeID` matches and `Product.isDeleted = false`
5. Return farmer details with product availability

---

## Feature 3: Fix Assignment Notifications

### Bug: Officer notification lookup fails

**Root cause**: The `GET /api/notifications` route (line 28 of `notification.routes.js`) does:

```js
const user = await db.User.findByPk(req.user.userID);
if (user && user.primaryCoopID) {
  whereClause.recipientID = user.primaryCoopID;
}
```

The `User` model does not have a `primaryCoopID` column. This always evaluates to `undefined`, so `recipientID` is never set, and the route returns an empty array.

**Fix**: Look up the officer's `primaryCoopID` via the `PrimaryCooperatives` table:

```js
if (role === "Officer") {
  const coop = await db.PrimaryCooperative.findOne({
    where: { userID: req.user.userID, isDeleted: false },
    attributes: ["primaryCoopID"],
  });
  if (coop) {
    whereClause.recipientID = coop.primaryCoopID;
  } else {
    return res.json([]);
  }
}
```

### Missing: Farmer fulfillment notification trigger

Currently there is no trigger for when an Officer assigns a farmer to a fulfillment. Add a new MySQL trigger:

```sql
CREATE TRIGGER after_farmer_fulfillment_insert
AFTER INSERT ON FarmerFulfillments
FOR EACH ROW
BEGIN
  INSERT INTO Notifications (recipientRole, recipientID, type, message, referenceId, isRead, createdAt, updatedAt)
  VALUES ('Farmer', NEW.farmerID, 'farmer_fulfillment', 'You have been assigned to fulfill a buyer order.', NEW.fulfillmentID, false, NOW(), NOW());
END;
```

> **Note**: Farmer notification delivery depends on a future Farmer-facing UI. For now, the notification row is created for completeness and can be surfaced when farmer views are built.

---

## Component Changes

### Frontend

| File | Change |
|------|--------|
| `pages/admin/OrderDetail.tsx` | Replace "Assign Cooperative" dialog with multi-step dialog using the new `/available-coops` endpoint |
| `pages/coop/AssignmentDetail.tsx` | Replace "Assign Farmer" dialog with multi-step dialog using the new `/available-farmers` endpoint |

### Backend

| File | Change |
|------|--------|
| `routes/order.routes.js` | Add `GET /api/orders/:id/available-coops` endpoint |
| `routes/assignment.routes.js` | Add `GET /api/assignments/:id/available-farmers` endpoint |
| `routes/notification.routes.js` | Fix Officer `primaryCoopID` lookup to use `PrimaryCooperatives` table |
| New migration | Add `after_farmer_fulfillment_insert` trigger |

---

## Acceptance Criteria

### Inventory-Aware Coop Assignment
- [ ] "Assign Cooperative" dialog shows each cooperative's crop match status and available quantity
- [ ] Cooperatives with matching crop appear first, sorted by available quantity
- [ ] Cooperatives without the crop are visible but visually de-emphasized
- [ ] A warning is shown if assigned quantity exceeds the cooperative's available stock
- [ ] The existing assignment flow (create CoopAssignment, update order status) still works correctly

### Inventory-Aware Farmer Fulfillment
- [ ] "Assign Farmer" dialog shows each farmer's crop match status and available quantity
- [ ] Farmers with matching crop appear first, sorted by available quantity
- [ ] Farmers without the crop are visible but visually de-emphasized
- [ ] A warning is shown if committed quantity exceeds the farmer's available stock
- [ ] The existing fulfillment flow (create FarmerFulfillment, update assignment status) still works correctly

### Notification Fix
- [ ] Officers receive notifications when an order is assigned to their cooperative
- [ ] The `GET /api/notifications` route correctly resolves `primaryCoopID` for Officers
- [ ] Farmer fulfillment trigger creates notification rows for assigned farmers
- [ ] Existing partnership request and delivery confirmation notifications still work
