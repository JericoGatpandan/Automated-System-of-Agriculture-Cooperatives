### **Entities and Attributes** {#entities-and-attributes}

#### Core Entities

* User (userID (PK), roleID (FK), email, password\_hash, createdAt, isDeleted)  
* Role (roleID (PK), roleName)  
* PrimaryCooperative (primaryCoopID (PK), userID (FK), coopName, barangay, municipality, phone, registrationNumber, isDeleted, createdAt)  
* Farmer (farmerID (PK), userID (FK), firstName, middleName, lastName, suffixName, farmName, municipality, barangay, isDeleted, createdAt)
  
* CropType (cropTypeID (PK), cropName, category)  
* Product (productID (PK), farmerID (FK), cropTypeID (FK), unitPrice, availableQuantity, qualityGrade, isDeleted, updatedAt)  
* FarmerCooperative (farmerCoopID (PK), farmerID (FK), primaryCoopID (FK), joinedDate, status(active, inactive, suspended))

#### Transaction Entities

* BuyerOrder (orderID (PK), managedBy (FK) \- userAdmin FACCS, buyerName, buyerCompany, buyerContact, cropTypeID (FK), requestedQuantity , urgencyLevel, orderDate, status(pending, assigned, consolidated, delivered, cancelled), notes)  
* CoopAssignment(assignmentID (PK), orderID (FK), primaryCoopID (FK), assignedBy (FK) \- userAdmin FACCS, assignedDate, quantityRequired, status(pending, matched, ready, cancelled))  
* FarmerFulfillment(fulfillmentID (PK), assignmentID (FK), farmerID (FK), assignedBy (FK) \- coopOfficer, quantityCommitted, status(assigned, confirmed, ready, delivered, cancelled), notes)  
* DeliveryRecord(deliveryID (PK), orderID (FK), managedBy (FK), consolidationDate, deliveryDate, totalTransactionAmount, commissionRateFederation, commissionRateCoop, status(pending, delivered, cancelled), notes)

#### FarmLedger Accounting Entities

* FarmerAccount (farmerAccountID (PK), farmerID(FK), primaryCoopID (FK), createdDate, status(active, inactive, suspended))  
* SalesRecord (salesRecordID (PK), farmerAccountID (FK), deliveryID (FK), grossAmount, commissionAmount, netAmount, transactionDate, remarks)  
* FeeRecord (feeRecordID (PK), farmerAccountID (FK), salesRecordID(FK), feeType(federationFee, coopFee, capitalContribution, capitalRetention), rate, amount, status(recorded, waived))  
* LoanRecord (loanRecordID(PK), farmerAccountID (FK), loanAmount, purpose, releaseDate, dueDate, amountRepaid, outstandingBalance, status (active, partial, paid, overdue), approvedBy(FK) \- user)  
* PrintedStatement (printedStatementID (PK), farmerAccountID (FK),  periodStart, periodEnd, generatedBy (FK) \- user, generatedDate, totalGrossSales, totalCommission, totalShareCapital, totalLoans, netBalance)