## **Relational Schema** {#relational-schema}

ROLE (roleID, roleName)  
USER (userID, roleID\*, email, password\_hash, createdAt, isDeleted)  
PRIMARY\_COOPERATIVE (primaryCoopID, userID\*, coopName, barangay, municipality, phone, registrationNumber, createdAt, isDeleted)  
FARMER (farmerID, userID*, firstName, middleName, lastName, suffixName, farmName, municipality, barangay, createdAt, isDeleted)

CROPTYPE (cropTypeID, cropName, category)  
PRODUCT (productID, farmerID\*, cropTypeID\*, unitPrice, availableQuantity, qualityGrade, updatedAt, isDeleted)  
FARMER\_COOPERATIVE (farmerCoopID, farmerID\*, primaryCoopID\*, joinedDate, status)

BUYER\_ORDER (orderID, managedBy\*, buyerName, buyerCompany, buyerContact, cropTypeID\*, requestedQuantity, urgencyLevel, orderDate, status, notes)  
COOP\_ASSIGNMENT (assignmentID, orderID\*, primaryCoopID\*, assignedBy\*, assignedDate, quantityRequired, status)  
FARMER\_FULFILLMENT (fulfillmentID, assignmentID\*, farmerID\*, assignedBy\*, quantityCommitted, status, notes)  
DELIVERY\_RECORD (deliveryID, orderID\*, managedBy\*, consolidationDate, deliveryDate, totalTransactionAmount, commissionRateFederation, commissionRateCoop, status, notes)

FARMER\_ACCOUNT (farmerAccountID, farmerID\*, primaryCoopID\*, createdDate, status)  
SALES\_RECORD (salesRecordID, farmerAccountID\*, deliveryID\*, grossAmount, commissionAmount, netAmount, transactionDate, remarks)  
FEE\_RECORD (feeRecordID, farmerAccountID\*, salesRecordID\*, feeType, rate, amount, status)  
LOAN\_RECORD (loanRecordID, farmerAccountID\*, loanAmount, purpose, releaseDate, dueDate, amountRepaid, outstandingBalance, status, approvedBy\*)  
PRINTED\_STATEMENT (printedStatementID, farmerAccountID\*, periodStart, periodEnd, generatedBy\*, generatedDate, totalGrossSales, totalCommission, totalShareCapital, totalLoans, netBalance)  
**Legend: \* \= Foreign Key (FK)**