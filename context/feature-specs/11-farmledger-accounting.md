# Feature 11-FarmLedger Accounting

Read `GEMINI.md` first.

## Design

Follow the design system in `context/feature-specs/01-design-system.md` and `context/ui-context.md`.

## Overview

FarmLedger Accounting is the financial backbone of ASAC. It provides farmer-level ledgers, automatic sales and fee recording triggered by deliveries, loan tracking, and printable balance sheets. It is built for officer-operated workflows and produces deterministic, auditable records.

Key goals:

- Provide a single source of truth for farmer sales, fees, share capital, and loan balances.
- Keep all financial logic deterministic and triggered only by delivery completion.
- Allow printing of a one-page, high-contrast farmer balance sheet for audits and meetings.

## Roles and Permissions

| Operation | Admin | Officer | Farmer |
|-----------|-------|---------|--------|
| View federation summary | ✅ | — | — |
| View cooperative ledger list | ✅ (read-only) | ✅ | — |
| View farmer ledger detail | ✅ (read-only) | ✅ | ✅ (own only) |
| Create loan record | — | ✅ | — |
| Record loan repayment | — | ✅ | — |
| Generate printed statement | ✅ (read-only) | ✅ | ✅ (own only) |

Notes:

- FACCS Admin can view, but cannot edit, cooperative or farmer ledger data.
- Farmers are view-only and can only see their own account(s).

## Data Model (existing)

No new migrations are required. Use existing tables and relationships defined in `context/feature-specs/04-database.md`:

- `FarmerAccount`
- `SalesRecord`
- `FeeRecord`
- `LoanRecord`
- `PrintedStatement`

## Accounting Logic

All accounting records must be generated atomically when a DeliveryRecord is marked `delivered`. This is already implemented in feature 10 and is the only valid trigger.

### Deterministic Calculations

Given:

- Total delivery amount $T$
- Farmer quantity $Q_i$
- Total fulfilled quantity $Q_T$
- Federation rate $R_F$
- Cooperative rate $R_C$

Formulas:
$$
Gross_i = (Q_i / Q_T) \times T
$$
$$
FederationFee_i = Gross_i \times R_F
$$
$$
CoopFee_i = Gross_i \times R_C
$$
$$
Commission_i = FederationFee_i + CoopFee_i
$$
$$
Net_i = Gross_i - Commission_i
$$

### Share Capital Rates (TBC)

The cooperative fee is split into:

- `capitalContribution` (TBC rate)
- `capitalRetention` (TBC rate)

Until confirmed, both rates default to 0.00 and are recorded as zero-amount `FeeRecord` entries.

## Ledger Screens

### 1. Federation Overview (Admin)

Route: `/admin/farmledger`

Purpose: Federation-level read-only summary across all cooperatives.

Cards:

- Total deliveries completed (count)
- Total gross sales (PHP)
- Total federation fees (PHP)
- Total cooperative fees (PHP)
- Total share capital (PHP)

Table: Cooperative summary

- Cooperative name
- Total farmers with accounts
- Total gross sales
- Total net earnings
- Total federation fee
- Total cooperative fee

Actions:

- View cooperative ledger (links to coop detail screen)

### 2. Cooperative Ledger List (Admin, Officer)

Routes:

- Admin: `/admin/farmledger/coops/:coopId`
- Officer: `/officer/farmledger`

Table columns:

- Farmer name (bold)
- Farmer ID
- Total gross sales
- Total commission
- Total share capital
- Outstanding loans
- Net balance
- Status badge (active, inactive, suspended)

Toolbar:

- Search by farmer name
- Status filter
- Period filter (All time, This month, This quarter, Custom)

### 3. Farmer Ledger Detail (Admin read-only, Officer, Farmer view-only)

Routes:

- Admin: `/admin/farmledger/farmers/:farmerId`
- Officer: `/officer/farmledger/farmers/:farmerId`
- Farmer: `/farmer/ledger`

Sections:

