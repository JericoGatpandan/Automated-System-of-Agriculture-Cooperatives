Read `AGENTS.md` before starting.

# Database Schema and Relationships

## Core Entities

### User
- **Table:** `Users`
- **Columns:**
  - `userID` (PK, Integer, AutoIncrement)
  - `roleID` (FK, Integer)
  - `email` (String, Unique)
  - `passwordHash` (String)
  - `isDeleted` (Boolean)
  - `createdAt` (Timestamp)
- **Relationships:**
  - `belongsTo` Role (via `roleID`)
  - `hasOne` PrimaryCooperative (via `userID`)
  - `hasOne` Farmer (via `userID`)

### Role
- **Table:** `Roles`
- **Columns:**
  - `roleID` (PK, Integer, AutoIncrement)
  - `roleName` (String) - *Values: Admin, Officer, Farmer*

### PrimaryCooperative
- **Table:** `PrimaryCooperatives`
- **Columns:**
  - `primaryCoopID` (PK, Integer, AutoIncrement)
  - `userID` (FK, Integer)
  - `coopName` (String)
  - `barangay` (String)
  - `municipality` (String)
  - `phone` (String)
  - `registrationNumber` (String)
  - `isDeleted` (Boolean)
  - `createdAt` (Timestamp)
- **Relationships:**
  - `belongsTo` User (via `userID`)
  - `hasMany` CoopAssignment (via `primaryCoopID`)
  - `hasMany` FarmerAccount (via `primaryCoopID`)

### Farmer
- **Table:** `Farmers`
- **Columns:**
  - `farmerID` (PK, Integer, AutoIncrement)
  - `userID` (FK, Integer)
  - `firstName` (String)
  - `middleName` (String)
  - `lastName` (String)
  - `suffixName` (String)
  - `farmName` (String)
  - `municipality` (String)
  - `barangay` (String)
  - `isDeleted` (Boolean)
  - `createdAt` (Timestamp)
- **Relationships:**
  - `belongsTo` User (via `userID`)
  - `hasMany` Product (via `farmerID`)
  - `hasMany` FarmerFulfillment (via `farmerID`)
  - `hasMany` FarmerAccount (via `farmerID`)

### CropType
- **Table:** `CropTypes`
- **Columns:**
  - `cropTypeID` (PK, Integer, AutoIncrement)
  - `cropName` (String)
  - `category` (String)
- **Relationships:**
  - `hasMany` Product (via `cropTypeID`)
  - `hasMany` BuyerOrder (via `cropTypeID`)

### Product
- **Table:** `Products`
- **Columns:**
  - `productID` (PK, Integer, AutoIncrement)
  - `farmerID` (FK, Integer)
  - `cropTypeID` (FK, Integer)
  - `unitPrice` (Decimal)
  - `availableQuantity` (Decimal)
  - `qualityGrade` (String)
  - `isDeleted` (Boolean)
  - `updatedAt` (Timestamp)
- **Relationships:**
  - `belongsTo` Farmer (via `farmerID`)
  - `belongsTo` CropType (via `cropTypeID`)

### FarmerCooperative (Many-to-Many Join)
- **Table:** `FarmerCooperatives`
- **Columns:**
  - `farmerCoopID` (PK, Integer, AutoIncrement)
  - `farmerID` (FK, Integer)
  - `primaryCoopID` (FK, Integer)
  - `joinedDate` (Date)
  - `status` (Enum: active, inactive, suspended)

## Transaction Entities

### BuyerOrder
- **Table:** `BuyerOrders`
- **Columns:**
  - `orderID` (PK, Integer, AutoIncrement)
  - `managedBy` (FK, Integer) - *User (FACCS Admin)*
  - `buyerName` (String)
  - `buyerCompany` (String)
  - `buyerContact` (String)
  - `cropTypeID` (FK, Integer)
  - `requestedQuantity` (Decimal)
  - `urgencyLevel` (String)
  - `orderDate` (Date)
  - `status` (Enum: pending, assigned, consolidated, delivered, cancelled)
  - `notes` (Text)
- **Relationships:**
  - `belongsTo` User (via `managedBy`)
  - `belongsTo` CropType (via `cropTypeID`)
  - `hasMany` CoopAssignment (via `orderID`)
  - `hasMany` DeliveryRecord (via `orderID`)

### CoopAssignment
- **Table:** `CoopAssignments`
- **Columns:**
  - `assignmentID` (PK, Integer, AutoIncrement)
  - `orderID` (FK, Integer)
  - `primaryCoopID` (FK, Integer)
  - `assignedBy` (FK, Integer) - *User (FACCS Admin)*
  - `assignedDate` (Date)
  - `quantityRequired` (Decimal)
  - `status` (Enum: pending, matched, ready, cancelled)
- **Relationships:**
  - `belongsTo` BuyerOrder (via `orderID`)
  - `belongsTo` PrimaryCooperative (via `primaryCoopID`)
  - `hasMany` FarmerFulfillment (via `assignmentID`)

