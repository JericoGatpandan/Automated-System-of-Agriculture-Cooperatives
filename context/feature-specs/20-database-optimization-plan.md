# Database Optimization Plan (Phase 2)

## Goal

Improve database performance and consistency by pushing heavy, repeatable ledger and delivery logic into MySQL. This plan builds on the existing optimization migration and avoids duplicate objects.

## Current State (Already Implemented)

- View: `vw_farmer_ledger_summary`
- Triggers:
  - `tr_after_fee_insert` (updates `FarmerAccounts.totalShareCapital`)
  - `tr_before_loan_update` (recalculates `outstandingBalance`, sets status to paid)
- Stored Procedure: `sp_complete_delivery`
- Events: `ev_daily_overdue_loans`, `ev_monthly_soft_delete_purge`
- Indexes: `idx_user_email`, `idx_farmer_name`, `idx_buyer_order_status_date`, `idx_sales_farmer_date`

## Gaps Observed

- Delivery completion still handled in Node.js; procedure exists but is not wired or fully generating FeeRecords.
- Ledger/statement aggregation runs multiple queries per request (sales, fees, loans, statuses) with repeated scans.
- No indexes for frequent joins on assignment/fulfillment/delivery, or for fee/loan lookups.
- No stored procedures for statement generation or ledger refresh.

## Proposed Stored Procedures (5 total)

1. **`sp_complete_delivery_v2(p_delivery_id INT)`**
   - Replace the Node.js delivery completion logic.
   - Generates SalesRecords and FeeRecords for all delivered fulfillments.
   - Updates DeliveryRecord status to delivered.
   - Re-evaluates BuyerOrder status when all deliveries are complete.

2. **`sp_generate_statement(p_farmer_account_id INT, p_start DATE, p_end DATE)`**
   - Calculates totalGrossSales, totalCommission, totalShareCapital, totalLoans, netBalance.
   - Inserts a PrintedStatement snapshot (single transaction).
   - Returns the newly created statement row for the API.

3. **`sp_refresh_loan_statuses(p_farmer_account_id INT)`**
   - Recomputes status for all loans under the account (active/partial/overdue/paid).
   - Aligns with existing application logic in ledger routes.

4. **`sp_get_account_ledger_summary(p_farmer_account_id INT, p_start DATE, p_end DATE)`**
   - Returns a single-row summary of sales totals, fee totals, and outstanding loans.
   - Used by ledger detail page to avoid multiple SUM calls.

5. **`sp_build_coop_ledger_summary(p_primary_coop_id INT, p_start DATE, p_end DATE)`**
   - Returns a list of farmer accounts and summary totals for coop ledger list.
   - Uses indexed joins and aggregated subqueries.

## Proposed Triggers

- **`tr_after_sales_insert`**
  - If needed, update cached totals per farmer account for faster summaries.
  - This will only be added if we introduce cached columns in FarmerAccounts.
- Keep existing triggers unchanged unless procedure logic requires adjustment.

## Proposed Indexes

Targeted to match existing query patterns in routes:

- `idx_farmer_accounts_farmer_coop` on `FarmerAccounts(farmerID, primaryCoopID)`
- `idx_farmer_coops_primary_status` on `FarmerCooperatives(primaryCoopID, status)`
- `idx_coop_assignments_order` on `CoopAssignments(orderID, primaryCoopID)`
- `idx_fulfillments_assignment_status` on `FarmerFulfillments(assignmentID, status)`
- `idx_delivery_order_status` on `DeliveryRecords(orderID, status)`
- `idx_sales_delivery` on `SalesRecords(deliveryID)`
- `idx_fee_account_type` on `FeeRecords(farmerAccountID, feeType)`
- `idx_loan_account_status_due` on `LoanRecords(farmerAccountID, status, dueDate)`

## Migration Plan (Single Complete Migration)

Create one new migration that includes all objects and has full rollback:

- **Up**
  - Create/replace procedures listed above.
  - Add new indexes (skip ones already present).
  - Add triggers only if new cached columns are introduced.
- **Down**
  - Drop the new procedures.
  - Drop any new triggers.
  - Drop the new indexes.

## Backend Integration Plan

- Update delivery completion endpoint to call `sp_complete_delivery_v2`.
- Update statement endpoint to call `sp_generate_statement` and return the inserted statement.
- Update ledger endpoints to call summary procedures where appropriate.

## Validation Plan

- Compare results between current Node.js aggregation and procedure outputs for a few farmer accounts.
- Run delivery completion and confirm:
  - SalesRecords and FeeRecords are created correctly.
  - Delivery status and BuyerOrder status are updated.
- Verify new indexes are used via `EXPLAIN` on the core ledger and delivery queries.

## Open Questions

- Should cached columns for totalGrossSales/totalCommission/totalNet be added to FarmerAccounts, or keep them computed via procedures?
    answer: Keep them computed, relying on your PrintedStatement as your historical cache.
- Should monthly purge event include additional tables besides Farmers and BuyerOrders?
    answer: Do not purge Farmers, BuyerOrders, or any transactional data. Only purge your Audit Logs.

## Next Step

Confirm the stored procedure list and whether cached totals should be added. Once approved, implementation will start with the migration and backend updates.
