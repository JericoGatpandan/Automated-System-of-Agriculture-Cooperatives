# Sequelize CLI Model Generate Commands

Notes:

- Sequelize CLI will add a default `id` and `createdAt`/`updatedAt` unless you edit the generated migrations/models to match your custom primary keys and timestamp columns.
- Column sizes, decimal precision/scale, default values, unique constraints, and foreign keys must be set in the migrations after generation.

```bash
npx sequelize-cli model:generate --name Role --attributes roleID:integer,roleName:string
npx sequelize-cli model:generate --name User --attributes userID:integer,roleID:integer,email:string,password_hash:string,createdAt:date,isDeleted:boolean
npx sequelize-cli model:generate --name PrimaryCooperative --attributes primaryCoopID:integer,userID:integer,coopName:string,barangay:string,municipality:string,phone:string,registrationNumber:string,createdAt:date,isDeleted:boolean
npx sequelize-cli model:generate --name Farmer --attributes farmerID:integer,userID:integer,firstName:string,middleName:string,lastName:string,suffixName:string,farmName:string,farmLocation:string,createdAt:date,isDeleted:boolean
npx sequelize-cli model:generate --name CropType --attributes cropTypeID:integer,cropName:string,category:string
npx sequelize-cli model:generate --name Product --attributes productID:integer,farmerID:integer,cropTypeID:integer,unitPrice:decimal,availableQuantity:integer,qualityGrade:string,updatedAt:date,isDeleted:boolean
npx sequelize-cli model:generate --name FarmerCooperative --attributes farmerCoopID:integer,farmerID:integer,primaryCoopID:integer,joinedDate:date,status:string
npx sequelize-cli model:generate --name BuyerOrder --attributes orderID:integer,managedBy:integer,buyerName:string,buyerCompany:string,buyerContact:string,cropTypeID:integer,requestedQuantity:integer,urgencyLevel:string,orderDate:date,status:string,notes:text
npx sequelize-cli model:generate --name CoopAssignment --attributes assignmentID:integer,orderID:integer,primaryCoopID:integer,assignedBy:integer,assignedDate:date,quantityRequired:integer,status:string
npx sequelize-cli model:generate --name FarmerFulfillment --attributes fulfillmentID:integer,assignmentID:integer,farmerID:integer,assignedBy:integer,quantityCommitted:integer,status:string,notes:text
npx sequelize-cli model:generate --name DeliveryRecord --attributes deliveryID:integer,orderID:integer,managedBy:integer,consolidationDate:date,deliveryDate:date,totalTransactionAmount:decimal,commissionRateFederation:decimal,commissionRateCoop:decimal,status:string,notes:text
npx sequelize-cli model:generate --name FarmerAccount --attributes farmerAccountID:integer,farmerID:integer,primaryCoopID:integer,createdDate:date,status:string
npx sequelize-cli model:generate --name SalesRecord --attributes salesRecordID:integer,farmerAccountID:integer,deliveryID:integer,grossAmount:decimal,commissionAmount:decimal,netAmount:decimal,transactionDate:date,remarks:text
npx sequelize-cli model:generate --name FeeRecord --attributes feeRecordID:integer,farmerAccountID:integer,salesRecordID:integer,feeType:string,rate:decimal,amount:decimal,status:string
npx sequelize-cli model:generate --name LoanRecord --attributes loanRecordID:integer,farmerAccountID:integer,loanAmount:decimal,purpose:string,releaseDate:date,dueDate:date,amountRepaid:decimal,outstandingBalance:decimal,status:string,approvedBy:integer
npx sequelize-cli model:generate --name PrintedStatement --attributes printedStatementID:integer,farmerAccountID:integer,periodStart:date,periodEnd:date,generatedBy:integer,generatedDate:date,totalGrossSales:decimal,totalCommission:decimal,totalShareCapital:decimal,totalLoans:decimal,netBalance:decimal
```
