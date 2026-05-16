# Feature Spec: Database Optimization & Automation

read the `GEMINI.md` for more information about the project and the database structure.

## Goal
Improve the performance, data consistency, and transactional atomicity of the ASAC system by leveraging native MySQL features (Stored Procedures, Triggers, Indexes, Events, and Views). The goal is to offload heavy aggregation and repetitive consistency checks from the Node.js application layer directly to the database engine, ensuring faster query execution and zero data anomalies, even as the system scales to handle thousands of farmers and transactions.

## Proposed Optimizations

### 1. Database Views (Real-time Reporting)
To simplify complex backend queries and speed up dashboard loading:
- **`vw_farmer_ledger_summary`**: 
  - A pre-compiled View that `JOIN`s `Farmer`, `FarmerAccount`, `PrimaryCooperative` and aggregates data from `SalesRecord`, `FeeRecord`, and `LoanRecord`.
  - This allows the backend to execute a simple `SELECT * FROM vw_farmer_ledger_summary WHERE farmerID = X` instead of performing expensive runtime aggregations via Sequelize.

### 2. Triggers & Denormalization (Caching Aggregates)
To prevent the need to `SUM()` thousands of transaction records every time a user views a dashboard:
- **`tr_after_fee_insert`**: 
  - Triggers AFTER INSERT on `FeeRecord`.
  - If the `feeType` is 'capitalContribution' or 'capitalRetention', it automatically increments a cached `totalShareCapital` column on the `FarmerAccount` table.
- **`tr_before_loan_update`**: 
  - Triggers BEFORE UPDATE on `LoanRecord`.
  - Automatically calculates `outstandingBalance = loanAmount - amountRepaid`.
  - If `outstandingBalance <= 0`, it forces the `status` to 'paid'.

### 3. Stored Procedures (Atomic Transactions)
To ensure complex workflows succeed or fail completely without partial writes:
- **`sp_complete_delivery(IN p_deliveryID INT)`**: 
  - Called when a DeliveryRecord is marked "delivered".
  - Automatically fetches all `FarmerFulfillment` records tied to the delivery.
  - Calculates proportional `grossAmount` for each farmer based on delivered quantity.
  - Computes `commissionAmount` (Federation + Coop fees) and `netAmount`.
  - Atomically inserts corresponding `SalesRecord` and `FeeRecord` rows for each farmer.

### 4. Indexing (Faster Lookups & Filtering)
To optimize the most frequently queried columns:
- **`idx_user_email`**: `User(email)` - Optimizes authentication.
- **`idx_farmer_name`**: `Farmer(lastName, firstName)` - Speeds up registry searches.
- **`idx_buyer_order_status_date`**: `BuyerOrder(status, orderDate)` - Optimizes dashboard filtering.
- **`idx_sales_farmer_date`**: `SalesRecord(farmerAccountID, transactionDate)` - Speeds up Ledger and Balance Sheet generation.

### 5. Events (Scheduled Maintenance & Archiving)
To automate background tasks natively in MySQL:
- **`ev_daily_overdue_loans`**: 
  - Runs daily at midnight.
  - Updates `LoanRecord` status to 'overdue' where `dueDate < CURDATE()` and `outstandingBalance > 0`.
- **`ev_monthly_soft_delete_purge`**: 
  - Runs monthly.
  - Hard deletes or archives records (like `Farmer` or `BuyerOrder`) where `isDeleted = 1` and they have been marked deleted for over 30 days, keeping the primary tables lean and fast.

## Implementation Plan

1. **Sequelize Migration:** 
   - Generate a comprehensive migration file: `npx sequelize-cli migration:generate --name add-database-optimizations`.
   - Inside the `up` function, use `queryInterface.sequelize.query()` to execute the raw SQL statements for Views, Procedures, Triggers, Indexes, and Events.
   - Ensure the `down` function contains corresponding `DROP` statements for safe rollbacks.
2. **Model Updates:**
   - Add `totalShareCapital` to the `FarmerAccount` Sequelize model so the caching trigger has a column to update.
3. **Configuration:** 
   - Ensure the MySQL global variable `event_scheduler = ON` is enabled.