### FarmerFulfillment
- **Table:** `FarmerFulfillments`
- **Columns:**
  - `fulfillmentID` (PK, Integer, AutoIncrement)
  - `assignmentID` (FK, Integer)
  - `farmerID` (FK, Integer)
  - `assignedBy` (FK, Integer) - *User (Coop Officer)*
  - `quantityCommitted` (Decimal)
  - `status` (Enum: assigned, confirmed, ready, delivered, cancelled)
  - `notes` (Text)
- **Relationships:**
  - `belongsTo` CoopAssignment (via `assignmentID`)
  - `belongsTo` Farmer (via `farmerID`)

### DeliveryRecord
- **Table:** `DeliveryRecords`
- **Columns:**
  - `deliveryID` (PK, Integer, AutoIncrement)
  - `orderID` (FK, Integer)
  - `managedBy` (FK, Integer) - *User (FACCS Admin)*
  - `consolidationDate` (Date)
  - `deliveryDate` (Date)
  - `totalTransactionAmount` (Decimal)
  - `commissionRateFederation` (Decimal)
  - `commissionRateCoop` (Decimal)
  - `status` (Enum: pending, delivered, cancelled)
  - `notes` (Text)
- **Relationships:**
  - `belongsTo` BuyerOrder (via `orderID`)
  - `hasMany` SalesRecord (via `deliveryID`)

## FarmLedger Accounting Entities

### FarmerAccount
- **Table:** `FarmerAccounts`
- **Columns:**
  - `farmerAccountID` (PK, Integer, AutoIncrement)
  - `farmerID` (FK, Integer)
  - `primaryCoopID` (FK, Integer)
  - `createdDate` (Date)
  - `status` (Enum: active, inactive, suspended)
- **Relationships:**
  - `belongsTo` Farmer (via `farmerID`)
  - `belongsTo` PrimaryCooperative (via `primaryCoopID`)
  - `hasMany` SalesRecord (via `farmerAccountID`)
  - `hasMany` FeeRecord (via `farmerAccountID`)
  - `hasMany` LoanRecord (via `farmerAccountID`)
  - `hasMany` PrintedStatement (via `farmerAccountID`)

### SalesRecord
- **Table:** `SalesRecords`
- **Columns:**
  - `salesRecordID` (PK, Integer, AutoIncrement)
  - `farmerAccountID` (FK, Integer)
  - `deliveryID` (FK, Integer)
  - `grossAmount` (Decimal)
  - `commissionAmount` (Decimal)
  - `netAmount` (Decimal)
  - `transactionDate` (Date)
  - `remarks` (Text)
- **Relationships:**
  - `belongsTo` FarmerAccount (via `farmerAccountID`)
  - `belongsTo` DeliveryRecord (via `deliveryID`)
  - `hasMany` FeeRecord (via `salesRecordID`)

### FeeRecord
- **Table:** `FeeRecords`
- **Columns:**
  - `feeRecordID` (PK, Integer, AutoIncrement)
  - `farmerAccountID` (FK, Integer)
  - `salesRecordID` (FK, Integer)
  - `feeType` (Enum: federationFee, coopFee, capitalContribution, capitalRetention)
  - `rate` (Decimal)
  - `amount` (Decimal)
  - `status` (Enum: recorded, waived)
- **Relationships:**
  - `belongsTo` FarmerAccount (via `farmerAccountID`)
  - `belongsTo` SalesRecord (via `salesRecordID`)

### LoanRecord
- **Table:** `LoanRecords`
- **Columns:**
  - `loanRecordID` (PK, Integer, AutoIncrement)
  - `farmerAccountID` (FK, Integer)
  - `loanAmount` (Decimal)
  - `purpose` (String)
  - `releaseDate` (Date)
  - `dueDate` (Date)
  - `amountRepaid` (Decimal)
  - `outstandingBalance` (Decimal)
  - `status` (Enum: active, partial, paid, overdue)
  - `approvedBy` (FK, Integer) - *User*
- **Relationships:**
  - `belongsTo` FarmerAccount (via `farmerAccountID`)

### PrintedStatement
- **Table:** `PrintedStatements`
- **Columns:**
  - `printedStatementID` (PK, Integer, AutoIncrement)
  - `farmerAccountID` (FK, Integer)
  - `periodStart` (Date)
  - `periodEnd` (Date)
  - `generatedBy` (FK, Integer) - *User*
  - `generatedDate` (Date)
  - `totalGrossSales` (Decimal)
  - `totalCommission` (Decimal)
  - `totalShareCapital` (Decimal)
  - `totalLoans` (Decimal)
  - `netBalance` (Decimal)
- **Relationships:**
  - `belongsTo` FarmerAccount (via `farmerAccountID`)

## Financial Logic Invariants

1. **Deterministic Gross Calculation:** `GrossAmount per farmer = (quantityCommitted / totalFulfilledQuantity) * totalTransactionAmount`.
2. **Commission Chain:** `NetAmount = GrossAmount - (FederationFee + CooperativeFee)`.
3. **Trigger Boundary:** `SalesRecord` and `FeeRecord` entries MUST be generated atomically when a `DeliveryRecord` status changes to `delivered`.