1) Farmer summary card
 - Farmer name, cooperative name, account status
 - Totals: gross sales, total commission, total share capital, net balance

2) Sales records table
 - Delivery ID
 - Date
 - Gross
 - Commission
 - Net
 - Remarks

3) Fee breakdown table
 - Fee type (federationFee, coopFee, capitalContribution, capitalRetention)
 - Rate
 - Amount
 - Status

4) Loans table
 - Loan amount
 - Purpose
 - Release date
 - Due date
 - Amount repaid
 - Outstanding balance
 - Status

Actions:

- Officer: Add loan, Record repayment, Generate statement
- Farmer: Generate statement (view-only)

### 4. Printable Farmer Balance Sheet

Route:

- `/officer/farmledger/farmers/:farmerId/statement`
- `/farmer/ledger/statement`

Format:

- Single-page, black on white, no background graphics.
- Includes: farmer name, cooperative name, period, generated date.
- Summary blocks: total gross sales, total commission, total share capital, total loans, net balance.
- Table: sales records and fee totals (condensed).
- Signature lines for Farmer and Officer.

## Loan Management

Only cooperative officers can create or update loan records.

### Add Loan (Officer)

Dialog fields:

- Loan amount (PHP)
- Purpose (text)
- Release date
- Due date

Computed fields:

- Amount repaid defaults to 0
- Outstanding balance defaults to loan amount
- Status defaults to `active`

### Record Repayment (Officer)

Dialog fields:

- Repayment amount
- Repayment date

Validation:

- Repayment amount must be > 0
- Repayment amount cannot exceed outstanding balance

Status update rules:

- `active` -> `partial` when amountRepaid > 0 and < loanAmount
- `partial` -> `paid` when outstandingBalance = 0
- `overdue` if dueDate < today and outstandingBalance > 0

## API Endpoints

### Ledger (new routes)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/ledger/summary` | Admin | Federation summary across cooperatives |
| GET | `/api/ledger/coops/:coopId` | Admin | Cooperative ledger list (read-only) |
| GET | `/api/ledger/coops/me` | Officer | Cooperative ledger list (own coop) |
| GET | `/api/ledger/farmers/:farmerId` | Admin, Officer, Farmer | Farmer ledger detail |
| GET | `/api/ledger/farmers/me` | Farmer | Own ledger detail |
| POST | `/api/ledger/farmers/:farmerId/statement` | Admin, Officer, Farmer | Generate statement snapshot |

### Loan Management (new routes)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/ledger/farmers/:farmerId/loans` | Officer | Create loan |
| PUT | `/api/ledger/loans/:loanId/repayment` | Officer | Record repayment |

Notes:

- Admin endpoints are read-only (no loan creation).
- Farmer endpoints are scoped to own user.

## UI Component Requirements

Use existing shadcn/ui components:

- `Card`, `Table`, `Badge`, `Dialog`, `Input`, `Select`, `Button`, `Tabs`, `ScrollArea`, `Label`, `Textarea`

Styling rules:

- Use semantic CSS variables for colors.
- Apply the table styling rules from `08-farmer-registry.md`.
- Use `IBM Plex Mono` for money values and totals.
- Status badges must be consistent with existing status color mapping.

## Validation and Edge Cases

- Ledger totals must be computed from persisted records (no derived-only totals in UI).
- If a farmer belongs to multiple cooperatives, each cooperative has a separate FarmerAccount and separate ledger totals.
- If no SalesRecords exist, show an empty state with clear guidance.
- If share capital rates are TBC, show rate as `0.00%` and amount as `PHP 0.00`.
- Printed statements are snapshots and must not change after creation.

## Acceptance Checks

- Admin can view federation summary and cooperative breakdown.
- Officer can view cooperative ledger list scoped to own coop.
- Farmer can view their own ledger only.
- Sales and fee records appear immediately after delivery completion.
- Loan creation and repayment update status and balances correctly.
- Printed statement is deterministic and single-page.
- All ledger totals reconcile with SalesRecords and FeeRecords.
