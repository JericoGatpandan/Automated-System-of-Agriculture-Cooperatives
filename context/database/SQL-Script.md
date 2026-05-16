# **SOURCE CODE** {#source-code}

\-- ASAC DATABASE  
\-- Accounting System of Agriculture Cooperatives

CREATE DATABASE ASAC\_DB;  
USE ASAC\_DB;

\-- ROLE

CREATE TABLE Role (  
  roleID INT PRIMARY KEY AUTO\_INCREMENT,  
  roleName VARCHAR(50)  NOT NULL  
);

\-- USER

CREATE TABLE User (  
  userID INT PRIMARY KEY AUTO\_INCREMENT,  
  roleID INT NOT NULL,  
  email  VARCHAR(100)  NOT NULL UNIQUE,  
  password\_hash VARCHAR(255)  NOT NULL,  
  createdAt DATETIME  DEFAULT CURRENT\_TIMESTAMP,  
  isDeleted BOOLEAN DEFAULT 0,  
  FOREIGN KEY (roleID) REFERENCES Role(roleID)  
);

\-- PRIMARY COOPERATIVE

CREATE TABLE PrimaryCooperative (  
  primaryCoopID  INT PRIMARY KEY AUTO\_INCREMENT,  
  userID INT,  
  coopName VARCHAR(100),  
  barangay VARCHAR(100),  
  municipality VARCHAR(100),  
  phone  VARCHAR(20),  
  registrationNumber VARCHAR(50),  
  createdAt DATETIME DEFAULT CURRENT\_TIMESTAMP,  
  isDeleted BOOLEAN  DEFAULT 0,  
  FOREIGN KEY (userID) REFERENCES User(userID)  
);

\-- FARMER

CREATE TABLE Farmer (  
  farmerID INT PRIMARY KEY AUTO\_INCREMENT,  
  userID INT NULL,  
  firstName  VARCHAR(50),  
  middleName VARCHAR(50),  
  lastName VARCHAR(50),  
  suffixName VARCHAR(10),  
  farmName VARCHAR(100),  
municipality VARCHAR(100),
barangay VARCHAR(100),

  createdAt  DATETIME DEFAULT CURRENT\_TIMESTAMP,  
  isDeleted  BOOLEAN  DEFAULT 0,  
  FOREIGN KEY (userID) REFERENCES User(userID)  
);

\-- CROP TYPE

CREATE TABLE CropType (  
  cropTypeID INT  PRIMARY KEY AUTO\_INCREMENT,  
  cropName VARCHAR(50),  
  category VARCHAR(50)  
);

\-- PRODUCT

CREATE TABLE Product (  
  productID  INT  PRIMARY KEY AUTO\_INCREMENT,  
  farmerID INT,  
  cropTypeID INT,  
  unitPrice  DECIMAL(10,2),  
  availableQuantity INT,  
  qualityGrade  VARCHAR(10),  
  updatedAt  DATETIME,  
  isDeleted  BOOLEAN DEFAULT 0,  
  FOREIGN KEY (farmerID) REFERENCES Farmer(farmerID),  
  FOREIGN KEY (cropTypeID) REFERENCES CropType(cropTypeID)  
);

\-- FARMER COOPERATIVE

CREATE TABLE FarmerCooperative (  
  farmerCoopID  INT  PRIMARY KEY AUTO\_INCREMENT,  
  farmerID  INT,  
  primaryCoopID INT,  
  joinedDate  DATE,  
  status VARCHAR(20),  
  FOREIGN KEY (farmerID)  REFERENCES Farmer(farmerID),  
  FOREIGN KEY (primaryCoopID) REFERENCES PrimaryCooperative(primaryCoopID)  
);

\-- BUYER ORDER

CREATE TABLE BuyerOrder (  
  orderID INT PRIMARY KEY AUTO\_INCREMENT,  
  managedBy  INT,  
  buyerName  VARCHAR(100),  
  buyerCompany  VARCHAR(100),  
  buyerContact  VARCHAR(50),  
  cropTypeID INT,  
  requestedQuantity INT,  
  urgencyLevel  VARCHAR(20),  
  orderDate  DATE,  
  status  VARCHAR(20),  
  notes TEXT,  
  FOREIGN KEY (managedBy)  REFERENCES User(userID),  
  FOREIGN KEY (cropTypeID) REFERENCES CropType(cropTypeID)  
);

\-- COOP ASSIGNMENT

CREATE TABLE CoopAssignment (  
  assignmentID INT  PRIMARY KEY AUTO\_INCREMENT,  
  orderID INT,  
  primaryCoopID  INT,  
  assignedBy INT,  
  assignedDate DATE,  
  quantityRequired INT,  
  status VARCHAR(20),  
  FOREIGN KEY (orderID) REFERENCES BuyerOrder(orderID),  
  FOREIGN KEY (primaryCoopID) REFERENCES PrimaryCooperative(primaryCoopID),  
  FOREIGN KEY (assignedBy)  REFERENCES User(userID)  
);

