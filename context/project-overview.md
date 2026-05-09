# Automated System of Agriculture Cooperatives (ASAC)

## Overview

ASAC is a digital cooperative management system for the Federation of Agriculture Cooperatives in Camarines Sur (FACCS). It bridges the gap between market demand and farmer supply through two core modules: **Order & Transaction Management** and **FarmLedger Accounting**.

## Core Modules

### 1. Order and Transaction Management
- **Federation Level (FACCS Admin)**: Logs buyer orders, assigns them to primary cooperatives, and coordinates deliveries.
- **Cooperative Level (Coop Officer)**: Manages farmer registry, matches farmers to orders, and confirms harvest readiness.
- **Delivery Management**: Tracks harvest consolidation and delivery to buyers.

### 2. FarmLedger Accounting
- **Automatic Recording**: Triggered by delivery completion. Generates SalesRecords and FeeRecords.
- **Farmer Ledger**: Tracks gross sales, commissions (Federation vs Coop), Share Capital (Contribution vs Retention), and Net Earnings.
- **Loan Management**: Coop Officers record loan releases and repayments.
- **Reporting**: Generates the **Printable Farmer Balance Sheet** for meetings and audits.

## Key Principles

- **Officer-Operated Model**: Designed for traditional farmers who may not use smartphones. Officers handle all data entry.
- **Two-Tier Governance**: Clearly defined responsibilities for FACCS Admin (Federation) vs Coop Officers (Primary).
- **Deterministic Logic**: Proportional allocation of delivery amounts among multiple fulfilling farmers.
- **Financial Auditability**: Every transaction follows a strict formula-based computation for fees and capital.

## Prototype Requirements (Semester Minimum)

To be considered a finished prototype for the current semester, the system must implement and demonstrate these three core modules:

1. **Cooperative & Farmer Registry Module**: Management of 18 primary cooperatives and their farmer-members, including crop listings and profiles.
2. **Order & Transaction Management Module**: Full lifecycle from buyer order intake (FACCS Admin) to cooperative assignment and farmer fulfillment (Coop Officer).
3. **FarmLedger Accounting Module**: Automatic generation of sales/fee records upon delivery completion and generation of printable farmer balance sheets.

*Note: While these three modules represent the minimum scope for delivery this semester, the project is designed for continued development and expansion.*