\-- FARMER FULFILLMENT

CREATE TABLE FarmerFulfillment (  
  fulfillmentID INT  PRIMARY KEY AUTO\_INCREMENT,  
  assignmentID  INT,  
  farmerID INT,  
  assignedBy INT,  
  quantityCommitted INT,  
  status  VARCHAR(20),  
  notes TEXT,  
  FOREIGN KEY (assignmentID) REFERENCES CoopAssignment(assignmentID),  
  FOREIGN KEY (farmerID) REFERENCES Farmer(farmerID),  
  FOREIGN KEY (assignedBy) REFERENCES User(userID)  
);

\-- DELIVERY RECORD

CREATE TABLE DeliveryRecord (  
  deliveryID INT  PRIMARY KEY AUTO\_INCREMENT,  
  orderID INT,  
  managedBy  INT,  
  consolidationDate DATE,  
  deliveryDate DATE,  
  totalTransactionAmount DECIMAL(12,2),  
  commissionRateFederation DECIMAL(5,2),  
  commissionRateCoop DECIMAL(5,2),  
  status  VARCHAR(20),  
  notes TEXT,  
  FOREIGN KEY (orderID)  REFERENCES BuyerOrder(orderID),  
  FOREIGN KEY (managedBy)  REFERENCES User(userID)  
);

\-- FARMER ACCOUNT

CREATE TABLE FarmerAccount (  
  farmerAccountID INT  PRIMARY KEY AUTO\_INCREMENT,  
  farmerID INT,  
  primaryCoopID INT,  
  createdDate DATE,  
  status VARCHAR(20),  
  FOREIGN KEY (farmerID)  REFERENCES Farmer(farmerID),  
  FOREIGN KEY (primaryCoopID) REFERENCES PrimaryCooperative(primaryCoopID)  
);

\-- SALES RECORD

CREATE TABLE SalesRecord (  
  salesRecordID INT PRIMARY KEY AUTO\_INCREMENT,  
  farmerAccountID INT,  
  deliveryID  INT,  
  grossAmount DECIMAL(12,2),  
  commissionAmount DECIMAL(12,2),  
  netAmount DECIMAL(12,2),  
  transactionDate DATE,  
  remarks  TEXT,  
  FOREIGN KEY (farmerAccountID) REFERENCES FarmerAccount(farmerAccountID),  
  FOREIGN KEY (deliveryID)  REFERENCES DeliveryRecord(deliveryID)  
);

\-- FEE RECORD

CREATE TABLE FeeRecord (  
  feeRecordID INT PRIMARY KEY AUTO\_INCREMENT,  
  farmerAccountID INT,  
  salesRecordID INT,  
  feeType  VARCHAR(50),  
  rate  DECIMAL(5,2),  
  amount DECIMAL(12,2),  
  status VARCHAR(20),  
  FOREIGN KEY (farmerAccountID) REFERENCES FarmerAccount(farmerAccountID),  
  FOREIGN KEY (salesRecordID) REFERENCES SalesRecord(salesRecordID)  
);

\-- LOAN RECORD

CREATE TABLE LoanRecord (  
  loanRecordID  INT PRIMARY KEY AUTO\_INCREMENT,  
  farmerAccountID INT,  
  loanAmount DECIMAL(12,2),  
  purpose VARCHAR(100),  
  releaseDate DATE,  
  dueDate DATE,  
  amountRepaid  DECIMAL(12,2),  
  outstandingBalance DECIMAL(12,2),  
  status  VARCHAR(20),  
  approvedBy INT,  
  FOREIGN KEY (farmerAccountID) REFERENCES FarmerAccount(farmerAccountID),  
  FOREIGN KEY (approvedBy)  REFERENCES User(userID)  
);

\-- PRINTED STATEMENT

CREATE TABLE PrintedStatement (  
  printedStatementID INT PRIMARY KEY AUTO\_INCREMENT,  
  farmerAccountID  INT,  
  periodStart DATE,  
  periodEnd DATE,  
  generatedBy INT,  
  generatedDate  DATE,  
  totalGrossSales  DECIMAL(12,2),  
  totalCommission  DECIMAL(12,2),  
  totalShareCapital  DECIMAL(12,2),  
  totalLoans  DECIMAL(12,2),  
  netBalance  DECIMAL(12,2),  
  FOREIGN KEY (farmerAccountID) REFERENCES FarmerAccount(farmerAccountID),  
  FOREIGN KEY (generatedBy) REFERENCES User(userID)  
);
